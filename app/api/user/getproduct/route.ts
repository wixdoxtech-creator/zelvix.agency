import Category from "@/model/categories";
import Product from "@/model/product";
import ProductDetaile from "@/model/productdetaile";
import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = normalizeText(searchParams.get("slug")).toLowerCase();

    if (!slug) {
      return NextResponse.json(
        { message: "Product slug is required" },
        { status: 400 },
      );
    }

    const product = await Product.findOne({
      where: { slug, status: "active" },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const productData = product.toJSON() as Record<string, unknown>;
    const categoryId = Number(productData.category_id);

    const [category, details] = await Promise.all([
      Number.isInteger(categoryId) && categoryId > 0
        ? Category.findByPk(categoryId)
        : Promise.resolve(null),
      ProductDetaile.findOne({
        where: { product_id: Number(productData.id) },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Product fetched successfully",
        data: {
          product,
          category,
          details,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch product by slug" },
      { status: 500 },
    );
  }
}
