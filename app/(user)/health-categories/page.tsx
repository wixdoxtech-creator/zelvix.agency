import Link from "next/link";

const categories = [
  {
    title: "Addiction Support",
    description:
      "Herbal support options for focus, calm habits, and routine recovery.",
    image: "/homeImage2.webp",
    url: "addiction-support",
  },
  {
    title: "Immunity Care",
    description:
      "Daily formulations designed to strengthen natural defense and resilience.",
    image: "/homeImage2.webp",
    url: "immunity-care",
  },
  {
    title: "Digestive Health",
    description:
      "Targeted blends to support gut comfort, appetite balance, and metabolism.",
    image: "/homeImage2.webp",
    url: "digestive-health",
  },
  {
    title: "Stress & Sleep",
    description:
      "Natural choices to ease stress and improve deep, consistent sleep quality.",
    image: "/homeImage2.webp",
    url: "stress-ans-sleep",
  },
  {
    title: "Liver & Detox",
    description:
      "Clean formulations focused on gentle detox and healthy liver support.",
    image: "/homeImage2.webp",
    url: "liver-and-detox",
  },
  {
    title: "Energy & Vitality",
    description:
      "Herbal nutrition for sustained energy, strength, and daily performance.",
    image: "/homeImage2.webp",
    url: "energy-and-vitality",
  },
];

const HealthCategoriesPage = () => {
  return (
    <main className="w-full bg-[#faf8f5] py-10 md:py-14">
      <section className="mx-auto w-[95%] max-w-7xl md:w-[90%]">
        <div className="mb-8 text-center md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4A63A3]">
            Wellness Focus
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F2F46] md:text-5xl">
            Health Categories
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-[#2F4A68] md:text-base">
            Explore Ayurvedic solutions by health goal, so you can choose
            products with more clarity and confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              href={`/health-categories/${category.url}`}
              key={category.title}
            >
              <article className="rounded-2xl border border-[#CFE4F2] bg-white/80 p-4 shadow-[0_12px_30px_rgba(31,47,70,0.08)]">
                <div className="overflow-hidden rounded-xl border border-[#D9E8F4]">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-[#1F2F46]">
                  {category.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#2F4A68]">
                  {category.description}
                </p>

                <button className="mt-4 inline-flex rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-4 py-2 text-sm font-semibold text-[#FFF1EB] transition hover:opacity-90">
                  Explore Category
                </button>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export default HealthCategoriesPage;
