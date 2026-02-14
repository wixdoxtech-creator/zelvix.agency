import Product from "@/model/product";
import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parseNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function parseProductId(request: Request, body?: Record<string, unknown>) {
  const { searchParams } = new URL(request.url);
  const idFromQuery = Number(searchParams.get("id"));
  const productIdFromQuery = Number(searchParams.get("product_id"));
  const idFromBody = Number(body?.id);
  const productIdFromBody = Number(body?.product_id);

  const ids = [idFromQuery, productIdFromQuery, idFromBody, productIdFromBody];
  for (const id of ids) {
    if (Number.isInteger(id) && id > 0) {
      return id;
    }
  }

  return Number.NaN;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = Number(searchParams.get("id"));

    if (Number.isInteger(idParam) && idParam > 0) {
      const inventory = await Product.findByPk(idParam, {
        attributes: [
          "id",
          "name",
          "sku",
          "category_id",
          "tax",
          "hsn",
          "qty",
          "sold_qty",
          "status",
          "createdAt",
          "updatedAt",
        ],
      });

      if (!inventory) {
        return NextResponse.json({ message: "Inventory not found" }, { status: 404 });
      }

      return NextResponse.json(
        {
          message: "Inventory fetched successfully",
          data: inventory,
        },
        { status: 200 },
      );
    }

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const statusParam = normalizeText(searchParams.get("status"));
    const categoryIdParam = Number(searchParams.get("category_id"));

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

    if (Number.isInteger(categoryIdParam) && categoryIdParam > 0) {
      whereClause.category_id = categoryIdParam;
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      attributes: [
        "id",
        "name",
        "sku",
        "category_id",
        "tax",
        "hsn",
        "qty",
        "sold_qty",
        "status",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "Inventory list fetched successfully",
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
      { message: "Failed to fetch inventory data" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const productId = parseProductId(request, body);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { message: "Valid product id is required" },
        { status: 400 },
      );
    }

    const inventory = await Product.findByPk(productId);
    if (!inventory) {
      return NextResponse.json({ message: "Inventory not found" }, { status: 404 });
    }

    const hasQty = Object.prototype.hasOwnProperty.call(body, "qty");
    const hasSoldQty = Object.prototype.hasOwnProperty.call(body, "sold_qty");
    const hasStatus = Object.prototype.hasOwnProperty.call(body, "status");

    if (!hasQty && !hasSoldQty && !hasStatus) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    if (hasQty) {
      const qty = parseNumber(body?.qty);
      if (qty === undefined || qty < 0) {
        return NextResponse.json(
          { message: "Qty must be 0 or greater" },
          { status: 400 },
        );
      }
      inventory.set("qty", Math.trunc(qty));
    }

    if (hasSoldQty) {
      const soldQty = parseNumber(body?.sold_qty);
      if (soldQty === undefined || soldQty < 0) {
        return NextResponse.json(
          { message: "Sold qty must be 0 or greater" },
          { status: 400 },
        );
      }
      inventory.set("sold_qty", Math.trunc(soldQty));
    }

    if (hasStatus) {
      const status = normalizeText(body?.status);
      if (status !== "active" && status !== "inactive") {
        return NextResponse.json(
          { message: "Status must be 'active' or 'inactive'" },
          { status: 400 },
        );
      }
      inventory.set("status", status);
    }

    await inventory.save();

    return NextResponse.json(
      {
        message: "Inventory updated successfully",
        data: inventory,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update inventory" },
      { status: 500 },
    );
  }
}
