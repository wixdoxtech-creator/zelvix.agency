import City from "@/model/city";
import State from "@/model/state";
import { NextResponse } from "next/server";
import { Op } from "sequelize";
import * as XLSX from "xlsx";


type CityPayload = {
  state_id: number;
  name: string;
  status: "active" | "inactive";
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parsePositiveInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function parseCityId(request: Request, body?: Record<string, unknown>) {
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
  const payloads: CityPayload[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const stateIdValue = getRowValue(row, ["state_id", "stateid", "state id"]);
    const nameValue = getRowValue(row, ["name", "city", "city_name", "city name"]);
    const statusValue = getRowValue(row, ["status"]);

    const stateId = parsePositiveInteger(stateIdValue);
    const name = normalizeText(nameValue);
    const status = toValidStatus(statusValue, "active");

    if (Number.isNaN(stateId)) {
      errors.push(`Row ${rowNumber}: valid state_id is required`);
      return;
    }

    if (!name) {
      errors.push(`Row ${rowNumber}: city name is required`);
      return;
    }

    payloads.push({
      state_id: stateId,
      name,
      status,
    });
  });

  if (!payloads.length) {
    return NextResponse.json(
      { message: "No valid rows found", errors },
      { status: 400 },
    );
  }

  const stateIds = Array.from(new Set(payloads.map((item) => item.state_id)));
  const existingStates = await State.findAll({
    where: { id: { [Op.in]: stateIds } },
    attributes: ["id"],
  });
  const existingStateIdSet = new Set(existingStates.map((state) => Number(state.get("id"))));

  const validPayloads: CityPayload[] = [];
  payloads.forEach((item, index) => {
    if (!existingStateIdSet.has(item.state_id)) {
      const rowNumber = index + 2;
      errors.push(`Row ${rowNumber}: state_id ${item.state_id} not found`);
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
    const existing = await City.findOne({
      where: {
        state_id: item.state_id,
        name: item.name,
      },
    });

    if (existing) {
      existing.set("status", item.status);
      await existing.save();
      updated += 1;
    } else {
      await City.create(item);
      created += 1;
    }
  }

  return NextResponse.json(
    {
      message: "City excel imported successfully",
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
      const city = await City.findByPk(idParam);

      if (!city) {
        return NextResponse.json({ message: "City not found" }, { status: 404 });
      }

      return NextResponse.json(
        { message: "City fetched successfully", data: city },
        { status: 200 },
      );
    }

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const stateIdParam = parsePositiveInteger(searchParams.get("state_id"));
    const statusParam = normalizeText(searchParams.get("status"));
    const searchParam = normalizeText(searchParams.get("search"));

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};
    if (!Number.isNaN(stateIdParam)) {
      whereClause.state_id = stateIdParam;
    }
    if (statusParam === "active" || statusParam === "inactive") {
      whereClause.status = statusParam;
    }
    if (searchParam) {
      whereClause.name = { [Op.like]: `%${searchParam}%` };
    }

    const { count, rows } = await City.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "City list fetched successfully",
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
      { message: "Failed to fetch city data" },
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
    const stateId = parsePositiveInteger(body?.state_id);
    const name = normalizeText(body?.name);
    const status = toValidStatus(body?.status, "active");

    if (Number.isNaN(stateId) || !name) {
      return NextResponse.json(
        { message: "state_id and name are required" },
        { status: 400 },
      );
    }

    const state = await State.findByPk(stateId);
    if (!state) {
      return NextResponse.json({ message: "State not found" }, { status: 404 });
    }

    const existing = await City.findOne({
      where: { state_id: stateId, name },
    });
    if (existing) {
      return NextResponse.json(
        { message: "City already exists in this state" },
        { status: 409 },
      );
    }

    const created = await City.create({
      state_id: stateId,
      name,
      status,
    });

    return NextResponse.json(
      { message: "City created successfully", data: created },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ message: "Failed to create city" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const cityId = parseCityId(request, body);

    if (Number.isNaN(cityId)) {
      return NextResponse.json(
        { message: "Valid city id is required" },
        { status: 400 },
      );
    }

    const cityRecord = await City.findByPk(cityId);
    if (!cityRecord) {
      return NextResponse.json({ message: "City not found" }, { status: 404 });
    }

    const hasStateId = Object.prototype.hasOwnProperty.call(body, "state_id");
    const hasName = Object.prototype.hasOwnProperty.call(body, "name");
    const hasStatus = Object.prototype.hasOwnProperty.call(body, "status");

    if (!hasStateId && !hasName && !hasStatus) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    const nextStateId = hasStateId
      ? parsePositiveInteger(body.state_id)
      : Number(cityRecord.get("state_id"));
    const nextName = hasName ? normalizeText(body.name) : normalizeText(cityRecord.get("name"));

    if (hasStateId && Number.isNaN(nextStateId)) {
      return NextResponse.json(
        { message: "Valid state_id is required" },
        { status: 400 },
      );
    }

    if (hasName && !nextName) {
      return NextResponse.json({ message: "Name cannot be empty" }, { status: 400 });
    }

    if (hasStateId) {
      const state = await State.findByPk(nextStateId);
      if (!state) {
        return NextResponse.json({ message: "State not found" }, { status: 404 });
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
      cityRecord.set("status", status);
    }

    if (hasStateId || hasName) {
      const duplicate = await City.findOne({
        where: {
          state_id: nextStateId,
          name: nextName,
          id: { [Op.ne]: cityId },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { message: "City already exists in this state" },
          { status: 409 },
        );
      }
    }

    if (hasStateId) {
      cityRecord.set("state_id", nextStateId);
    }

    if (hasName) {
      cityRecord.set("name", nextName);
    }

    await cityRecord.save();

    return NextResponse.json(
      { message: "City updated successfully", data: cityRecord },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ message: "Failed to update city" }, { status: 500 });
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

    const cityId = parseCityId(request, body);
    if (Number.isNaN(cityId)) {
      return NextResponse.json(
        { message: "Valid city id is required" },
        { status: 400 },
      );
    }

    const cityRecord = await City.findByPk(cityId);
    if (!cityRecord) {
      return NextResponse.json({ message: "City not found" }, { status: 404 });
    }

    await cityRecord.destroy();

    return NextResponse.json({ message: "City deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Failed to delete city" }, { status: 500 });
  }
}
