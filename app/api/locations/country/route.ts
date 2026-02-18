import Country from "@/model/country";
import { NextResponse } from "next/server";
import { Op } from "sequelize";
import * as XLSX from "xlsx";


type CountryPayload = {
  name: string;
  iso_code: string | null;
  phone_code: string | null;
  status: "active" | "inactive";
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parsePositiveInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function parseCountryId(request: Request, body?: Record<string, unknown>) {
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
    return NextResponse.json({ message: "Excel sheet is empty" }, { status: 400 });
  }

  const errors: string[] = [];
  const payloads: CountryPayload[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const nameValue = getRowValue(row, ["name", "country", "country_name", "country name"]);
    const isoCodeValue = getRowValue(row, ["iso_code", "iso", "iso code"]);
    const phoneCodeValue = getRowValue(row, ["phone_code", "phonecode", "phone code"]);
    const statusValue = getRowValue(row, ["status"]);

    const name = normalizeText(nameValue);
    const isoCode = normalizeText(isoCodeValue) || null;
    const phoneCode = normalizeText(phoneCodeValue) || null;
    const status = toValidStatus(statusValue, "active");

    if (!name) {
      errors.push(`Row ${rowNumber}: country name is required`);
      return;
    }

    payloads.push({
      name,
      iso_code: isoCode,
      phone_code: phoneCode,
      status,
    });
  });

  if (!payloads.length) {
    return NextResponse.json(
      { message: "No valid rows found", errors },
      { status: 400 },
    );
  }

  let created = 0;
  let updated = 0;

  for (const item of payloads) {
    const existing = await Country.findOne({ where: { name: item.name } });

    if (existing) {
      if (item.iso_code) {
        const isoInUse = await Country.findOne({
          where: {
            iso_code: item.iso_code,
            id: { [Op.ne]: Number(existing.get("id")) },
          },
        });
        if (isoInUse) {
          errors.push(`Country "${item.name}": iso_code "${item.iso_code}" already used`);
          continue;
        }
      }

      existing.set("iso_code", item.iso_code);
      existing.set("phone_code", item.phone_code);
      existing.set("status", item.status);
      await existing.save();
      updated += 1;
    } else {
      if (item.iso_code) {
        const isoInUse = await Country.findOne({ where: { iso_code: item.iso_code } });
        if (isoInUse) {
          errors.push(`Country "${item.name}": iso_code "${item.iso_code}" already used`);
          continue;
        }
      }

      await Country.create(item);
      created += 1;
    }
  }

  return NextResponse.json(
    {
      message: "Country excel imported successfully",
      data: {
        totalRows: rows.length,
        validRows: payloads.length,
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
      const country = await Country.findByPk(idParam);

      if (!country) {
        return NextResponse.json({ message: "Country not found" }, { status: 404 });
      }

      return NextResponse.json(
        { message: "Country fetched successfully", data: country },
        { status: 200 },
      );
    }

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const statusParam = normalizeText(searchParams.get("status"));
    const searchParam = normalizeText(searchParams.get("search"));

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};
    if (statusParam === "active" || statusParam === "inactive") {
      whereClause.status = statusParam;
    }
    if (searchParam) {
      whereClause.name = { [Op.like]: `%${searchParam}%` };
    }

    const { count, rows } = await Country.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "Country list fetched successfully",
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
      { message: "Failed to fetch country data" },
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
    const name = normalizeText(body?.name);
    const isoCode = normalizeText(body?.iso_code) || null;
    const phoneCode = normalizeText(body?.phone_code) || null;
    const status = toValidStatus(body?.status, "active");

    if (!name) {
      return NextResponse.json({ message: "name is required" }, { status: 400 });
    }

    const existingByName = await Country.findOne({ where: { name } });
    if (existingByName) {
      return NextResponse.json(
        { message: "Country already exists with this name" },
        { status: 409 },
      );
    }

    if (isoCode) {
      const existingByIso = await Country.findOne({ where: { iso_code: isoCode } });
      if (existingByIso) {
        return NextResponse.json(
          { message: "Country already exists with this iso_code" },
          { status: 409 },
        );
      }
    }

    const created = await Country.create({
      name,
      iso_code: isoCode,
      phone_code: phoneCode,
      status,
    });

    return NextResponse.json(
      { message: "Country created successfully", data: created },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create country" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const countryId = parseCountryId(request, body);

    if (Number.isNaN(countryId)) {
      return NextResponse.json(
        { message: "Valid country id is required" },
        { status: 400 },
      );
    }

    const countryRecord = await Country.findByPk(countryId);
    if (!countryRecord) {
      return NextResponse.json({ message: "Country not found" }, { status: 404 });
    }

    const hasName = Object.prototype.hasOwnProperty.call(body, "name");
    const hasIsoCode = Object.prototype.hasOwnProperty.call(body, "iso_code");
    const hasPhoneCode = Object.prototype.hasOwnProperty.call(body, "phone_code");
    const hasStatus = Object.prototype.hasOwnProperty.call(body, "status");

    if (!hasName && !hasIsoCode && !hasPhoneCode && !hasStatus) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    const nextName = hasName ? normalizeText(body.name) : normalizeText(countryRecord.get("name"));
    const nextIsoCode = hasIsoCode
      ? normalizeText(body.iso_code) || null
      : (countryRecord.get("iso_code") as string | null);

    if (hasName && !nextName) {
      return NextResponse.json({ message: "Name cannot be empty" }, { status: 400 });
    }

    if (hasStatus) {
      const status = normalizeText(body.status);
      if (status !== "active" && status !== "inactive") {
        return NextResponse.json(
          { message: "Status must be 'active' or 'inactive'" },
          { status: 400 },
        );
      }
      countryRecord.set("status", status);
    }

    if (hasName) {
      const duplicateName = await Country.findOne({
        where: {
          name: nextName,
          id: { [Op.ne]: countryId },
        },
      });

      if (duplicateName) {
        return NextResponse.json(
          { message: "Country name is already in use" },
          { status: 409 },
        );
      }
    }

    if (hasIsoCode && nextIsoCode) {
      const duplicateIso = await Country.findOne({
        where: {
          iso_code: nextIsoCode,
          id: { [Op.ne]: countryId },
        },
      });

      if (duplicateIso) {
        return NextResponse.json(
          { message: "iso_code is already in use" },
          { status: 409 },
        );
      }
    }

    if (hasName) {
      countryRecord.set("name", nextName);
    }

    if (hasIsoCode) {
      countryRecord.set("iso_code", nextIsoCode);
    }

    if (hasPhoneCode) {
      countryRecord.set("phone_code", normalizeText(body.phone_code) || null);
    }

    await countryRecord.save();

    return NextResponse.json(
      { message: "Country updated successfully", data: countryRecord },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update country" },
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

    const countryId = parseCountryId(request, body);
    if (Number.isNaN(countryId)) {
      return NextResponse.json(
        { message: "Valid country id is required" },
        { status: 400 },
      );
    }

    const countryRecord = await Country.findByPk(countryId);
    if (!countryRecord) {
      return NextResponse.json({ message: "Country not found" }, { status: 404 });
    }

    await countryRecord.destroy();

    return NextResponse.json(
      { message: "Country deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete country" },
      { status: 500 },
    );
  }
}
