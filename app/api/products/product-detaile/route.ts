import ProductDetaile from "@/model/productdetaile";
import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parseNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function parseRecordId(request: Request, body?: Record<string, unknown>) {
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

function parseProductId(request: Request, body?: Record<string, unknown>) {
  const { searchParams } = new URL(request.url);
  const productIdFromQuery = Number(searchParams.get("product_id"));
  const productIdFromBody = Number(body?.product_id);

  if (Number.isInteger(productIdFromQuery) && productIdFromQuery > 0) {
    return productIdFromQuery;
  }

  if (Number.isInteger(productIdFromBody) && productIdFromBody > 0) {
    return productIdFromBody;
  }

  return Number.NaN;
}

function parseArrayInput(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  const text = normalizeText(value);
  if (!text) {
    return [];
  }

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseBenefits(value: unknown) {
  const array = parseArrayInput(value);

  return array
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const row = item as Record<string, unknown>;
      return {
        img: normalizeText(row.img),
        heding: normalizeText(row.heding),
        pera: normalizeText(row.pera),
      };
    })
    .filter(
      (item): item is { img: string; heding: string; pera: string } =>
        item !== null,
    );
}

function parseIngredients(value: unknown) {
  const array = parseArrayInput(value);

  return array
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const row = item as Record<string, unknown>;
      return {
        img: normalizeText(row.img),
        heding: normalizeText(row.heding),
        pera: normalizeText(row.pera),
      };
    })
    .filter(
      (item): item is { img: string; heding: string; pera: string } =>
        item !== null,
    );
}

function parseUse(value: unknown) {
  let source: unknown = value;

  if (typeof value === "string") {
    const text = normalizeText(value);
    if (!text) {
      return [];
    }

    try {
      source = JSON.parse(text);
    } catch {
      return [];
    }
  }

  // Backward compatibility: allow single object and convert to array.
  if (!Array.isArray(source) && typeof source === "object" && source !== null) {
    source = [source];
  }

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const row = item as Record<string, unknown>;
      const protip = Array.isArray(row.protip)
        ? row.protip
            .map((tip) => normalizeText(tip))
            .filter((tip) => tip.length > 0)
        : [];

      return {
        heading: normalizeText(row.heading),
        paragraf: normalizeText(row.paragraf),
        protip,
      };
    })
    .filter(
      (item): item is { heading: string; paragraf: string; protip: string[] } =>
        item !== null,
    );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = Number(searchParams.get("id"));
    const productIdParam = Number(searchParams.get("product_id"));

    if (Number.isInteger(idParam) && idParam > 0) {
      const details = await ProductDetaile.findByPk(idParam);

      if (!details) {
        return NextResponse.json(
          { message: "Product details not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { message: "Product details fetched successfully", data: details },
        { status: 200 },
      );
    }

    if (Number.isInteger(productIdParam) && productIdParam > 0) {
      const details = await ProductDetaile.findOne({
        where: { product_id: productIdParam },
      });

      if (!details) {
        return NextResponse.json(
          { message: "Product details not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { message: "Product details fetched successfully", data: details },
        { status: 200 },
      );
    }

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await ProductDetaile.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "Product details list fetched successfully",
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
      { message: "Failed to fetch product details" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const productId = Number(body?.product_id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { message: "Valid product_id is required" },
        { status: 400 },
      );
    }

    const existing = await ProductDetaile.findOne({
      where: { product_id: productId },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Product details already exists for this product_id" },
        { status: 409 },
      );
    }

    const payload: Record<string, unknown> = {
      product_id: productId,
      benefits: parseBenefits(body?.benefits),
      img1: normalizeText(body?.img1) || null,
      img2: normalizeText(body?.img2) || null,
      Ingredients: parseIngredients(body?.Ingredients),
      Use: parseUse(body?.Use),
    };

    const details = await ProductDetaile.create(payload);

    return NextResponse.json(
      { message: "Product details created successfully", data: details },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create product details" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const recordId = parseRecordId(request, body);
    const productId = parseProductId(request, body);

    const whereClause: Record<string, unknown> = {};
    if (Number.isInteger(recordId) && recordId > 0) {
      whereClause.id = recordId;
    } else if (Number.isInteger(productId) && productId > 0) {
      whereClause.product_id = productId;
    } else {
      return NextResponse.json(
        { message: "Valid id or product_id is required" },
        { status: 400 },
      );
    }

    const details = await ProductDetaile.findOne({ where: whereClause });
    if (!details) {
      return NextResponse.json(
        { message: "Product details not found" },
        { status: 404 },
      );
    }

    const hasProductId = Object.prototype.hasOwnProperty.call(body, "product_id");
    const hasBenefits = Object.prototype.hasOwnProperty.call(body, "benefits");
    const hasImg1 = Object.prototype.hasOwnProperty.call(body, "img1");
    const hasImg2 = Object.prototype.hasOwnProperty.call(body, "img2");
    const hasIngredients = Object.prototype.hasOwnProperty.call(body, "Ingredients");
    const hasUse = Object.prototype.hasOwnProperty.call(body, "Use");

    if (!hasProductId && !hasBenefits && !hasImg1 && !hasImg2 && !hasIngredients && !hasUse) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    if (hasProductId) {
      const nextProductId = parseNumber(body?.product_id);
      if (!nextProductId || !Number.isInteger(nextProductId) || nextProductId <= 0) {
        return NextResponse.json(
          { message: "Valid product_id is required" },
          { status: 400 },
        );
      }

      const existing = await ProductDetaile.findOne({
        where: { product_id: nextProductId },
      });
      if (existing && Number(existing.get("id")) !== Number(details.get("id"))) {
        return NextResponse.json(
          { message: "Product details already exists for this product_id" },
          { status: 409 },
        );
      }

      details.set("product_id", nextProductId);
    }

    if (hasBenefits) {
      details.set("benefits", parseBenefits(body?.benefits));
    }

    if (hasImg1) {
      details.set("img1", normalizeText(body?.img1) || null);
    }

    if (hasImg2) {
      details.set("img2", normalizeText(body?.img2) || null);
    }

    if (hasIngredients) {
      details.set("Ingredients", parseIngredients(body?.Ingredients));
    }

    if (hasUse) {
      details.set("Use", parseUse(body?.Use));
    }

    await details.save();

    return NextResponse.json(
      { message: "Product details updated successfully", data: details },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update product details" },
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

    const recordId = parseRecordId(request, body);
    const productId = parseProductId(request, body);

    const whereClause: Record<string, unknown> = {};
    if (Number.isInteger(recordId) && recordId > 0) {
      whereClause.id = recordId;
    } else if (Number.isInteger(productId) && productId > 0) {
      whereClause.product_id = productId;
    } else {
      return NextResponse.json(
        { message: "Valid id or product_id is required" },
        { status: 400 },
      );
    }

    const details = await ProductDetaile.findOne({ where: whereClause });
    if (!details) {
      return NextResponse.json(
        { message: "Product details not found" },
        { status: 404 },
      );
    }

    await details.destroy();

    return NextResponse.json(
      { message: "Product details deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete product details" },
      { status: 500 },
    );
  }
}
