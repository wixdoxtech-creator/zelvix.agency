import Link from "next/link";
import {
  ArrowRight,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Product } from "@/type";

type CategoryPageProps = {
  params: Promise<{ id: string }>;
};

type CategoryContent = {
  title: string;
  description: string;
  heroNote: string;
  productSlugs: string[];
  keyBenefits: string[];
  lifestyleTips: string[];
  whoItsFor: string[];
  faqs: { question: string; answer: string }[];
  longFormTitle?: string;
  longFormContent?: string[];
};

const products: Product[] = [
  {
    slug: "arshveda",
    title: "Arshveda",
    category: "Digestive & Recovery",
    orgPrice: 3998,
    disPrice: 3499,
    rating: 4,
    description:
      "Arshveda is an Ayurvedic formula designed to support comfort in piles and fissure-related issues by helping digestion, soothing irritation, and supporting internal healing.",
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
        text: "Traditional blend for bowel regularity and gut rhythm.",
      },
      {
        id: 3,
        image: "/Key_Ingredients/Nagkesar.webp",
        name: "Nagkesar",
        text: "Traditionally used for local tissue comfort.",
      },
      {
        id: 4,
        image: "/Key_Ingredients/Guduchi.webp",
        name: "Guduchi",
        text: "Helps maintain daily immunity and recovery support.",
      },
    ],
  },
  {
    slug: "ashmak",
    title: "Ashmak",
    category: "Strength & Vitality",
    orgPrice: 9999,
    disPrice: 6999,
    rating: 5,
    description:
      "Ashmak supports stamina, confidence, and male vitality through a balanced Ayurvedic blend aimed at long-term strength and energy.",
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
        text: "Supports stress resilience and consistent strength.",
      },
      {
        id: 6,
        image: "/Key_Ingredients/Shilajit.webp",
        name: "Shilajit",
        text: "Traditionally used for energy and endurance support.",
      },
      {
        id: 7,
        image: "/Key_Ingredients/SafedMusli.webp",
        name: "Safed Musli",
        text: "Supports vitality and physical performance.",
      },
      {
        id: 8,
        image: "/Key_Ingredients/KaunchBeej.webp",
        name: "Kaunch Beej",
        text: "Helps support reproductive wellness and confidence.",
      },
    ],
  },
  {
    slug: "asthithrive",
    title: "AsthiThrive",
    category: "Joint & Bone Care",
    orgPrice: 5998,
    disPrice: 4999,
    rating: 4,
    description:
      "AsthiThrive supports joint flexibility, bone nourishment, and movement comfort with regular external and internal Ayurvedic support.",
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
        text: "Traditionally used to support joint comfort.",
      },
      {
        id: 10,
        image: "/Key_Ingredients/Shallaki.webp",
        name: "Shallaki",
        text: "Helps support healthy inflammatory response.",
      },
      {
        id: 11,
        image: "/Key_Ingredients/Guggul.webp",
        name: "Guggul",
        text: "Supports mobility and musculoskeletal wellness.",
      },
      {
        id: 12,
        image: "/Key_Ingredients/Hadjod.webp",
        name: "Hadjod",
        text: "Traditionally used for bone health support.",
      },
    ],
  },
];

const categoryMap: Record<string, CategoryContent> = {
  "addiction-support": {
    title: "Addiction Support",
    description:
      "Herbal products selected to support routine recovery, emotional steadiness, and better self-control.",
    heroNote:
      "Ayurveda approaches addictive habits as a full mind-body imbalance and focuses on stability, cleansing support, and routine discipline.",
    productSlugs: ["arshveda", "ashmak"],
    keyBenefits: [
      "Supports calmer daily routine and emotional balance",
      "Helps manage stress-linked urges",
      "Supports liver and digestive pathways during recovery",
      "Encourages long-term discipline with holistic routine",
    ],
    lifestyleTips: [
      "Maintain fixed sleep and wake timing",
      "Keep hydration and warm, light meals consistent",
      "Add 15-20 minutes of breathing or meditation daily",
      "Avoid common trigger environments in the first recovery phase",
    ],
    whoItsFor: [
      "Adults working on reducing alcohol and nicotine dependency",
      "People with stress-triggered repeat habit cycles",
      "Users building a structured recovery-friendly routine",
    ],
    faqs: [
      {
        question: "How long should I use category products?",
        answer:
          "Most users follow a minimum 8-12 week routine with lifestyle support for meaningful progress.",
      },
      {
        question: "Can I combine this with counseling?",
        answer:
          "Yes. A combined approach with counseling and daily routine discipline is often more effective.",
      },
    ],
    longFormTitle: "Understanding Addiction Support Through a Holistic Routine",
    longFormContent: [
      "Addiction support works best when it is understood as a long-term process rather than a short challenge. Many people first try to solve dependency with willpower alone, but urges are often linked to stress patterns, sleep disruption, social cues, emotional pain, and deeply repeated behavior loops. A practical wellness plan must therefore include body regulation, mental recovery, and daily structure. In an Ayurvedic lifestyle framework, the goal is to restore stability in digestion, sleep, and nervous system rhythm so cravings gradually lose intensity. This does not mean progress is always linear. It means setbacks are treated as data, and routine is rebuilt quickly. For users exploring herbal wellness support, consistency matters more than intensity. Small daily actions can create large change over weeks.",
      "A useful way to think about recovery is to divide it into three phases. The first phase is stabilization. Here, the priority is reducing chaos in schedule and reducing exposure to triggers. Fixed wake time, regular meals, hydration, and reduced late-night stimulation become essential. The second phase is repair. During this period, people often notice reduced urge intensity, better morning energy, and improved emotional control. This phase requires patience because confidence may return before habits are fully transformed. The third phase is resilience. In this stage, lifestyle systems are strong enough to handle stress without immediate relapse. Exercise, social accountability, and meaningful goals become protective factors. Herbal support can be used through all three phases, but it should always sit inside a wider behavior strategy that includes counseling or professional guidance when dependency has been severe or long standing.",
      "Nutrition has a major influence on cravings and impulse control. Skipped meals, excess sugar, and poor hydration can destabilize mood and increase compulsive behavior. A recovery-friendly nutrition pattern usually includes warm, easy-to-digest meals at predictable times, balanced protein intake, and steady fiber from vegetables and whole foods. Late heavy dinners and long fasting windows can worsen irritability in some users, especially during early recovery. Caffeine and nicotine interactions should also be reviewed because they can increase anxiety spikes and sleep disruption. People often underestimate this link. When the body receives stable fuel, the brain can make better decisions under stress. This is why food timing is not a minor detail. It is a core recovery tool. Even modest improvements in meal quality and timing can reduce trigger vulnerability over time.",
      "Sleep discipline is another non-negotiable pillar in addiction support. Cravings and emotional reactivity rise when sleep is inconsistent, short, or fragmented. Many users focus on daytime control but ignore night routine, which then weakens next-day decision-making. A better approach is to protect a predictable sleep window, reduce screens before bed, and avoid stimulating content late at night. Light evening stretches, breathing work, and warm hydration can help downshift the nervous system. If sleep is poor for multiple weeks, the entire routine becomes harder to sustain, and relapse risk increases. In practical terms, sleep quality supports impulse control, stress tolerance, and mood regulation. These are exactly the capacities needed to resist old behavior loops. Any category plan for addiction support should include sleep review every week, not only product adherence.",
      "Stress regulation skills are the bridge between intention and behavior. Most relapse episodes are not random. They are responses to pressure, loneliness, conflict, fatigue, or boredom. This means users need quick, repeatable stress tools that can be used in real life, not only in ideal conditions. Effective options include short breathing cycles, 10-minute walks after stressful events, journaling urge patterns, and contacting an accountability partner before a high-risk decision. A simple rule helps: delay the urge by ten minutes while doing a grounding task. Many urges peak and drop in that window. Over time, this builds confidence that impulses are manageable. Herbal wellness products may support calmness and routine balance, but behavior skills make the difference in critical moments. The strongest plans combine both.",
      "Progress tracking should be simple and measurable. A daily scorecard can include sleep hours, craving intensity, energy level, hydration, movement, and adherence to planned routines. Weekly reflection then reveals patterns that are not obvious day to day. For example, a user may find that cravings rise after skipped breakfast, social isolation, or weekend sleep disruption. Once patterns are visible, prevention becomes easier. Celebrate process milestones, not only abstinence streaks: seven days of fixed wake time, two weeks of meal consistency, regular counseling attendance, or improved stress response under pressure. This prevents all-or-nothing thinking. If a lapse occurs, the focus should be rapid reset within twenty-four hours. Avoid guilt spirals. Review trigger context, adjust routine, and continue. Recovery success is built from many resets done correctly.",
      "When dependency history is moderate to severe, professional support is essential. Wellness products and lifestyle routines are supportive layers, not replacements for medical and psychological care. Users with withdrawal symptoms, heavy alcohol use, long-term sedative use, or major mental health concerns should seek supervised treatment plans. A combined model works best: clinician oversight, counseling, family education, and disciplined daily routine. In many cases, outcomes improve when people move from secrecy to structured support early. This protects safety and prevents prolonged harm. It is important to keep language realistic. Recovery is not weakness versus strength. It is biology, behavior, and environment interacting over time. With proper support, many users rebuild health, confidence, and stability significantly.",
      "For people starting today, begin with a seven-day foundation protocol. Set fixed wake and sleep times. Eat three balanced meals at regular timing. Drink enough water through the day. Remove one high-risk trigger from your environment. Practice a short evening wind-down routine. Track urges without judgment. Reach out to one trusted person for accountability. Follow product guidance consistently rather than changing too many variables at once. After one week, review what worked and what failed, then refine the plan. Over one to three months, this structured method can produce meaningful shifts in craving control, emotional steadiness, and day-to-day function. Addiction support is not about perfection. It is about building a life where healthy choices become easier, repeatable, and durable.",
    ],
  },
  "immunity-care": {
    title: "Immunity Care",
    description:
      "Products that help strengthen daily resilience, stamina, and recovery capacity.",
    heroNote:
      "Consistent sleep, digestion, and stress management are core Ayurvedic pillars for resilient immunity.",
    productSlugs: ["ashmak", "arshveda"],
    keyBenefits: [
      "Supports daily energy and natural defense readiness",
      "Helps maintain recovery after physical fatigue",
      "Supports stress resilience linked with immune function",
      "Strengthens consistency in overall wellness habits",
    ],
    lifestyleTips: [
      "Prefer warm, freshly cooked meals over processed food",
      "Keep moderate activity at least 5 days per week",
      "Prioritize deep sleep and late-night screen reduction",
      "Use seasonal herbs and hydration to support balance",
    ],
    whoItsFor: [
      "Adults with frequent fatigue or low stamina",
      "People rebuilding strength after high workload phases",
      "Users seeking routine wellness maintenance",
    ],
    faqs: [
      {
        question: "Are results immediate?",
        answer:
          "Immunity support is progressive and generally improves with consistency over multiple weeks.",
      },
      {
        question: "Can immunity products be used year-round?",
        answer:
          "Yes, with periodic review and dosage guidance based on season and individual constitution.",
      },
    ],
  },
  "digestive-health": {
    title: "Digestive Health",
    description:
      "Ayurvedic blends for digestive comfort, bowel balance, and better gut rhythm.",
    heroNote:
      "Strong digestion is treated as the foundation of systemic wellness in classical Ayurveda.",
    productSlugs: ["arshveda", "asthithrive"],
    keyBenefits: [
      "Supports bowel regularity and daily comfort",
      "Helps reduce bloating and digestive heaviness",
      "Supports metabolic rhythm and nutrient assimilation",
      "Promotes long-term gut-lifestyle stability",
    ],
    lifestyleTips: [
      "Eat meals at consistent times each day",
      "Use warm water through the day",
      "Reduce very cold, oily, and irregular snacking patterns",
      "Add gentle movement after meals",
    ],
    whoItsFor: [
      "Adults with irregular bowel routine",
      "People with stress-linked digestion discomfort",
      "Users building foundational gut wellness",
    ],
    faqs: [
      {
        question: "Should I change my food pattern too?",
        answer:
          "Yes. Product support with meal timing and lighter food improves outcomes significantly.",
      },
      {
        question: "Can digestive support help energy levels?",
        answer:
          "Often yes, because better digestion supports steadier nutrient uptake and daily energy.",
      },
    ],
  },
  "stress-and-sleep": {
    title: "Stress & Sleep",
    description:
      "Supportive options for calmness, recovery quality, and nervous system balance.",
    heroNote:
      "Ayurvedic stress and sleep care combines mental quieting, routine alignment, and restorative nutrition.",
    productSlugs: ["ashmak", "asthithrive"],
    keyBenefits: [
      "Supports calmer response to day-to-day stressors",
      "Helps improve sleep initiation and recovery quality",
      "Promotes focus and emotional steadiness",
      "Supports nervous system resilience over time",
    ],
    lifestyleTips: [
      "Avoid heavy meals close to bedtime",
      "Use a fixed digital cut-off at night",
      "Include evening breathing and light stretching",
      "Keep wake-up timing consistent even on weekends",
    ],
    whoItsFor: [
      "Adults with poor sleep quality",
      "People with high workload and nervous tension",
      "Users seeking better next-day mental clarity",
    ],
    faqs: [
      {
        question: "How quickly can sleep routine improve?",
        answer:
          "Many users notice early changes in 2-3 weeks, with deeper benefits from long-term consistency.",
      },
      {
        question: "Can stress products be used in daytime?",
        answer:
          "Yes, most formulations are designed for daily routine support without sedation.",
      },
    ],
  },
  "stress-ans-sleep": {
    title: "Stress & Sleep",
    description:
      "Supportive options for calmness, recovery quality, and nervous system balance.",
    heroNote:
      "Ayurvedic stress and sleep care combines mental quieting, routine alignment, and restorative nutrition.",
    productSlugs: ["ashmak", "asthithrive"],
    keyBenefits: [
      "Supports calmer response to day-to-day stressors",
      "Helps improve sleep initiation and recovery quality",
      "Promotes focus and emotional steadiness",
      "Supports nervous system resilience over time",
    ],
    lifestyleTips: [
      "Avoid heavy meals close to bedtime",
      "Use a fixed digital cut-off at night",
      "Include evening breathing and light stretching",
      "Keep wake-up timing consistent even on weekends",
    ],
    whoItsFor: [
      "Adults with poor sleep quality",
      "People with high workload and nervous tension",
      "Users seeking better next-day mental clarity",
    ],
    faqs: [
      {
        question: "How quickly can sleep routine improve?",
        answer:
          "Many users notice early changes in 2-3 weeks, with deeper benefits from long-term consistency.",
      },
      {
        question: "Can stress products be used in daytime?",
        answer:
          "Yes, most formulations are designed for daily routine support without sedation.",
      },
    ],
  },
  "liver-and-detox": {
    title: "Liver & Detox",
    description:
      "Herbal formulations focused on gentle detox support and metabolic balance.",
    heroNote:
      "Ayurvedic detox support favors gradual cleansing, digestive restoration, and sustainable habits.",
    productSlugs: ["arshveda", "ashmak"],
    keyBenefits: [
      "Supports natural detox pathways",
      "Helps with digestive and metabolic comfort",
      "Supports post-indulgence recovery rhythm",
      "Encourages clean-routine consistency",
    ],
    lifestyleTips: [
      "Use lighter dinners and adequate hydration",
      "Reduce excess sugar, alcohol, and fried food",
      "Add short post-meal walks for metabolism",
      "Keep sleep window stable to support liver rhythm",
    ],
    whoItsFor: [
      "Adults with sluggish daily recovery",
      "People restarting health routine after irregular habits",
      "Users wanting structured detox-friendly wellness support",
    ],
    faqs: [
      {
        question: "Is detox support safe for daily routine use?",
        answer:
          "Most users can follow routine detox support under recommended usage guidance.",
      },
      {
        question: "Should detox be intense?",
        answer:
          "Ayurvedic approach is generally gradual and sustainable rather than aggressive.",
      },
    ],
  },
  "energy-and-vitality": {
    title: "Energy & Vitality",
    description:
      "Performance and stamina focused products for sustained daily energy.",
    heroNote:
      "Ayurvedic vitality support focuses on strength, recovery, and adaptive energy instead of short spikes.",
    productSlugs: ["ashmak", "asthithrive"],
    keyBenefits: [
      "Supports stamina and physical performance",
      "Helps with fatigue and low motivation phases",
      "Supports confidence and overall vitality",
      "Promotes sustained energy across the day",
    ],
    lifestyleTips: [
      "Combine resistance and mobility training weekly",
      "Use protein-balanced meals at fixed timing",
      "Prioritize sleep recovery for hormonal balance",
      "Avoid dependence on excess caffeine spikes",
    ],
    whoItsFor: [
      "Adults with persistent low-energy patterns",
      "People under heavy physical or mental workload",
      "Users building consistent strength and endurance",
    ],
    faqs: [
      {
        question: "Can vitality support be used with exercise plans?",
        answer:
          "Yes, it pairs well with structured exercise, hydration, and recovery routines.",
      },
      {
        question: "Will energy support disturb sleep?",
        answer:
          "When taken as advised and timed well, it typically supports balanced daily energy without sleep disruption.",
      },
    ],
  },
};

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default async function HealthCategoryDetailsPage({
  params,
}: CategoryPageProps) {
  const { id } = await params;
  const category = categoryMap[id];

  if (!category) {
    return (
      <main className="w-full bg-[#faf8f5] py-12">
        <div className="mx-auto w-[95%] max-w-7xl text-center md:w-[90%]">
          <h1 className="text-3xl font-bold text-[#1F2F46]">
            Category Not Found
          </h1>
          <p className="mt-3 text-sm text-[#2F4A68]">
            This category does not exist. Please choose another health category.
          </p>
          <Link
            href="/health-categories"
            className="mt-6 inline-flex rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-5 py-2 text-sm font-semibold text-[#FFF1EB]"
          >
            Back to Categories
          </Link>
        </div>
      </main>
    );
  }

  const filteredProducts = products.filter((item) =>
    category.productSlugs.includes(item.slug),
  );

  return (
    <main className="w-full bg-[#faf8f5] py-10 md:py-14">
      <section className="mx-auto w-[95%] max-w-7xl md:w-[90%]">
        <div className="rounded-3xl border border-[#D6E6F3] bg-[linear-gradient(120deg,#ffffff_5%,#eef6ff_65%,#fff7ec_100%)] p-6 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4A63A3]">
            Health Category
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F2F46] md:text-5xl">
            {category.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[#2F4A68] md:text-base">
            {category.description}
          </p>
          <p className="mt-4 max-w-4xl rounded-2xl border border-[#CFE4F2] bg-white/75 p-4 text-sm leading-6 text-[#24425D]">
            {category.heroNote}
          </p>

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-[#CFE4F2] bg-white/80 p-3 text-[#1F2F46]">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-[#4A63A3]" />
                Product Matches
              </div>
              <p className="mt-1 text-[#2F4A68]">
                {filteredProducts.length} curated options
              </p>
            </div>
            <div className="rounded-xl border border-[#CFE4F2] bg-white/80 p-3 text-[#1F2F46]">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-[#4A63A3]" />
                Core Benefits
              </div>
              <p className="mt-1 text-[#2F4A68]">
                {category.keyBenefits.length} focus areas
              </p>
            </div>
            <div className="rounded-xl border border-[#CFE4F2] bg-white/80 p-3 text-[#1F2F46]">
              <div className="flex items-center gap-2 font-semibold">
                <ArrowRight className="h-4 w-4 text-[#4A63A3]" />
                Routine Guidance
              </div>
              <p className="mt-1 text-[#2F4A68]">
                Practical daily lifestyle support
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-[#1F2F46] md:text-3xl">
                Recommended Products
              </h2>
              <p className="mt-1 text-sm text-[#2F4A68]">
                Product suggestions aligned with {category.title.toLowerCase()}{" "}
                goals.
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-[#CFE4F2] bg-white/80 p-8 text-center">
              <p className="text-sm text-[#2F4A68]">
                No products found in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const discountPercent = Math.round(
                  ((product.orgPrice - product.disPrice) / product.orgPrice) *
                    100,
                );

                return (
                  <Link href={`/product/${product.slug}`} key={product.slug}>
                    <article className="group min-h-105 rounded-2xl border border-[#CFE4F2] bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_22px_rgba(31,47,70,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(31,47,70,0.14)]">
                      <div className="relative mb-4 overflow-hidden rounded-xl border border-[#ACE0F9] bg-[#FFF1EB]">
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-[#1F2F46] px-2.5 py-1 text-xs font-semibold text-white">
                          Save {discountPercent}%
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-[#1F2F46]">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#4A63A3]">
                        {product.category}
                      </p>

                      <div className="mt-2 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={`${product.slug}-${i}`}
                            className={`h-4 w-4 ${
                              i < product.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm text-[#2F4A68]">
                        {product.description}
                      </p>

                      <ul className="mt-3 space-y-1 text-xs text-[#2F4A68]">
                        {product.aboutPoints.slice(0, 3).map((point) => (
                          <li key={point}>- {point}</li>
                        ))}
                      </ul>

                      <div className="mt-3 flex items-center gap-3">
                        <p className="flex items-center text-lg font-bold text-[#1F2F46]">
                          <IndianRupee className="h-4 w-4" />
                          {formatINR(product.disPrice).replace("₹", "")}
                        </p>
                        <p className="flex items-center text-sm text-[#5C8DB8] line-through">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {formatINR(product.orgPrice).replace("₹", "")}
                        </p>
                      </div>

                      <span className="mt-4 inline-flex rounded-full border border-[#2F4A68] bg-transparent px-4 py-2 text-sm font-semibold text-[#1F2F46] transition hover:bg-[#EAF2FF]">
                        View Product
                      </span>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {filteredProducts.length > 0 && (
          <section className="mt-8 rounded-2xl border border-[#CFE4F2] bg-white/85 p-5 md:p-6">
            <h2 className="text-xl font-bold text-[#1F2F46] md:text-2xl">
              Detailed Product Insights
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#2F4A68]">
              Compare focus areas, ingredient profile, and wellness intent of
              each recommended option before choosing your routine.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {filteredProducts.map((product) => (
                <article
                  key={`${product.slug}-insight`}
                  className="rounded-2xl border border-[#D7E7F3] bg-[#FAFDFF] p-4 md:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1F2F46]">
                        {product.title}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#4A63A3]">
                        {product.category}
                      </p>
                    </div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="shrink-0 rounded-full border border-[#2F4A68] px-3 py-1.5 text-xs font-semibold text-[#1F2F46] hover:bg-[#EAF2FF]"
                    >
                      View Details
                    </Link>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#2F4A68]">
                    {product.description}
                  </p>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-[#1F2F46]">
                      Top Benefits
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-[#2F4A68]">
                      {product.aboutPoints.map((point) => (
                        <li key={`${product.slug}-${point}`}>- {point}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-[#1F2F46]">
                      Key Ingredient Highlights
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-[#2F4A68]">
                      {product.ingredients.slice(0, 3).map((ingredient) => (
                        <li key={`${product.slug}-${ingredient.id}`}>
                          <span className="font-medium text-[#1F2F46]">
                            {ingredient.name}:
                          </span>{" "}
                          {ingredient.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-[#CFE4F2] bg-white/85 p-5 lg:col-span-2">
            <h2 className="text-xl font-bold text-[#1F2F46] md:text-2xl">
              Ayurvedic Guidance for {category.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#2F4A68]">
              Ayurveda focuses on restoring balance through herbs, diet rhythm,
              sleep quality, and stress regulation. Product support works best
              when paired with a consistent routine rather than short-term use
              alone.
            </p>

            <h3 className="mt-5 text-base font-semibold text-[#1F2F46]">
              Key Benefits
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-[#2F4A68]">
              {category.keyBenefits.map((benefit) => (
                <li key={benefit}>- {benefit}</li>
              ))}
            </ul>

            <h3 className="mt-5 text-base font-semibold text-[#1F2F46]">
              Lifestyle Tips
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-[#2F4A68]">
              {category.lifestyleTips.map((tip) => (
                <li key={tip}>- {tip}</li>
              ))}
            </ul>
          </section>

          <aside className="rounded-2xl border border-[#CFE4F2] bg-white/85 p-5">
            <h2 className="text-lg font-bold text-[#1F2F46]">Who It Is For</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#2F4A68]">
              {category.whoItsFor.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <p className="mt-6 rounded-xl border border-[#E2EBF4] bg-[#F7FBFF] p-3 text-xs leading-5 text-[#2F4A68]">
              Note: These products are wellness-support formulations and are not
              a substitute for diagnosis or medical treatment. Consult a
              qualified professional in complex or chronic conditions.
            </p>
          </aside>
        </div>

        <section className="mt-10 rounded-2xl border border-[#CFE4F2] bg-white/85 p-5">
          <h2 className="text-xl font-bold text-[#1F2F46]">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {category.faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-xl border border-[#E2EBF4] bg-[#FAFDFF] p-4"
              >
                <h3 className="text-sm font-semibold text-[#1F2F46]">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#2F4A68]">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </section>

        {category.longFormContent && category.longFormContent.length > 0 && (
          <section className="mt-10 rounded-2xl border border-[#CFE4F2] bg-white/90 p-5 md:p-7">
            <h2 className="text-xl font-bold text-[#1F2F46] md:text-2xl">
              {category.longFormTitle ?? "In-Depth Category Guide"}
            </h2>
            <p className="mt-2 text-sm text-[#2F4A68] md:text-base">
              A practical, long-form guide to help users build routine, manage
              cravings, and sustain recovery support over time.
            </p>

            {id === "addiction-support" && (
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <article className="rounded-xl border border-[#D7E7F3] bg-[#FAFDFF] p-4">
                  <h3 className="text-sm font-semibold text-[#1F2F46]">
                    Phase 1: Stabilization
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#2F4A68]">
                    Build schedule discipline, reduce trigger exposure, and
                    restore basic sleep and food rhythm.
                  </p>
                </article>
                <article className="rounded-xl border border-[#D7E7F3] bg-[#FAFDFF] p-4">
                  <h3 className="text-sm font-semibold text-[#1F2F46]">
                    Phase 2: Repair
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#2F4A68]">
                    Improve energy, emotional steadiness, and urge control with
                    consistent routine and behavior tracking.
                  </p>
                </article>
                <article className="rounded-xl border border-[#D7E7F3] bg-[#FAFDFF] p-4">
                  <h3 className="text-sm font-semibold text-[#1F2F46]">
                    Phase 3: Resilience
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#2F4A68]">
                    Strengthen long-term recovery through accountability,
                    movement, stress tools, and weekly plan review.
                  </p>
                </article>
              </div>
            )}

            <div className="mt-6 space-y-4">
              {category.longFormContent.map((paragraph, index) => (
                <article
                  key={`long-form-${index}`}
                  className="rounded-xl border border-[#E2EBF4] bg-[#FAFDFF] p-4 md:p-5"
                >
                  <h3 className="text-sm font-semibold text-[#1F2F46]">
                    Insight {index + 1}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#2F4A68] md:text-base">
                    {paragraph}
                  </p>
                </article>
              ))}
            </div>

            {id === "addiction-support" && (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <article className="rounded-xl border border-[#D7E7F3] bg-[#F7FBFF] p-4 md:p-5">
                  <h3 className="text-base font-semibold text-[#1F2F46]">
                    7-Day Starter Plan
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-[#2F4A68]">
                    <li>- Fix wake-up and sleep timing from day one.</li>
                    <li>- Eat three predictable, balanced meals daily.</li>
                    <li>- Keep hydration steady through the day.</li>
                    <li>- Remove one trigger from your environment.</li>
                    <li>- Add one short evening calm routine.</li>
                    <li>- Log cravings and mood once daily.</li>
                    <li>- Connect with one accountability person.</li>
                  </ul>
                </article>
                <article className="rounded-xl border border-[#D7E7F3] bg-[#F7FBFF] p-4 md:p-5">
                  <h3 className="text-base font-semibold text-[#1F2F46]">
                    Trigger-Control Checklist
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-[#2F4A68]">
                    <li>- Delay urge response by 10 minutes.</li>
                    <li>- Do a grounding action before any decision.</li>
                    <li>- Avoid isolation in high-risk hours.</li>
                    <li>- Keep post-work and late-night routines planned.</li>
                    <li>- Review relapse patterns every week.</li>
                    <li>- Reset within 24 hours after any lapse.</li>
                    <li>- Seek professional support for severe dependency.</li>
                  </ul>
                </article>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
