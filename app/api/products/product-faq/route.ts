import FAQ from "@/model/faq";
import Product from "@/model/product";
import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
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
      const faq = await FAQ.findByPk(idParam);

      if (!faq) {
        return NextResponse.json({ message: "FAQ not found" }, { status: 404 });
      }

      return NextResponse.json(
        {
          message: "FAQ fetched successfully",
          data: faq,
        },
        { status: 200 },
      );
    }

    if (Number.isInteger(productIdParam) && productIdParam > 0) {
      const faqs = await FAQ.findAll({
        where: { product_id: productIdParam },
        order: [["createdAt", "DESC"]],
      });

      return NextResponse.json(
        {
          message: "FAQ list fetched successfully",
          data: faqs,
        },
        { status: 200 },
      );
    }

    if (productNameParam) {
      const faqs = await FAQ.findAll({
        where: { product_name: productNameParam.toLowerCase() },
        order: [["createdAt", "DESC"]],
      });

      return NextResponse.json(
        {
          message: "FAQ list fetched successfully",
          data: faqs,
        },
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

    const { count, rows } = await FAQ.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "FAQ list fetched successfully",
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
  } catch (error) {
    console.log("this is rhe err", error);
    return NextResponse.json(
      { message: "Failed to fetch FAQ data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const productId = Number(body?.product_id);
    const productName = normalizeText(body?.product_name).toLowerCase();
    const question = normalizeText(body?.question);
    const answer = normalizeText(body?.answer);
    const name = normalizeText(body?.name) || null;

    if (!Number.isInteger(productId) || productId <= 0 || !productName) {
      return NextResponse.json(
        { message: "product_id and product_name are required" },
        { status: 400 },
      );
    }

    if (!question || !answer) {
      return NextResponse.json(
        { message: "question and answer are required" },
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

    const productSlug = normalizeText(product.get("slug")).toLowerCase();
    if (productSlug !== productName) {
      return NextResponse.json(
        { message: "product_name must match selected product slug" },
        { status: 400 },
      );
    }

    const faq = await FAQ.create({
      product_id: productId,
      product_name: productName,
      question,
      answer,
      name,
    });

    return NextResponse.json(
      {
        message: "FAQ created successfully",
        data: faq,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("this is rhe err", error);
    return NextResponse.json(
      { message: "Failed to create FAQ" },
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
        { message: "Valid FAQ id is required" },
        { status: 400 },
      );
    }

    const faq = await FAQ.findByPk(id);
    if (!faq) {
      return NextResponse.json({ message: "FAQ not found" }, { status: 404 });
    }

    const hasProductId = Object.prototype.hasOwnProperty.call(
      body,
      "product_id",
    );
    const hasProductName = Object.prototype.hasOwnProperty.call(
      body,
      "product_name",
    );
    const hasQuestion = Object.prototype.hasOwnProperty.call(body, "question");
    const hasAnswer = Object.prototype.hasOwnProperty.call(body, "answer");
    const hasName = Object.prototype.hasOwnProperty.call(body, "name");

    if (
      !hasProductId &&
      !hasProductName &&
      !hasQuestion &&
      !hasAnswer &&
      !hasName
    ) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    const nextProductId = hasProductId
      ? Number(body?.product_id)
      : Number(faq.get("product_id"));
    const nextProductName = hasProductName
      ? normalizeText(body?.product_name).toLowerCase()
      : normalizeText(faq.get("product_name")).toLowerCase();

    if (
      !Number.isInteger(nextProductId) ||
      nextProductId <= 0 ||
      !nextProductName
    ) {
      return NextResponse.json(
        { message: "Valid product_id and product_name are required" },
        { status: 400 },
      );
    }

    const product = await Product.findByPk(nextProductId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const productSlug = normalizeText(product.get("slug")).toLowerCase();
    if (productSlug !== nextProductName) {
      return NextResponse.json(
        { message: "product_name must match selected product slug" },
        { status: 400 },
      );
    }

    if (hasProductId) {
      faq.set("product_id", nextProductId);
    }

    if (hasProductName) {
      faq.set("product_name", nextProductName);
    }

    if (hasQuestion) {
      const question = normalizeText(body?.question);
      if (!question) {
        return NextResponse.json(
          { message: "question cannot be empty" },
          { status: 400 },
        );
      }
      faq.set("question", question);
    }

    if (hasAnswer) {
      const answer = normalizeText(body?.answer);
      if (!answer) {
        return NextResponse.json(
          { message: "answer cannot be empty" },
          { status: 400 },
        );
      }
      faq.set("answer", answer);
    }

    if (hasName) {
      faq.set("name", normalizeText(body?.name) || null);
    }

    await faq.save();

    return NextResponse.json(
      {
        message: "FAQ updated successfully",
        data: faq,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update FAQ" },
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
        { message: "Valid FAQ id is required" },
        { status: 400 },
      );
    }

    const faq = await FAQ.findByPk(id);
    if (!faq) {
      return NextResponse.json({ message: "FAQ not found" }, { status: 404 });
    }

    await faq.destroy();

    return NextResponse.json(
      { message: "FAQ deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete FAQ" },
      { status: 500 },
    );
  }
}
