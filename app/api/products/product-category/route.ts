import Category from "@/model/categories";
import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parseCategoryId(request: Request, body?: Record<string, unknown>) {
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

    if (Number.isInteger(idParam) && idParam > 0) {
      const category = await Category.findByPk(idParam);

      if (!category) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }

      return NextResponse.json(
        {
          message: "Category fetched successfully",
          data: category,
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

    const { count, rows } = await Category.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "Category list fetched successfully",
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
      { message: "Failed to fetch category data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = normalizeText(body?.name);
    const slug = normalizeText(body?.slug).toLowerCase();
    const image = normalizeText(body?.image) || null;
    const status = normalizeText(body?.status) || "active";

    if (!name || !slug) {
      return NextResponse.json(
        { message: "Name and slug are required" },
        { status: 400 },
      );
    }

    if (status !== "active" && status !== "inactive") {
      return NextResponse.json(
        { message: "Status must be 'active' or 'inactive'" },
        { status: 400 },
      );
    }

    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
      return NextResponse.json(
        { message: "Category already exists with this slug" },
        { status: 409 },
      );
    }

    const category = await Category.create({
      name,
      slug,
      image,
      status,
    });

    return NextResponse.json(
      {
        message: "Category created successfully",
        data: category,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const categoryId = parseCategoryId(request, body);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { message: "Valid category id is required" },
        { status: 400 },
      );
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    const name = normalizeText(body?.name);
    const slug = normalizeText(body?.slug).toLowerCase();
    const hasImageKey = Object.prototype.hasOwnProperty.call(body, "image");
    const image = hasImageKey ? normalizeText(body?.image) || null : undefined;
    const status = normalizeText(body?.status);

    if (!name && !slug && image === undefined && !status) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    if (status && status !== "active" && status !== "inactive") {
      return NextResponse.json(
        { message: "Status must be 'active' or 'inactive'" },
        { status: 400 },
      );
    }

    if (slug) {
      const existingCategory = await Category.findOne({ where: { slug } });
      if (existingCategory && Number(existingCategory.get("id")) !== categoryId) {
        return NextResponse.json(
          { message: "Category slug is already in use" },
          { status: 409 },
        );
      }
      category.set("slug", slug);
    }

    if (name) {
      category.set("name", name);
    }

    if (image !== undefined) {
      category.set("image", image);
    }

    if (status) {
      category.set("status", status);
    }

    await category.save();

    return NextResponse.json(
      {
        message: "Category updated successfully",
        data: category,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update category" },
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

    const categoryId = parseCategoryId(request, body);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { message: "Valid category id is required" },
        { status: 400 },
      );
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    await category.destroy();

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 },
    );
  }
}
