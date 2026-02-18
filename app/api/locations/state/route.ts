import Country from "@/model/country";
import State from "@/model/state";
import { NextResponse } from "next/server";
import { Op } from "sequelize";
import * as XLSX from "xlsx";


type StatePayload = {
  country_id: number;
  name: string;
  state_code: string | null;
  status: "active" | "inactive";
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parsePositiveInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function parseStateId(request: Request, body?: Record<string, unknown>) {
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
  const payloads: StatePayload[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const countryIdValue = getRowValue(row, ["country_id", "countryid", "country id"]);
    const nameValue = getRowValue(row, ["name", "state", "state_name", "state name"]);
    const stateCodeValue = getRowValue(row, ["state_code", "statecode", "state code"]);
    const statusValue = getRowValue(row, ["status"]);

    const countryId = parsePositiveInteger(countryIdValue);
    const name = normalizeText(nameValue);
    const stateCode = normalizeText(stateCodeValue) || null;
    const status = toValidStatus(statusValue, "active");

    if (Number.isNaN(countryId)) {
      errors.push(`Row ${rowNumber}: valid country_id is required`);
      return;
    }

    if (!name) {
      errors.push(`Row ${rowNumber}: state name is required`);
      return;
    }

    payloads.push({
      country_id: countryId,
      name,
      state_code: stateCode,
      status,
    });
  });

  if (!payloads.length) {
    return NextResponse.json(
      { message: "No valid rows found", errors },
      { status: 400 },
    );
  }

  const countryIds = Array.from(new Set(payloads.map((item) => item.country_id)));
  const existingCountries = await Country.findAll({
    where: { id: { [Op.in]: countryIds } },
    attributes: ["id"],
  });
  const existingCountryIdSet = new Set(
    existingCountries.map((country) => Number(country.get("id"))),
  );

  const validPayloads: StatePayload[] = [];
  payloads.forEach((item, index) => {
    if (!existingCountryIdSet.has(item.country_id)) {
      const rowNumber = index + 2;
      errors.push(`Row ${rowNumber}: country_id ${item.country_id} not found`);
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
    const existing = await State.findOne({
      where: {
        country_id: item.country_id,
        name: item.name,
      },
    });

    if (existing) {
      existing.set("state_code", item.state_code);
      existing.set("status", item.status);
      await existing.save();
      updated += 1;
    } else {
      await State.create(item);
      created += 1;
    }
  }

  return NextResponse.json(
    {
      message: "State excel imported successfully",
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
      const state = await State.findByPk(idParam);

      if (!state) {
        return NextResponse.json({ message: "State not found" }, { status: 404 });
      }

      return NextResponse.json(
        { message: "State fetched successfully", data: state },
        { status: 200 },
      );
    }

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const countryIdParam = parsePositiveInteger(searchParams.get("country_id"));
    const statusParam = normalizeText(searchParams.get("status"));
    const searchParam = normalizeText(searchParams.get("search"));

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};
    if (!Number.isNaN(countryIdParam)) {
      whereClause.country_id = countryIdParam;
    }
    if (statusParam === "active" || statusParam === "inactive") {
      whereClause.status = statusParam;
    }
    if (searchParam) {
      whereClause.name = { [Op.like]: `%${searchParam}%` };
    }

    const { count, rows } = await State.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "State list fetched successfully",
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
      { message: "Failed to fetch state data" },
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
    const countryId = parsePositiveInteger(body?.country_id);
    const name = normalizeText(body?.name);
    const stateCode = normalizeText(body?.state_code) || null;
    const status = toValidStatus(body?.status, "active");

    if (Number.isNaN(countryId) || !name) {
      return NextResponse.json(
        { message: "country_id and name are required" },
        { status: 400 },
      );
    }

    const country = await Country.findByPk(countryId);
    if (!country) {
      return NextResponse.json({ message: "Country not found" }, { status: 404 });
    }

    const existing = await State.findOne({
      where: { country_id: countryId, name },
    });
    if (existing) {
      return NextResponse.json(
        { message: "State already exists in this country" },
        { status: 409 },
      );
    }

    const created = await State.create({
      country_id: countryId,
      name,
      state_code: stateCode,
      status,
    });

    return NextResponse.json(
      { message: "State created successfully", data: created },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ message: "Failed to create state" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const stateId = parseStateId(request, body);

    if (Number.isNaN(stateId)) {
      return NextResponse.json(
        { message: "Valid state id is required" },
        { status: 400 },
      );
    }

    const stateRecord = await State.findByPk(stateId);
    if (!stateRecord) {
      return NextResponse.json({ message: "State not found" }, { status: 404 });
    }

    const hasCountryId = Object.prototype.hasOwnProperty.call(body, "country_id");
    const hasName = Object.prototype.hasOwnProperty.call(body, "name");
    const hasStateCode = Object.prototype.hasOwnProperty.call(body, "state_code");
    const hasStatus = Object.prototype.hasOwnProperty.call(body, "status");

    if (!hasCountryId && !hasName && !hasStateCode && !hasStatus) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    const nextCountryId = hasCountryId
      ? parsePositiveInteger(body.country_id)
      : Number(stateRecord.get("country_id"));
    const nextName = hasName
      ? normalizeText(body.name)
      : normalizeText(stateRecord.get("name"));

    if (hasCountryId && Number.isNaN(nextCountryId)) {
      return NextResponse.json(
        { message: "Valid country_id is required" },
        { status: 400 },
      );
    }

    if (hasName && !nextName) {
      return NextResponse.json({ message: "Name cannot be empty" }, { status: 400 });
    }

    if (hasCountryId) {
      const country = await Country.findByPk(nextCountryId);
      if (!country) {
        return NextResponse.json({ message: "Country not found" }, { status: 404 });
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
      stateRecord.set("status", status);
    }

    if (hasCountryId || hasName) {
      const duplicate = await State.findOne({
        where: {
          country_id: nextCountryId,
          name: nextName,
          id: { [Op.ne]: stateId },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { message: "State already exists in this country" },
          { status: 409 },
        );
      }
    }

    if (hasCountryId) {
      stateRecord.set("country_id", nextCountryId);
    }

    if (hasName) {
      stateRecord.set("name", nextName);
    }

    if (hasStateCode) {
      stateRecord.set("state_code", normalizeText(body.state_code) || null);
    }

    await stateRecord.save();

    return NextResponse.json(
      { message: "State updated successfully", data: stateRecord },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ message: "Failed to update state" }, { status: 500 });
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

    const stateId = parseStateId(request, body);
    if (Number.isNaN(stateId)) {
      return NextResponse.json(
        { message: "Valid state id is required" },
        { status: 400 },
      );
    }

    const stateRecord = await State.findByPk(stateId);
    if (!stateRecord) {
      return NextResponse.json({ message: "State not found" }, { status: 404 });
    }

    await stateRecord.destroy();

    return NextResponse.json({ message: "State deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Failed to delete state" }, { status: 500 });
  }
}
