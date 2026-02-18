import PaymentGateway from "@/model/paymentgatwy";
import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const text = value.trim().toLowerCase();
    if (text === "true") {
      return true;
    }
    if (text === "false") {
      return false;
    }
  }

  return undefined;
}

function parseGatewayId(request: Request, body?: Record<string, unknown>) {
  const { searchParams } = new URL(request.url);
  const idFromQuery = Number(searchParams.get("id"));
  const idFromBody = Number(body?.id);

  if (Number.isInteger(idFromQuery) && idFromQuery > 0) {
    return idFromQuery;
  }

  if (Number.isInteger(idFromBody) && idFromBody > 0) {
    return idFromBody;
  }

  return Number.NaN;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = Number(searchParams.get("id"));
    const activeOnly = searchParams.get("active_only");

    if (Number.isInteger(idParam) && idParam > 0) {
      const gateway = await PaymentGateway.findByPk(idParam);
      if (!gateway) {
        return NextResponse.json(
          { message: "Payment gateway not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { message: "Payment gateway fetched successfully", data: gateway },
        { status: 200 },
      );
    }

    const whereClause: Record<string, unknown> = {};
    if (activeOnly === "true") {
      whereClause.is_active = true;
    }

    const gateways = await PaymentGateway.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(
      { message: "Payment gateways fetched successfully", data: gateways },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch payment gateways" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = normalizeText(body?.name);

    if (!name) {
      return NextResponse.json({ message: "name is required" }, { status: 400 });
    }

    const gateway = await PaymentGateway.create({
      name,
      app_id: normalizeText(body?.app_id) || null,
      secret_key: normalizeText(body?.secret_key) || null,
      is_active: parseBoolean(body?.is_active) ?? true,
    });

    return NextResponse.json(
      { message: "Payment gateway created successfully", data: gateway },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create payment gateway" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const gatewayId = parseGatewayId(request, body);

    if (!Number.isInteger(gatewayId) || gatewayId <= 0) {
      return NextResponse.json(
        { message: "Valid payment gateway id is required" },
        { status: 400 },
      );
    }

    const gateway = await PaymentGateway.findByPk(gatewayId);
    if (!gateway) {
      return NextResponse.json(
        { message: "Payment gateway not found" },
        { status: 404 },
      );
    }

    const hasAnyField =
      Object.prototype.hasOwnProperty.call(body, "name") ||
      Object.prototype.hasOwnProperty.call(body, "app_id") ||
      Object.prototype.hasOwnProperty.call(body, "secret_key") ||
      Object.prototype.hasOwnProperty.call(body, "is_active");

    if (!hasAnyField) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {};
    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      const name = normalizeText(body?.name);
      if (!name) {
        return NextResponse.json(
          { message: "name cannot be empty" },
          { status: 400 },
        );
      }
      updates.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(body, "app_id")) {
      updates.app_id = normalizeText(body?.app_id) || null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "secret_key")) {
      updates.secret_key = normalizeText(body?.secret_key) || null;
    }
    if (Object.prototype.hasOwnProperty.call(body, "is_active")) {
      updates.is_active = parseBoolean(body?.is_active) ?? false;
    }

    await gateway.update(updates);

    return NextResponse.json(
      { message: "Payment gateway updated successfully", data: gateway },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update payment gateway" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const gatewayId = parseGatewayId(request);

    if (!Number.isInteger(gatewayId) || gatewayId <= 0) {
      return NextResponse.json(
        { message: "Valid payment gateway id is required" },
        { status: 400 },
      );
    }

    const gateway = await PaymentGateway.findByPk(gatewayId);
    if (!gateway) {
      return NextResponse.json(
        { message: "Payment gateway not found" },
        { status: 404 },
      );
    }

    await gateway.destroy();

    return NextResponse.json(
      { message: "Payment gateway deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete payment gateway" },
      { status: 500 },
    );
  }
}
