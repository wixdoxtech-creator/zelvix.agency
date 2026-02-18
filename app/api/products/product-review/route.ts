import Product from "@/model/product";
import Review from "@/model/review";
import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parseNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const text = normalizeText(value).toLowerCase();
    if (text === "true") {
      return true;
    }
    if (text === "false") {
      return false;
    }
  }

  return undefined;
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = Number(searchParams.get("id"));
    const productIdParam = Number(searchParams.get("product_id"));
    const productNameParam = normalizeText(searchParams.get("product_name"));

    if (Number.isInteger(idParam) && idParam > 0) {
      const review = await Review.findByPk(idParam);

      if (!review) {
        return NextResponse.json({ message: "Review not found" }, { status: 404 });
      }

      return NextResponse.json(
        {
          message: "Review fetched successfully",
          data: review,
        },
        { status: 200 },
      );
    }

    if (Number.isInteger(productIdParam) && productIdParam > 0) {
      const reviews = await Review.findAll({
        where: { product_id: productIdParam },
        order: [["createdAt", "DESC"]],
      });

      return NextResponse.json(
        {
          message: "Review list fetched successfully",
          data: reviews,
        },
        { status: 200 },
      );
    }

    if (productNameParam) {
      const reviews = await Review.findAll({
        where: { product_name: productNameParam.toLowerCase() },
        order: [["createdAt", "DESC"]],
      });

      return NextResponse.json(
        {
          message: "Review list fetched successfully",
          data: reviews,
        },
        { status: 200 },
      );
    }

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const isActiveParam = parseBoolean(searchParams.get("is_active"));

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};
    if (typeof isActiveParam === "boolean") {
      whereClause.is_active = isActiveParam;
    }

    const { count, rows } = await Review.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "Review list fetched successfully",
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
      { message: "Failed to fetch review data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const productId = Number(body?.product_id);
    const productName = normalizeText(body?.product_name).toLowerCase();
    const name = normalizeText(body?.name);
    const image = normalizeText(body?.image) || null;
    const dis = normalizeText(body?.dis) || null;
    const rating = parseNumber(body?.rating);
    const isActive = parseBoolean(body?.is_active);

    if (!Number.isInteger(productId) || productId <= 0 || !productName || !name) {
      return NextResponse.json(
        { message: "product_id, product_name and name are required" },
        { status: 400 },
      );
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const productSlug = normalizeText(product.get("slug")).toLowerCase();
    if (productSlug !== productName) {
      return NextResponse.json(
        { message: "product_name must match selected product slug" },
        { status: 400 },
      );
    }

    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return NextResponse.json(
        { message: "rating must be between 0 and 5" },
        { status: 400 },
      );
    }

    const payload = {
      product_id: productId,
      product_name: productName,
      name,
      image,
      rating: rating ?? 0,
      dis,
      is_active: isActive ?? true,
    };

    const review = await Review.create(payload);

    return NextResponse.json(
      {
        message: "Review created successfully",
        data: review,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create review" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = parseRecordId(request, body);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "Valid review id is required" },
        { status: 400 },
      );
    }

    const review = await Review.findByPk(id);
    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    const hasProductId = Object.prototype.hasOwnProperty.call(body, "product_id");
    const hasProductName = Object.prototype.hasOwnProperty.call(body, "product_name");
    const hasName = Object.prototype.hasOwnProperty.call(body, "name");
    const hasImage = Object.prototype.hasOwnProperty.call(body, "image");
    const hasDis = Object.prototype.hasOwnProperty.call(body, "dis");
    const hasRating = Object.prototype.hasOwnProperty.call(body, "rating");
    const hasIsActive = Object.prototype.hasOwnProperty.call(body, "is_active");

    if (
      !hasProductId &&
      !hasProductName &&
      !hasName &&
      !hasImage &&
      !hasDis &&
      !hasRating &&
      !hasIsActive
    ) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    const nextProductId = hasProductId ? Number(body?.product_id) : Number(review.get("product_id"));
    const nextProductName = hasProductName
      ? normalizeText(body?.product_name).toLowerCase()
      : normalizeText(review.get("product_name")).toLowerCase();

    if (!Number.isInteger(nextProductId) || nextProductId <= 0 || !nextProductName) {
      return NextResponse.json(
        { message: "Valid product_id and product_name are required" },
        { status: 400 },
      );
    }

    const product = await Product.findByPk(nextProductId);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const productSlug = normalizeText(product.get("slug")).toLowerCase();
    if (productSlug !== nextProductName) {
      return NextResponse.json(
        { message: "product_name must match selected product slug" },
        { status: 400 },
      );
    }

    if (hasProductId) {
      review.set("product_id", nextProductId);
    }

    if (hasProductName) {
      review.set("product_name", nextProductName);
    }

    if (hasName) {
      const name = normalizeText(body?.name);
      if (!name) {
        return NextResponse.json(
          { message: "name cannot be empty" },
          { status: 400 },
        );
      }
      review.set("name", name);
    }

    if (hasImage) {
      review.set("image", normalizeText(body?.image) || null);
    }

    if (hasDis) {
      review.set("dis", normalizeText(body?.dis) || null);
    }

    if (hasRating) {
      const rating = parseNumber(body?.rating);
      if (rating === undefined || rating < 0 || rating > 5) {
        return NextResponse.json(
          { message: "rating must be between 0 and 5" },
          { status: 400 },
        );
      }
      review.set("rating", rating);
    }

    if (hasIsActive) {
      const isActive = parseBoolean(body?.is_active);
      if (typeof isActive !== "boolean") {
        return NextResponse.json(
          { message: "is_active must be true or false" },
          { status: 400 },
        );
      }
      review.set("is_active", isActive);
    }

    await review.save();

    return NextResponse.json(
      {
        message: "Review updated successfully",
        data: review,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update review" },
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

    const id = parseRecordId(request, body);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "Valid review id is required" },
        { status: 400 },
      );
    }

    const review = await Review.findByPk(id);
    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    await review.destroy();

    return NextResponse.json(
      { message: "Review deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete review" },
      { status: 500 },
    );
  }
}
