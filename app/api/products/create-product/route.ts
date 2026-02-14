import Product from "@/model/product";
import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parseProductId(request: Request, body?: Record<string, unknown>) {
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

function parseImages(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0);
  }

  const text = normalizeText(value);
  if (!text) {
    return [];
  }

  return [text];
}

function parseKeywords(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0);
  }

  const text = normalizeText(value);
  if (!text) {
    return [];
  }

  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
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

function parseNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function parseQtyOffers(value: unknown) {
  if (value === undefined) {
    return {
      hasValue: false,
      data: [] as Array<{ qty: number; price: number; label: string }>,
    };
  }

  let source: unknown = value;
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) {
      return {
        hasValue: true,
        data: [] as Array<{ qty: number; price: number; label: string }>,
      };
    }

    try {
      source = JSON.parse(text);
    } catch {
      return { hasValue: true, error: "qty_offers must be valid JSON" };
    }
  }

  if (!Array.isArray(source)) {
    return { hasValue: true, error: "qty_offers must be an array" };
  }

  const normalized = source.map((item) => {
    if (typeof item !== "object" || item === null) {
      return null;
    }

    const raw = item as Record<string, unknown>;
    const qty = Number(raw.qty);
    const price = Number(raw.price);
    const label = normalizeText(raw.label);

    if (!Number.isFinite(qty) || qty <= 0) {
      return null;
    }

    if (!Number.isFinite(price) || price < 0) {
      return null;
    }

    if (!label) {
      return null;
    }

    return {
      qty: Math.trunc(qty),
      price,
      label,
    };
  });

  if (normalized.some((item) => item === null)) {
    return {
      hasValue: true,
      error: "Each qty_offers item needs qty, price and label",
    };
  }

  return {
    hasValue: true,
    data: normalized as Array<{ qty: number; price: number; label: string }>,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = Number(searchParams.get("id"));

    if (Number.isInteger(idParam) && idParam > 0) {
      const product = await Product.findByPk(idParam);

      if (!product) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          message: "Product fetched successfully",
          data: product,
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
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "Product list fetched successfully",
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
      { message: "Failed to fetch product data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const name = normalizeText(body?.name);
    const slug = normalizeText(body?.slug).toLowerCase();
    const sku = normalizeText(body?.sku).toUpperCase();
    const categoryId = Number(body?.category_id);

    if (
      !name ||
      !slug ||
      !sku ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return NextResponse.json(
        { message: "Name, slug, sku and valid category_id are required" },
        { status: 400 },
      );
    }

    const status = normalizeText(body?.status) || "active";
    if (status !== "active" && status !== "inactive") {
      return NextResponse.json(
        { message: "Status must be 'active' or 'inactive'" },
        { status: 400 },
      );
    }

    const existingSlug = await Product.findOne({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { message: "Product already exists with this slug" },
        { status: 409 },
      );
    }

    const existingSku = await Product.findOne({ where: { sku } });
    if (existingSku) {
      return NextResponse.json(
        { message: "Product already exists with this sku" },
        { status: 409 },
      );
    }

    const prise = parseNumber(body?.prise);
    const offerPrise = parseNumber(body?.offer_prise);
    const tax = parseNumber(body?.tax);
    const hsn = normalizeText(body?.hsn);
    const qty = parseNumber(body?.qty);
    const soldQty = parseNumber(body?.sold_qty);

    if (prise !== undefined && prise < 0) {
      return NextResponse.json(
        { message: "Prise must be 0 or greater" },
        { status: 400 },
      );
    }

    if (offerPrise !== undefined && offerPrise < 0) {
      return NextResponse.json(
        { message: "Offer prise must be 0 or greater" },
        { status: 400 },
      );
    }

    if (tax !== undefined && tax < 0) {
      return NextResponse.json(
        { message: "Tax must be 0 or greater" },
        { status: 400 },
      );
    }

    const payload: Record<string, unknown> = {
      name,
      slug,
      sku,
      category_id: categoryId,
      images: parseImages(body?.images),
      keywords: parseKeywords(body?.keywords),
      status,
      qty: qty !== undefined ? Math.max(0, Math.trunc(qty)) : 0,
      sold_qty: soldQty !== undefined ? Math.max(0, Math.trunc(soldQty)) : 0,
    };

    const parsedQtyOffers = parseQtyOffers(body?.qty_offers);
    if (parsedQtyOffers.error) {
      return NextResponse.json(
        { message: parsedQtyOffers.error },
        { status: 400 },
      );
    }
    if (parsedQtyOffers.hasValue) {
      payload.qty_offers = parsedQtyOffers.data;
    }

    if (prise !== undefined) {
      payload.prise = prise;
    }

    if (offerPrise !== undefined) {
      payload.offer_prise = offerPrise;
    }

    if (tax !== undefined) {
      payload.tax = tax;
    }

    if (hsn) {
      payload.hsn = hsn;
    }

    const description = normalizeText(body?.description);
    if (description) {
      payload.description = description;
    }

    const weight = normalizeText(body?.weight);
    if (weight) {
      payload.weight = weight;
    }

    const length = normalizeText(body?.length);
    if (length) {
      payload.length = length;
    }

    const breadth = normalizeText(body?.breadth);
    if (breadth) {
      payload.breadth = breadth;
    }

    const hight = normalizeText(body?.hight);
    if (hight) {
      payload.hight = hight;
    }

    const seoTitle = normalizeText(body?.seo_title ?? body?.sep_title);
    if (seoTitle) {
      payload.seo_title = seoTitle;
    }

    const seoDescription = normalizeText(body?.seo_descrition);
    if (seoDescription) {
      payload.seo_descrition = seoDescription;
    }

    const newProduct = parseBoolean(body?.new_product);
    if (newProduct !== undefined) {
      payload.new_product = newProduct;
    }

    const isTop = parseBoolean(body?.is_top);
    if (isTop !== undefined) {
      payload.is_top = isTop;
    }

    const isBest = parseBoolean(body?.is_best);
    if (isBest !== undefined) {
      payload.is_best = isBest;
    }

    const product = await Product.create(payload);

    return NextResponse.json(
      {
        message: "Product created successfully",
        data: product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("this is the data ", error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const productId = parseProductId(request, body);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { message: "Valid product id is required" },
        { status: 400 },
      );
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const hasName = Object.prototype.hasOwnProperty.call(body, "name");
    const hasSlug = Object.prototype.hasOwnProperty.call(body, "slug");
    const hasSku = Object.prototype.hasOwnProperty.call(body, "sku");
    const hasCategoryId = Object.prototype.hasOwnProperty.call(
      body,
      "category_id",
    );
    const hasImages = Object.prototype.hasOwnProperty.call(body, "images");
    const hasQty = Object.prototype.hasOwnProperty.call(body, "qty");
    const hasSoldQty = Object.prototype.hasOwnProperty.call(body, "sold_qty");
    const hasDescription = Object.prototype.hasOwnProperty.call(
      body,
      "description",
    );
    const hasWeight = Object.prototype.hasOwnProperty.call(body, "weight");
    const hasLength = Object.prototype.hasOwnProperty.call(body, "length");
    const hasBreadth = Object.prototype.hasOwnProperty.call(body, "breadth");
    const hasHight = Object.prototype.hasOwnProperty.call(body, "hight");
    const hasPrise = Object.prototype.hasOwnProperty.call(body, "prise");
    const hasOfferPrise = Object.prototype.hasOwnProperty.call(
      body,
      "offer_prise",
    );
    const hasTax = Object.prototype.hasOwnProperty.call(body, "tax");
    const hasHsn = Object.prototype.hasOwnProperty.call(body, "hsn");
    const hasSeoTitle =
      Object.prototype.hasOwnProperty.call(body, "seo_title") ||
      Object.prototype.hasOwnProperty.call(body, "sep_title");
    const hasSeoDescription = Object.prototype.hasOwnProperty.call(
      body,
      "seo_descrition",
    );
    const hasKeywords = Object.prototype.hasOwnProperty.call(body, "keywords");
    const hasQtyOffers = Object.prototype.hasOwnProperty.call(
      body,
      "qty_offers",
    );
    const hasNewProduct = Object.prototype.hasOwnProperty.call(
      body,
      "new_product",
    );
    const hasIsTop = Object.prototype.hasOwnProperty.call(body, "is_top");
    const hasIsBest = Object.prototype.hasOwnProperty.call(body, "is_best");
    const hasStatus = Object.prototype.hasOwnProperty.call(body, "status");

    if (
      !hasName &&
      !hasSlug &&
      !hasSku &&
      !hasCategoryId &&
      !hasImages &&
      !hasQty &&
      !hasSoldQty &&
      !hasDescription &&
      !hasWeight &&
      !hasLength &&
      !hasBreadth &&
      !hasHight &&
      !hasPrise &&
      !hasOfferPrise &&
      !hasTax &&
      !hasHsn &&
      !hasSeoTitle &&
      !hasSeoDescription &&
      !hasKeywords &&
      !hasQtyOffers &&
      !hasNewProduct &&
      !hasIsTop &&
      !hasIsBest &&
      !hasStatus
    ) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    if (hasName) {
      const name = normalizeText(body?.name);
      if (!name) {
        return NextResponse.json(
          { message: "Name cannot be empty" },
          { status: 400 },
        );
      }
      product.set("name", name);
    }

    if (hasSlug) {
      const slug = normalizeText(body?.slug).toLowerCase();
      if (!slug) {
        return NextResponse.json(
          { message: "Slug cannot be empty" },
          { status: 400 },
        );
      }

      const existingSlug = await Product.findOne({ where: { slug } });
      if (existingSlug && Number(existingSlug.get("id")) !== productId) {
        return NextResponse.json(
          { message: "Product slug is already in use" },
          { status: 409 },
        );
      }

      product.set("slug", slug);
    }

    if (hasSku) {
      const sku = normalizeText(body?.sku).toUpperCase();
      if (!sku) {
        return NextResponse.json(
          { message: "Sku cannot be empty" },
          { status: 400 },
        );
      }

      const existingSku = await Product.findOne({ where: { sku } });
      if (existingSku && Number(existingSku.get("id")) !== productId) {
        return NextResponse.json(
          { message: "Product sku is already in use" },
          { status: 409 },
        );
      }

      product.set("sku", sku);
    }

    if (hasCategoryId) {
      const categoryId = Number(body?.category_id);
      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return NextResponse.json(
          { message: "Valid category_id is required" },
          { status: 400 },
        );
      }
      product.set("category_id", categoryId);
    }

    if (hasImages) {
      product.set("images", parseImages(body?.images));
    }

    if (hasQty) {
      const qty = parseNumber(body?.qty);
      if (qty === undefined || qty < 0) {
        return NextResponse.json(
          { message: "Qty must be 0 or greater" },
          { status: 400 },
        );
      }
      product.set("qty", Math.trunc(qty));
    }

    if (hasSoldQty) {
      const soldQty = parseNumber(body?.sold_qty);
      if (soldQty === undefined || soldQty < 0) {
        return NextResponse.json(
          { message: "Sold qty must be 0 or greater" },
          { status: 400 },
        );
      }
      product.set("sold_qty", Math.trunc(soldQty));
    }

    if (hasDescription) {
      product.set("description", normalizeText(body?.description) || null);
    }

    if (hasWeight) {
      product.set("weight", normalizeText(body?.weight) || null);
    }

    if (hasLength) {
      product.set("length", normalizeText(body?.length) || null);
    }

    if (hasBreadth) {
      product.set("breadth", normalizeText(body?.breadth) || null);
    }

    if (hasHight) {
      product.set("hight", normalizeText(body?.hight) || null);
    }

    if (hasPrise) {
      const prise = parseNumber(body?.prise);
      if (prise === undefined || prise < 0) {
        return NextResponse.json(
          { message: "Prise must be 0 or greater" },
          { status: 400 },
        );
      }
      product.set("prise", prise);
    }

    if (hasOfferPrise) {
      const offerPrise = parseNumber(body?.offer_prise);
      if (offerPrise !== undefined && offerPrise < 0) {
        return NextResponse.json(
          { message: "Offer prise must be 0 or greater" },
          { status: 400 },
        );
      }
      product.set("offer_prise", offerPrise ?? null);
    }

    if (hasTax) {
      const tax = parseNumber(body?.tax);
      if (tax === undefined || tax < 0) {
        return NextResponse.json(
          { message: "Tax must be 0 or greater" },
          { status: 400 },
        );
      }
      product.set("tax", tax);
    }

    if (hasHsn) {
      product.set("hsn", normalizeText(body?.hsn) || null);
    }

    if (hasSeoTitle) {
      product.set(
        "seo_title",
        normalizeText(body?.seo_title ?? body?.sep_title) || null,
      );
    }

    if (hasSeoDescription) {
      product.set(
        "seo_descrition",
        normalizeText(body?.seo_descrition) || null,
      );
    }

    if (hasKeywords) {
      product.set("keywords", parseKeywords(body?.keywords));
    }

    if (hasQtyOffers) {
      const parsedQtyOffers = parseQtyOffers(body?.qty_offers);
      if (parsedQtyOffers.error) {
        return NextResponse.json(
          { message: parsedQtyOffers.error },
          { status: 400 },
        );
      }
      product.set("qty_offers", parsedQtyOffers.data);
    }

    if (hasNewProduct) {
      const newProduct = parseBoolean(body?.new_product);
      if (newProduct === undefined) {
        return NextResponse.json(
          { message: "new_product must be boolean" },
          { status: 400 },
        );
      }
      product.set("new_product", newProduct);
    }

    if (hasIsTop) {
      const isTop = parseBoolean(body?.is_top);
      if (isTop === undefined) {
        return NextResponse.json(
          { message: "is_top must be boolean" },
          { status: 400 },
        );
      }
      product.set("is_top", isTop);
    }

    if (hasIsBest) {
      const isBest = parseBoolean(body?.is_best);
      if (isBest === undefined) {
        return NextResponse.json(
          { message: "is_best must be boolean" },
          { status: 400 },
        );
      }
      product.set("is_best", isBest);
    }

    if (hasStatus) {
      const status = normalizeText(body?.status);
      if (status !== "active" && status !== "inactive") {
        return NextResponse.json(
          { message: "Status must be 'active' or 'inactive'" },
          { status: 400 },
        );
      }
      product.set("status", status);
    }

    await product.save();

    return NextResponse.json(
      {
        message: "Product updated successfully",
        data: product,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update product" },
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

    const productId = parseProductId(request, body);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { message: "Valid product id is required" },
        { status: 400 },
      );
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    await product.destroy();

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
