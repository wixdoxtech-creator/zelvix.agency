import Link from "next/link";
import { CheckCircle2, ShieldCheck, Sparkles, Star } from "lucide-react";
import Category from "@/model/categories";
import FAQ from "@/model/faq";
import ProductModel from "@/model/product";
import ProductDetaile from "@/model/productdetaile";
import Review from "@/model/review";
import type { BenefitItem, ProductDetail } from "@/type";
import ProductBenefits from "@/Component/UserComponent/ProductBenefits";
import HowToUseProduct from "@/Component/UserComponent/HowToUseProduct";
import FAQSection from "@/Component/UserComponent/FAQSection";
import { Compare } from "@/Component/UserComponent/Compare";
import ProductReview from "@/Component/UserComponent/ProductReview";
import ProductImageGallery from "@/Component/UserComponent/ProductImageGallery";
import ProductCartActions from "@/Component/UserComponent/ProductCartActions";

type ProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

type DetailRow = {
  img?: string;
  heding?: string;
  pera?: string;
  heading?: string;
  paragraf?: string;
  protip?: string[];
};

const parseRows = (value: unknown): DetailRow[] => {
  if (Array.isArray(value)) {
    return value as DetailRow[];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as DetailRow[]) : [];
    } catch {
      return [];
    }
  }

  return [];
};

const parseImages = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item ?? "").trim())
          .filter((item) => item.length > 0);
      }
    } catch {
      const text = value.trim();
      return text ? [text] : [];
    }
  }

  return [];
};

type QtyOffer = {
  qty: number;
  price: number;
  label: string;
  label2: string;
};

const parseQtyOffers = (value: unknown): QtyOffer[] => {
  const source =
    typeof value === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : Array.isArray(value)
        ? value
        : [];

  return source
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const row = item as Record<string, unknown>;
      const qty = Number(row.qty);
      const price = Number(row.price);
      const label = String(row.label ?? "").trim();
      const label2 = String(row.label2 ?? "").trim();

      if (
        !Number.isFinite(qty) ||
        qty <= 0 ||
        !Number.isFinite(price) ||
        !label
      ) {
        return null;
      }

      return {
        qty: Math.trunc(qty),
        price: Number(price.toFixed(2)),
        label,
        label2,
      };
    })
    .filter((item): item is QtyOffer => item !== null)
    .sort((a, b) => a.qty - b.qty);
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const ProductDetailsPage = async ({ params }: ProductDetailsPageProps) => {
  const { id } = await params;

  const productRow = await ProductModel.findOne({
    where: { slug: id, status: "active" },
  });

  if (!productRow) {
    return (
      <main className="w-full min-h-screen bg-[#faf8f5] py-12">
        <div className="mx-auto w-[95%] max-w-7xl text-center md:w-[90%]">
          <h1 className="text-3xl font-bold text-[#1F2F46]">
            Product Not Found
          </h1>
          <p className="mt-3 text-sm text-[#2F4A68]">
            This product does not exist. Try opening a valid product link.
          </p>
          <Link
            href="/health-categories"
            className="mt-6 inline-flex rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-5 py-2 text-sm font-semibold text-[#FFF1EB]"
          >
            Browse Categories
          </Link>
        </div>
      </main>
    );
  }

  const productData = productRow.toJSON() as Record<string, unknown>;
  const productId = Number(productData.id);
  const categoryId = Number(productData.category_id);

  const [categoryRow, detailRow] = await Promise.all([
    Number.isInteger(categoryId) && categoryId > 0
      ? Category.findByPk(categoryId)
      : Promise.resolve(null),
    Number.isInteger(productId) && productId > 0
      ? ProductDetaile.findOne({ where: { product_id: productId } })
      : Promise.resolve(null),
  ]);
  const [faqRows, reviewRows] = await Promise.all([
    Number.isInteger(productId) && productId > 0
      ? FAQ.findAll({
          where: { product_id: productId },
          order: [["createdAt", "DESC"]],
        })
      : Promise.resolve([]),
    Number.isInteger(productId) && productId > 0
      ? Review.findAll({
          where: { product_id: productId, is_active: true },
          order: [["createdAt", "DESC"]],
        })
      : Promise.resolve([]),
  ]);

  const categoryName = String(categoryRow?.get("name") ?? "Wellness");
  const qtyOffers = parseQtyOffers(productData.qty_offers);
  const details =
    (detailRow?.toJSON() as Record<string, unknown> | undefined) ?? undefined;
  const compareFirstImage =
    String(details?.img1 ?? "").trim() || "/kaamdeep1.webp";
  const compareSecondImage =
    String(details?.img2 ?? "").trim() || "/kaamdeep2.webp";

  const benefits = parseRows(details?.benefits);
  const ingredients = parseRows(details?.Ingredients);
  const useRows = parseRows(details?.Use);
  const faqs = faqRows
    .map((item) => item.toJSON() as Record<string, unknown>)
    .map((row) => ({
      question: String(row.question ?? "").trim(),
      answer: String(row.answer ?? "").trim(),
    }))
    .filter((row) => row.question.length > 0 && row.answer.length > 0);
  const reviewCards = reviewRows
    .map((item) => item.toJSON() as Record<string, unknown>)
    .map((row) => ({
      name: String(row.name ?? "").trim() || "Customer",
      role: "Verified Customer",
      comment: String(row.dis ?? "").trim() || "Shared a product experience.",
      rating: Math.max(0, Math.min(5, Number(row.rating ?? 0) || 0)),
      image: String(row.image ?? "").trim() || "/homeImage2.webp",
    }));

  const mappedProduct: ProductDetail = {
    slug: String(productData.slug ?? id),
    title: String(productData.name ?? "Product"),
    category: categoryName,
    description: String(productData.description ?? "").trim(),
    orgPrice: toNumber(productData.prise),
    disPrice: toNumber(productData.offer_prise ?? productData.prise),
    rating: 4,
    images:
      parseImages(productData.images).length > 0
        ? parseImages(productData.images)
        : ["/homeImage2.webp"],
    aboutPoints: benefits
      .map((row) => String(row.heding ?? row.pera ?? "").trim())
      .filter((row) => row.length > 0)
      .slice(0, 6),
    benefits: benefits
      .map((row) => ({
        heding: String(row.heding ?? "").trim(),
        img: String(row.img ?? "").trim(),
        pera: String(row.pera ?? "").trim(),
      }))
      .filter(
        (row): row is BenefitItem => !!(row.heding || row.pera || row.img),
      )
      .slice(0, 6),
    ingredients: ingredients.slice(0, 8).map((row, index) => ({
      id: index + 1,
      image: String(row.img ?? "/homeImage2.webp"),
      name: String(row.heding ?? `Ingredient ${index + 1}`),
      text: String(row.pera ?? ""),
    })),
    ayurvedicSteps: useRows.slice(0, 6).map((row, index) => ({
      number: String(index + 1).padStart(2, "0"),
      title: String(row.heading ?? `Step ${index + 1}`),
      description: String(row.paragraf ?? ""),
      image: String(row.img ?? "/homeImage2.webp"),
      tips: Array.isArray(row.protip)
        ? row.protip
            .map((tip) => String(tip ?? "").trim())
            .filter((tip) => tip.length > 0)
        : [],
    })),
    faqs,
  };

  const product: ProductDetail = {
    ...mappedProduct,
    aboutPoints:
      mappedProduct.aboutPoints.length > 0
        ? mappedProduct.aboutPoints
        : [
            "Supports daily wellness routine",
            "Designed for consistent long-term use",
            "Ayurvedic formulation with targeted support",
          ],
    benefits:
      mappedProduct.benefits && mappedProduct.benefits.length > 0
        ? mappedProduct.benefits
        : [
            {
              heding: "Routine Wellness Support",
              img: "/Reduces_Addictive_Cravings.webp",
              pera: "Supports daily wellness routine.",
            },
            {
              heding: "Consistent Care",
              img: "/Reduces_Addictive_Cravings.webp",
              pera: "Designed for long-term daily use.",
            },
            {
              heding: "Ayurvedic Formula",
              img: "/Reduces_Addictive_Cravings.webp",
              pera: "Targeted support using selected herbal ingredients.",
            },
          ],
    ingredients:
      mappedProduct.ingredients.length > 0
        ? mappedProduct.ingredients
        : [
            {
              id: 1,
              image: "/homeImage2.webp",
              name: "Ayurvedic Blend",
              text: "Carefully selected herbal components for daily support.",
            },
          ],
    ayurvedicSteps:
      mappedProduct.ayurvedicSteps.length > 0
        ? mappedProduct.ayurvedicSteps
        : [
            {
              number: "01",
              title: "Use Consistently",
              description:
                "Take this product regularly as advised to get better routine outcomes.",
              image: "/homeImage2.webp",
              tips: [
                "Use fixed timings",
                "Follow label guidance",
                "Review progress weekly",
              ],
            },
          ],
  };

  return (
    <main className="w-full  bg-linear-to-b from-[#faf8f5] via-[#fdfdfc] to-[#f5f9ff] py-10 md:py-14">
      <section className="mx-auto w-[95%] max-w-7xl md:w-[90%]">
        <div className="grid grid-cols-1 items-start gap-10 rounded-3xl border border-[#dbe7f1] bg-white/80 p-5 shadow-[0_20px_45px_rgba(31,47,70,0.08)] backdrop-blur-sm md:grid-cols-2 md:p-8">
          <ProductImageGallery
            images={product.images}
            title={product.title}
            slug={product.slug}
          />

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E0D2A7] bg-[#fff8e6] px-3 py-1 text-xs font-semibold text-[#8f6a1a]">
                <Sparkles className="h-3.5 w-3.5" />
                Ayurvedic Formula
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#b8d3e8] bg-[#eef6ff] px-3 py-1 text-xs font-semibold text-[#2f4a68]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Trusted Wellness Support
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#4A63A3]">
              {product.category}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#1F2F46] md:text-4xl">
              {product.title}
            </h1>
            Detailed Product Insights
            <div className="mt-3 flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={`${product.slug}-rating-${i}`}
                  className={`h-4 w-4 ${
                    i < product.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
              <span className="text-sm font-medium text-[#2F4A68]">
                {product.rating}.0/5
              </span>
            </div>
            <p className="mt-5 text-sm leading-7 text-[#2F4A68] md:text-base">
              {product.description}
            </p>
            <ul className="mt-5 space-y-2.5">
              {product.aboutPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-[#2F4A68] md:text-base"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <ProductCartActions
              product={{
                name: product.title,
                image: product.images[0] || "/homeImage2.webp",
                prise: product.disPrice,
                orgPrise: product.orgPrice,
              }}
              qtyOffers={qtyOffers}
            />
          </div>
        </div>
        <ProductBenefits
          productName={product.title}
          benefits={product.benefits}
        />

        <div className="mt-10 flex w-full flex-col items-center rounded-3xl p-4 md:p-6">
          <h2 className="mb-4 text-xl font-bold text-[#1F2F46] md:text-2xl">
            Visible Care Journey
          </h2>
          <p className="mb-6 text-sm text-[#2F4A68] md:text-base">
            See the difference routine-based wellness support can make over
            time.
          </p>
          <Compare
            firstImage={compareFirstImage}
            secondImage={compareSecondImage}
            slideMode="drag"
            autoplay={false}
          />
        </div>

        <section className="mt-12 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-[#1F2F46]">Key Ingredients</h2>
          <p className="mt-2 max-w-2xl text-center text-sm text-[#2F4A68] md:text-base">
            Each ingredient is selected to support the product goal through a
            balanced Ayurvedic formulation.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.ingredients.map((ing) => (
              <article
                key={ing.id}
                className="rounded-2xl border border-[#CFE4F2] bg-white/90 p-4 text-center shadow-[0_10px_24px_rgba(31,47,70,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_28px_rgba(31,47,70,0.14)]"
              >
                <img
                  src={ing.image}
                  alt={ing.name}
                  className="mx-auto h-20 w-20 rounded-full object-cover ring-2 ring-[#e3eff8]"
                />
                <h3 className="mt-3 text-base font-semibold text-[#1F2F46]">
                  {ing.name}
                </h3>
                <p className="mt-1 text-sm text-[#2F4A68]">{ing.text}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-16 space-y-10">
          <HowToUseProduct
            steps={product.ayurvedicSteps}
            subtitle={`Follow this step-by-step guide to use ${product.title} consistently and get better routine outcomes`}
          />
        </div>

        <div className="mt-10 flex w-full items-center">
          <ProductReview reviews={reviewCards} />
        </div>

        <FAQSection faqs={product.faqs} />
      </section>
    </main>
  );
};

export default ProductDetailsPage;
