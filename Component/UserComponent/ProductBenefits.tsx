import type { BenefitItem } from "@/type";

type ProductBenefitsProps = {
  productName?: string;
  benefits?: BenefitItem[];
};

const fallbackBenefits: BenefitItem[] = [
  {
    heding: "Routine Wellness Support",
    img: "/Reduces_Addictive_Cravings.webp",
    pera: "Supports daily wellness and routine balance.",
  },
  {
    heding: "Daily Comfort",
    img: "/Reduces_Addictive_Cravings.webp",
    pera: "Helps improve overall comfort and vitality.",
  },
  {
    heding: "Ayurvedic Formula",
    img: "/Reduces_Addictive_Cravings.webp",
    pera: "Made with carefully selected Ayurvedic herbs.",
  },
  {
    heding: "Long-Term Friendly",
    img: "/Reduces_Addictive_Cravings.webp",
    pera: "Suitable for consistent long-term use.",
  },
];

const ProductBenefits = ({
  productName = "This Product",
  benefits = fallbackBenefits,
}: ProductBenefitsProps) => {
  const normalizedBenefits = benefits
    .filter((item) => item.img || item.heding || item.pera)
    .slice(0, 6);

  return (
    <section className="mt-12 w-full ">
      <div className="rounded-2xl  py-6 ">
        <h2 className="mt-2 text-2xl font-bold text-[#1F2F46] md:text-3xl text-center">
          Benefits of Using {productName}
        </h2>

        <div className="mt-6 grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {normalizedBenefits.map((benefit, index) => (
            <article
              key={`${benefit.heding || "benefit"}-${index}`}
              className="rounded-xl border border-[#D9E8F4] bg-white/80 p-4 flex flex-col items-center"
            >
              <div className="mb-3 h-36 w-36 rounded-lg border border-[#CFE4F2]   p-1.5">
                <img
                  src={benefit.img || "/Reduces_Addictive_Cravings.webp"}
                  alt={benefit.heding || "Benefit icon"}
                  className="h-full w-full rounded-md object-cover"
                />
              </div>
              <h3 className="text-base font-semibold text-[#1F2F46]">
                {benefit.heding || "Key Benefit"}
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#2F4A68]">
                {benefit.pera}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductBenefits;
