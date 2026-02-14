"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { ProductDetail } from "@/type";
import ProductBenefits from "@/Component/UserComponent/ProductBenefits";
import HowToUseProduct from "@/Component/UserComponent/HowToUseProduct";
import FAQSection from "@/Component/UserComponent/FAQSection";
import { Compare } from "@/Component/UserComponent/Compare";
import ProductReview from "@/Component/UserComponent/ProductReview";

const products: ProductDetail[] = [
  {
    slug: "arshveda",
    title: "Arshveda",
    category: "Digestive & Recovery",
    description:
      "Arshveda is an Ayurvedic formula designed to support comfort in piles and fissure-related issues by helping digestion, soothing irritation, and supporting internal healing.",
    orgPrice: 3998,
    disPrice: 3499,
    rating: 4,
    images: [
      "/product/Arshveda1.webp",
      "/product/Arshveda2.webp",
      "/product/Arshveda3.webp",
      "/homeImage2.webp",
      "/herbs-step.webp",
    ],
    aboutPoints: [
      "Relieves piles and fissure discomfort",
      "Supports smooth bowel movement",
      "Helps reduce irritation and burning",
      "Ayurvedic support for long-term comfort",
    ],
    ingredients: [
      {
        id: 1,
        image: "/Key_Ingredients/Haritaki.webp",
        name: "Haritaki",
        text: "Supports digestion and natural cleansing.",
      },
      {
        id: 2,
        image: "/Key_Ingredients/Triphala.webp",
        name: "Triphala",
        text: "Traditional blend for gut and bowel balance.",
      },
      {
        id: 3,
        image: "/Key_Ingredients/Nagkesar.webp",
        name: "Nagkesar",
        text: "Helps soothe tissue irritation and discomfort.",
      },
      {
        id: 4,
        image: "/Key_Ingredients/Guduchi.webp",
        name: "Guduchi",
        text: "Supports immunity and internal recovery.",
      },
    ],
    ayurvedicSteps: [
      {
        number: "01",
        title: "Internal Support with Capsule & Powder",
        description:
          "Arshveda Capsule and Powder are designed to support internal balance and digestive comfort when taken regularly as advised.",
        image: "/arshveda1.webp",
        tips: [
          "Capsule: Take 1 capsule twice daily with lukewarm water",
          "Preferably consume capsules after meals",
          "Powder: Take 1 teaspoon with lukewarm water or milk",
          "Powder can be taken once or twice daily, as advised",
        ],
      },
      {
        number: "02",
        title: "External Care with Arshveda Oil",
        description:
          "Arshveda Oil is meant for external application to support local comfort.",
        image: "/arshveda2.webp",
        tips: [
          "Apply a small amount on the affected area",
          "Use once or twice daily as needed",
        ],
      },
      {
        number: "03",
        title: "Maintain Consistency & Healthy Routine",
        description:
          "For best results, use Arshveda products consistently as part of a balanced diet and healthy lifestyle. These Ayurvedic formulations are intended to support overall wellness and are not a substitute for medical treatment.",
        image: "/suramukta3.webp",
        tips: [
          "Use regularly for consistent support",
          "Follow a balanced diet and active routine",
          "Consult a professional if pregnant, nursing, or under medical supervision",
        ],
      },
    ],
    faqs: [
      {
        question: "What is Arshveda used for?",
        answer:
          "Arshveda is an Ayurvedic formulation designed to support relief from piles (hemorrhoids) and anal fissures by easing discomfort and promoting natural healing.",
      },
      {
        question: "Is Arshveda effective for both piles and fissures?",
        answer:
          "Yes, Arshveda helps reduce pain, burning sensation, swelling, and supports healing in both piles and fissure conditions.",
      },
      {
        question: "Is Arshveda safe for long-term use?",
        answer:
          "Arshveda is made with natural Ayurvedic ingredients and is generally safe when taken as directed, without causing dependency.",
      },
      {
        question: "Does Arshveda help with pain and bleeding?",
        answer:
          "Yes, it helps soothe irritation, reduce pain, and support the body in managing bleeding associated with piles and fissures.",
      },
      {
        question: "Can Arshveda be taken with other medicines?",
        answer:
          "Arshveda can usually be taken alongside other treatments, but it is advisable to consult an Ayurvedic expert for personalised guidance.",
      },
    ],
  },
  {
    slug: "ashmak",
    title: "Ashmak",
    category: "Strength & Vitality",
    description:
      "Ashmak supports stamina, confidence, and male vitality through a balanced Ayurvedic blend aimed at long-term strength and energy.",
    orgPrice: 9999,
    disPrice: 6999,
    rating: 5,
    images: [
      "/product/ashmak1.webp",
      "/product/ashmak2.webp",
      "/product/ashmak3.webp",
      "/product/ashmak4.webp",
      "/homeImage2.webp",
    ],
    aboutPoints: [
      "Supports daily energy and stamina",
      "Promotes strength and endurance",
      "Helps with stress-related performance fatigue",
      "Designed for consistent wellness support",
    ],
    ingredients: [
      {
        id: 5,
        image: "/Key_Ingredients/Ashwagandha.webp",
        name: "Ashwagandha",
        text: "Supports strength, stress balance, and vitality.",
      },
      {
        id: 6,
        image: "/Key_Ingredients/Shilajit.webp",
        name: "Shilajit",
        text: "Known for stamina and endurance support.",
      },
      {
        id: 7,
        image: "/Key_Ingredients/SafedMusli.webp",
        name: "Safed Musli",
        text: "Traditional herb for energy and performance.",
      },
      {
        id: 8,
        image: "/Key_Ingredients/KaunchBeej.webp",
        name: "Kaunch Beej",
        text: "Supports reproductive health and strength.",
      },
    ],
    ayurvedicSteps: [
      {
        number: "01",
        title: "Daily Strength Routine",
        description:
          "Use Ashmak daily as advised to support stamina, vitality, and stress resilience over time.",
        image: "/ashmak1.webp",
        tips: [
          "Take with lukewarm water or milk for better absorption",
          "Prefer fixed morning and evening timing for consistency",
          "Do not skip doses during the first 4-6 weeks",
        ],
      },
      {
        number: "02",
        title: "Support with Nutrition & Rest",
        description:
          "Combine the regimen with protein-rich meals, hydration, and adequate sleep to maximise benefits.",
        image: "/ashmak2.webp",
        tips: [
          "Avoid long gaps between meals",
          "Prioritize 7-8 hours of sleep nightly",
          "Limit alcohol and smoking for better results",
        ],
      },
      {
        number: "03",
        title: "Track Progress & Adjust",
        description:
          "Monitor weekly energy, endurance, and recovery. Continue consistently and review dosage with an expert when needed.",
        image: "/ashmak3.webp",
        tips: [
          "Follow a regular workout or walking routine",
          "Stay consistent for at least 8-12 weeks",
          "Consult a professional if you have ongoing medical conditions",
        ],
      },
    ],
    faqs: [
      {
        question: "What is Ashmak used for?",
        answer:
          "Ashmak is designed to support male vitality, stamina, confidence, and long-term strength with an Ayurvedic approach.",
      },
      {
        question: "How soon can I expect results with Ashmak?",
        answer:
          "Many users notice early energy improvements in a few weeks, while deeper stamina and performance benefits usually need consistent use over 8-12 weeks.",
      },
      {
        question: "Can Ashmak be used long term?",
        answer:
          "Ashmak is generally suitable for longer use when taken as directed. Periodic review with an expert is recommended.",
      },
      {
        question: "Can I take Ashmak with gym supplements?",
        answer:
          "In many cases yes, but confirm with a healthcare professional to avoid overlap with stimulant-heavy products.",
      },
      {
        question: "Is Ashmak only for older men?",
        answer:
          "No. Adults with stress, fatigue, low stamina, or reduced vitality may use it with proper guidance.",
      },
    ],
  },
  {
    slug: "asthithrive",
    title: "AsthiThrive",
    category: "Joint & Bone Care",
    description:
      "AsthiThrive supports joint flexibility, bone nourishment, and movement comfort with regular external and internal Ayurvedic support.",
    orgPrice: 5998,
    disPrice: 4999,
    rating: 4,
    images: [
      "/product/Asthithrive1.webp",
      "/product/Asthithrive2.webp",
      "/product/Asthithrive3.webp",
      "/product/Asthithrive4.webp",
      "/herbs-step.webp",
    ],
    aboutPoints: [
      "Supports joint mobility and flexibility",
      "Helps reduce stiffness discomfort",
      "Promotes comfort in movement",
      "Designed for long-term wellness routine",
    ],
    ingredients: [
      {
        id: 9,
        image: "/Key_Ingredients/Nirgundi.webp",
        name: "Nirgundi",
        text: "Traditionally used for joint comfort.",
      },
      {
        id: 10,
        image: "/Key_Ingredients/Shallaki.webp",
        name: "Shallaki",
        text: "Supports healthy inflammatory response.",
      },
      {
        id: 11,
        image: "/Key_Ingredients/Guggul.webp",
        name: "Guggul",
        text: "Known for supporting mobility and tissue health.",
      },
      {
        id: 12,
        image: "/Key_Ingredients/Hadjod.webp",
        name: "Hadjod",
        text: "Traditionally used for bone support.",
      },
    ],
    ayurvedicSteps: [
      {
        number: "01",
        title: "Begin with Daily Joint Support",
        description:
          "Use AsthiThrive consistently to support flexibility, movement comfort, and bone nourishment.",
        image: "/asthithrive1.webp",
        tips: [
          "Take at the same time each day for better routine adherence",
          "Use with lukewarm water as recommended",
          "Avoid skipping doses in early weeks",
        ],
      },
      {
        number: "02",
        title: "Support Mobility with Light Activity",
        description:
          "Pair your regimen with gentle stretching and low-impact movement to improve joint comfort.",
        image: "/asthithrive2.webp",
        tips: [
          "Do 10-15 minutes of mobility work daily",
          "Avoid long sitting periods without movement breaks",
          "Use warm compression for occasional stiffness",
        ],
      },
      {
        number: "03",
        title: "Build a Long-Term Bone Care Habit",
        description:
          "Sustained results come from regular use, supportive nutrition, and an active routine designed for joint health.",
        image: "/asthithrive3.webp",
        tips: [
          "Include calcium and protein-rich foods in your meals",
          "Stay active with walking or light strengthening",
          "Consult a professional for severe or persistent discomfort",
        ],
      },
    ],
    faqs: [
      {
        question: "What is AsthiThrive used for?",
        answer:
          "AsthiThrive is designed to support joint flexibility, movement comfort, and bone wellness through Ayurvedic care.",
      },
      {
        question: "Who can use AsthiThrive?",
        answer:
          "Adults experiencing joint stiffness, movement discomfort, or age-related mobility concerns may benefit from it.",
      },
      {
        question: "How long should I use AsthiThrive?",
        answer:
          "Consistent use for at least 8-12 weeks is typically recommended for noticeable results in joint comfort.",
      },
      {
        question: "Can AsthiThrive be used with physiotherapy?",
        answer:
          "Yes. It can complement physiotherapy and mobility exercises as part of a broader recovery routine.",
      },
      {
        question: "Is AsthiThrive a replacement for medical treatment?",
        answer:
          "No. It is a wellness support product and should not replace medical treatment for major orthopedic conditions.",
      },
    ],
  },
];

const ProductDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const slug = params?.id ?? "";

  const product = useMemo(
    () => products.find((item) => item.slug === slug),
    [slug],
  );
  const [activeImage, setActiveImage] = useState(0);
  const discountPercentage = useMemo(() => {
    if (!product || product.orgPrice <= 0) return 0;
    return Math.round(
      ((product.orgPrice - product.disPrice) / product.orgPrice) * 100,
    );
  }, [product]);
  const safeActiveImage = useMemo(() => {
    if (!product || product.images.length === 0) return 0;
    return Math.min(activeImage, product.images.length - 1);
  }, [activeImage, product]);

  if (!product) {
    return (
      <main className="w-full bg-[#faf8f5] py-12">
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

  return (
    <main className="w-full bg-linear-to-b from-[#faf8f5] via-[#fdfdfc] to-[#f5f9ff] py-10 md:py-14">
      <section className="mx-auto w-[95%] max-w-7xl md:w-[90%]">
        <div className="grid grid-cols-1 items-start gap-10 rounded-3xl border border-[#dbe7f1] bg-white/80 p-5 shadow-[0_20px_45px_rgba(31,47,70,0.08)] backdrop-blur-sm md:grid-cols-2 md:p-8">
          <div>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1 shadow-[0_14px_30px_rgba(31,47,70,0.12)]">
              <img
                src={product.images[safeActiveImage]}
                alt={product.title}
                className="aspect-square w-full object-cover rounded-xl md:aspect-4/5"
              />
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {product.images.map((image, index) => (
                <button
                  key={`${product.slug}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`shrink-0 overflow-hidden rounded-lg border p-1 transition ${
                    activeImage === index
                      ? "border-[#1F2F46] bg-[#EAF2FF] ring-2 ring-[#9fb6d0]"
                      : "border-[#CFE4F2] bg-white hover:border-[#7b98b7]"
                  }`}
                  aria-label={`Show image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${product.title} image ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          </div>

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

            <div className="mt-5 rounded-2xl border border-[#d8e6f2] bg-[#f8fbff] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="flex items-center text-3xl font-bold text-[#1F2F46]">
                  <IndianRupee className="h-6 w-6" />
                  {product.disPrice}
                </p>
                <p className="flex items-center text-base text-[#5C8DB8] line-through">
                  <IndianRupee className="h-4 w-4" />
                  {product.orgPrice}
                </p>
                {discountPercentage > 0 && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Save {discountPercentage}%
                  </span>
                )}
              </div>
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

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                className="flex-1 rounded-full border border-[#2F4A68] bg-transparent px-6 py-3 text-sm font-semibold text-[#1F2F46] transition hover:bg-[#EAF2FF] md:flex-none"
              >
                Add to Cart
              </button>
              <button
                type="button"
                className="flex-1 rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-6 py-3 text-sm font-semibold text-[#FFF1EB] shadow-[0_10px_20px_rgba(31,47,70,0.25)] transition hover:opacity-90 md:flex-none"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#cfe4f2] bg-white px-3 py-1 text-xs text-[#2F4A68]">
                Natural ingredients
              </span>
              <span className="rounded-full border border-[#cfe4f2] bg-white px-3 py-1 text-xs text-[#2F4A68]">
                No habit-forming formula
              </span>
              <span className="rounded-full border border-[#cfe4f2] bg-white px-3 py-1 text-xs text-[#2F4A68]">
                Daily routine friendly
              </span>
            </div>
          </div>
        </div>
        <ProductBenefits
          productName={product.title}
          benefits={product.aboutPoints}
        />

        <div className="w-full mt-10 rounded-3xl  p-4 md:p-6 flex items-center flex-col">
          <h2 className="text-xl md:text-2xl font-bold text-[#1F2F46] mb-4">
            Visible Care Journey
          </h2>
          <p className="text-sm md:text-base text-[#2F4A68] mb-6">
            See the difference routine-based wellness support can make over
            time.
          </p>
          <Compare
            firstImage={"/kaamdeep1.webp"}
            secondImage={"/kaamdeep2.webp"}
            slideMode="drag"
            autoplay={false}
          />
        </div>

        <section className="mt-12 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-[#1F2F46]">Key Ingredients</h2>
          <p className="mt-2 text-sm md:text-base text-[#2F4A68] max-w-2xl text-center">
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

        <div className="w-full mt-10 flex items-center">
          <ProductReview />
        </div>

        <FAQSection faqs={product.faqs} />
      </section>
    </main>
  );
};

export default ProductDetailsPage;
