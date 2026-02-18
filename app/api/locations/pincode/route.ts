import City from "@/model/city";
import Pincode from "@/model/pincode";
import { Op } from "sequelize";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";


type PincodePayload = {
  city_id: number;
  pincode: string;
  area_name: string | null;
  status: "active" | "inactive";
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parsePositiveInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function parsePincodeId(request: Request, body?: Record<string, unknown>) {
  const { searchParams } = new URL(request.url);
  const idFromQuery = parsePositiveInteger(searchParams.get("id"));
  const idFromBody = parsePositiveInteger(body?.id);

  if (!Number.isNaN(idFromQuery)) {
    return idFromQuery;
  }

  if (!Number.isNaN(idFromBody)) {
    return idFromBody;
  }

  return Number.NaN;
}

function toValidStatus(value: unknown, fallback: "active" | "inactive" = "active") {
  const status = normalizeText(value);
  if (status === "active" || status === "inactive") {
    return status;
  }
  return fallback;
}

function getRowValue(row: Record<string, unknown>, keys: string[]) {
  const availableKeys = Object.keys(row);
  const match = availableKeys.find((rowKey) =>
    keys.some((key) => rowKey.toLowerCase() === key.toLowerCase()),
  );
  return match ? row[match] : undefined;
}

async function importFromExcel(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Excel file is required" }, { status: 400 });
  }

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { message: "File size must be 10MB or less" },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const workbook = XLSX.read(Buffer.from(bytes), { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return NextResponse.json(
      { message: "Excel file does not contain any sheet" },
      { status: 400 },
    );
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (!rows.length) {
    return NextResponse.json(
      { message: "Excel sheet is empty" },
      { status: 400 },
    );
  }

  const errors: string[] = [];
  const payloads: PincodePayload[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const cityIdValue = getRowValue(row, ["city_id", "cityid", "city id"]);
    const pincodeValue = getRowValue(row, ["pincode", "pin_code", "pin code"]);
    const areaNameValue = getRowValue(row, ["area_name", "area", "area name"]);
    const statusValue = getRowValue(row, ["status"]);

    const cityId = parsePositiveInteger(cityIdValue);
    const pincode = normalizeText(pincodeValue);
    const areaName = normalizeText(areaNameValue) || null;
    const status = toValidStatus(statusValue, "active");

    if (Number.isNaN(cityId)) {
      errors.push(`Row ${rowNumber}: valid city_id is required`);
      return;
    }

    if (!pincode) {
      errors.push(`Row ${rowNumber}: pincode is required`);
      return;
    }

    payloads.push({
      city_id: cityId,
      pincode,
      area_name: areaName,
      status,
    });
  });

  if (!payloads.length) {
    return NextResponse.json(
      { message: "No valid rows found", errors },
      { status: 400 },
    );
  }

  const cityIds = Array.from(new Set(payloads.map((item) => item.city_id)));
  const existingCities = await City.findAll({
    where: { id: { [Op.in]: cityIds } },
    attributes: ["id"],
  });
  const existingCityIdSet = new Set(existingCities.map((city) => Number(city.get("id"))));

  const validPayloads: PincodePayload[] = [];
  payloads.forEach((item, index) => {
    if (!existingCityIdSet.has(item.city_id)) {
      const rowNumber = index + 2;
      errors.push(`Row ${rowNumber}: city_id ${item.city_id} not found`);
      return;
    }
    validPayloads.push(item);
  });

  if (!validPayloads.length) {
    return NextResponse.json(
      { message: "No rows imported because all rows are invalid", errors },
      { status: 400 },
    );
  }

  let created = 0;
  let updated = 0;

  for (const item of validPayloads) {
    const existing = await Pincode.findOne({
      where: {
        city_id: item.city_id,
        pincode: item.pincode,
      },
    });

    if (existing) {
      existing.set("area_name", item.area_name);
      existing.set("status", item.status);
      await existing.save();
      updated += 1;
    } else {
      await Pincode.create(item);
      created += 1;
    }
  }

  return NextResponse.json(
    {
      message: "Pincode excel imported successfully",
      data: {
        totalRows: rows.length,
        validRows: validPayloads.length,
        created,
        updated,
        failedRows: errors.length,
      },
      errors,
    },
    { status: 201 },
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = parsePositiveInteger(searchParams.get("id"));

    if (!Number.isNaN(idParam)) {
      const pincode = await Pincode.findByPk(idParam);

      if (!pincode) {
        return NextResponse.json({ message: "Pincode not found" }, { status: 404 });
      }

      return NextResponse.json(
        { message: "Pincode fetched successfully", data: pincode },
        { status: 200 },
      );
    }

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const cityIdParam = parsePositiveInteger(searchParams.get("city_id"));
    const statusParam = normalizeText(searchParams.get("status"));
    const searchParam = normalizeText(searchParams.get("search"));

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};
    if (!Number.isNaN(cityIdParam)) {
      whereClause.city_id = cityIdParam;
    }
    if (statusParam === "active" || statusParam === "inactive") {
      whereClause.status = statusParam;
    }
    if (searchParam) {
      whereClause.pincode = { [Op.like]: `%${searchParam}%` };
    }

    const { count, rows } = await Pincode.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "Pincode list fetched successfully",
        data: rows,
        pagination: {
          page,
          limit,
          totalItems: count,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch pincode data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      return importFromExcel(request);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const cityId = parsePositiveInteger(body?.city_id);
    const pincode = normalizeText(body?.pincode);
    const areaName = normalizeText(body?.area_name) || null;
    const status = toValidStatus(body?.status, "active");

    if (Number.isNaN(cityId) || !pincode) {
      return NextResponse.json(
        { message: "city_id and pincode are required" },
        { status: 400 },
      );
    }

    const city = await City.findByPk(cityId);
    if (!city) {
      return NextResponse.json({ message: "City not found" }, { status: 404 });
    }

    const existing = await Pincode.findOne({
      where: { city_id: cityId, pincode },
    });
    if (existing) {
      return NextResponse.json(
        { message: "Pincode already exists for this city" },
        { status: 409 },
      );
    }

    const created = await Pincode.create({
      city_id: cityId,
      pincode,
      area_name: areaName,
      status,
    });

    return NextResponse.json(
      { message: "Pincode created successfully", data: created },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create pincode" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const pincodeId = parsePincodeId(request, body);

    if (Number.isNaN(pincodeId)) {
      return NextResponse.json(
        { message: "Valid pincode id is required" },
        { status: 400 },
      );
    }

    const pincodeRecord = await Pincode.findByPk(pincodeId);
    if (!pincodeRecord) {
      return NextResponse.json({ message: "Pincode not found" }, { status: 404 });
    }

    const hasCityId = Object.prototype.hasOwnProperty.call(body, "city_id");
    const hasPincode = Object.prototype.hasOwnProperty.call(body, "pincode");
    const hasAreaName = Object.prototype.hasOwnProperty.call(body, "area_name");
    const hasStatus = Object.prototype.hasOwnProperty.call(body, "status");

    if (!hasCityId && !hasPincode && !hasAreaName && !hasStatus) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    const nextCityId = hasCityId
      ? parsePositiveInteger(body.city_id)
      : Number(pincodeRecord.get("city_id"));
    const nextPincode = hasPincode
      ? normalizeText(body.pincode)
      : normalizeText(pincodeRecord.get("pincode"));

    if (hasCityId && Number.isNaN(nextCityId)) {
      return NextResponse.json({ message: "Valid city_id is required" }, { status: 400 });
    }

    if (hasPincode && !nextPincode) {
      return NextResponse.json({ message: "Pincode cannot be empty" }, { status: 400 });
    }

    if (hasCityId) {
      const city = await City.findByPk(nextCityId);
      if (!city) {
        return NextResponse.json({ message: "City not found" }, { status: 404 });
      }
    }

    if (hasStatus) {
      const status = normalizeText(body.status);
      if (status !== "active" && status !== "inactive") {
        return NextResponse.json(
          { message: "Status must be 'active' or 'inactive'" },
          { status: 400 },
        );
      }
      pincodeRecord.set("status", status);
    }

    if (hasCityId || hasPincode) {
      const duplicate = await Pincode.findOne({
        where: {
          city_id: nextCityId,
          pincode: nextPincode,
          id: { [Op.ne]: pincodeId },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { message: "Pincode already exists for this city" },
          { status: 409 },
        );
      }
    }

    if (hasCityId) {
      pincodeRecord.set("city_id", nextCityId);
    }

    if (hasPincode) {
      pincodeRecord.set("pincode", nextPincode);
    }

    if (hasAreaName) {
      pincodeRecord.set("area_name", normalizeText(body.area_name) || null);
    }

    await pincodeRecord.save();

    return NextResponse.json(
      { message: "Pincode updated successfully", data: pincodeRecord },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update pincode" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const pincodeId = parsePincodeId(request, body);
    if (Number.isNaN(pincodeId)) {
      return NextResponse.json(
        { message: "Valid pincode id is required" },
        { status: 400 },
      );
    }

    const pincodeRecord = await Pincode.findByPk(pincodeId);
    if (!pincodeRecord) {
      return NextResponse.json({ message: "Pincode not found" }, { status: 404 });
    }

    await pincodeRecord.destroy();

    return NextResponse.json(
      { message: "Pincode deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete pincode" },
      { status: 500 },
    );
  }
}
