import Pincode from "@/model/pincode";
import Shipping from "@/model/shipping";
import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parsePositiveInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function parseNonNegativeAmount(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
}

function parseShippingId(request: Request, body?: Record<string, unknown>) {
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

async function validatePincodeIfProvided(pincodeId: number | null) {
  if (pincodeId === null) {
    return true;
  }

  const pincode = await Pincode.findByPk(pincodeId);
  return Boolean(pincode);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = parsePositiveInteger(searchParams.get("id"));

    if (!Number.isNaN(idParam)) {
      const shipping = await Shipping.findByPk(idParam);

      if (!shipping) {
        return NextResponse.json({ message: "Shipping not found" }, { status: 404 });
      }

      return NextResponse.json(
        { message: "Shipping fetched successfully", data: shipping },
        { status: 200 },
      );
    }

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const pincodeIdParam = parsePositiveInteger(searchParams.get("pincode_id"));
    const statusParam = normalizeText(searchParams.get("status"));

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};
    if (!Number.isNaN(pincodeIdParam)) {
      whereClause.pincode_id = pincodeIdParam;
    }
    if (statusParam === "active" || statusParam === "inactive") {
      whereClause.status = statusParam;
    }

    const { count, rows } = await Shipping.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "Shipping list fetched successfully",
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
      { message: "Failed to fetch shipping data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const hasPincodeId = Object.prototype.hasOwnProperty.call(body, "pincode_id");
    const minAmount = parseNonNegativeAmount(body.min_amount);
    const maxAmount = parseNonNegativeAmount(body.max_amount);
    const shippingAmount = parseNonNegativeAmount(body.shipping_amount);
    const status = toValidStatus(body.status, "active");

    if (Number.isNaN(minAmount) || Number.isNaN(maxAmount) || Number.isNaN(shippingAmount)) {
      return NextResponse.json(
        { message: "min_amount, max_amount and shipping_amount must be valid numbers" },
        { status: 400 },
      );
    }

    if (minAmount > maxAmount) {
      return NextResponse.json(
        { message: "min_amount cannot be greater than max_amount" },
        { status: 400 },
      );
    }

    let nextPincodeId: number | null = null;
    if (hasPincodeId) {
      const rawPincodeId = body.pincode_id;
      if (rawPincodeId !== null && normalizeText(rawPincodeId) !== "") {
        const pincodeId = parsePositiveInteger(rawPincodeId);
        if (Number.isNaN(pincodeId)) {
          return NextResponse.json(
            { message: "pincode_id must be a valid positive number or null" },
            { status: 400 },
          );
        }
        nextPincodeId = pincodeId;
      }
    }

    const pincodeExists = await validatePincodeIfProvided(nextPincodeId);
    if (!pincodeExists) {
      return NextResponse.json({ message: "Pincode not found" }, { status: 404 });
    }

    const created = await Shipping.create({
      pincode_id: nextPincodeId,
      min_amount: minAmount,
      max_amount: maxAmount,
      shipping_amount: shippingAmount,
      status,
    });

    return NextResponse.json(
      { message: "Shipping created successfully", data: created },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create shipping" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const shippingId = parseShippingId(request, body);

    if (Number.isNaN(shippingId)) {
      return NextResponse.json(
        { message: "Valid shipping id is required" },
        { status: 400 },
      );
    }

    const shipping = await Shipping.findByPk(shippingId);
    if (!shipping) {
      return NextResponse.json({ message: "Shipping not found" }, { status: 404 });
    }

    const hasPincodeId = Object.prototype.hasOwnProperty.call(body, "pincode_id");
    const hasMinAmount = Object.prototype.hasOwnProperty.call(body, "min_amount");
    const hasMaxAmount = Object.prototype.hasOwnProperty.call(body, "max_amount");
    const hasShippingAmount = Object.prototype.hasOwnProperty.call(body, "shipping_amount");
    const hasStatus = Object.prototype.hasOwnProperty.call(body, "status");

    if (!hasPincodeId && !hasMinAmount && !hasMaxAmount && !hasShippingAmount && !hasStatus) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    const nextMinAmount = hasMinAmount
      ? parseNonNegativeAmount(body.min_amount)
      : Number(shipping.get("min_amount"));
    const nextMaxAmount = hasMaxAmount
      ? parseNonNegativeAmount(body.max_amount)
      : Number(shipping.get("max_amount"));

    if (Number.isNaN(nextMinAmount) || Number.isNaN(nextMaxAmount)) {
      return NextResponse.json(
        { message: "min_amount and max_amount must be valid numbers" },
        { status: 400 },
      );
    }

    if (nextMinAmount > nextMaxAmount) {
      return NextResponse.json(
        { message: "min_amount cannot be greater than max_amount" },
        { status: 400 },
      );
    }

    if (hasShippingAmount) {
      const amount = parseNonNegativeAmount(body.shipping_amount);
      if (Number.isNaN(amount)) {
        return NextResponse.json(
          { message: "shipping_amount must be a valid number" },
          { status: 400 },
        );
      }
      shipping.set("shipping_amount", amount);
    }

    if (hasPincodeId) {
      const rawPincodeId = body.pincode_id;
      let nextPincodeId: number | null = null;

      if (rawPincodeId !== null && normalizeText(rawPincodeId) !== "") {
        const parsedPincodeId = parsePositiveInteger(rawPincodeId);
        if (Number.isNaN(parsedPincodeId)) {
          return NextResponse.json(
            { message: "pincode_id must be a valid positive number or null" },
            { status: 400 },
          );
        }
        nextPincodeId = parsedPincodeId;
      }

      const pincodeExists = await validatePincodeIfProvided(nextPincodeId);
      if (!pincodeExists) {
        return NextResponse.json({ message: "Pincode not found" }, { status: 404 });
      }

      shipping.set("pincode_id", nextPincodeId);
    }

    if (hasMinAmount) {
      shipping.set("min_amount", nextMinAmount);
    }

    if (hasMaxAmount) {
      shipping.set("max_amount", nextMaxAmount);
    }

    if (hasStatus) {
      const status = normalizeText(body.status);
      if (status !== "active" && status !== "inactive") {
        return NextResponse.json(
          { message: "Status must be 'active' or 'inactive'" },
          { status: 400 },
        );
      }
      shipping.set("status", status);
    }

    await shipping.save();

    return NextResponse.json(
      { message: "Shipping updated successfully", data: shipping },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update shipping" },
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

    const shippingId = parseShippingId(request, body);
    if (Number.isNaN(shippingId)) {
      return NextResponse.json(
        { message: "Valid shipping id is required" },
        { status: 400 },
      );
    }

    const shipping = await Shipping.findByPk(shippingId);
    if (!shipping) {
      return NextResponse.json({ message: "Shipping not found" }, { status: 404 });
    }

    await shipping.destroy();

    return NextResponse.json(
      { message: "Shipping deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete shipping" },
      { status: 500 },
    );
  }
}
