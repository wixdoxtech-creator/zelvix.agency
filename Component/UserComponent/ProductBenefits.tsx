type ProductBenefitsProps = {
  productName?: string;
  benefits?: string[];
};

const fallbackBenefits = [
  "Supports daily wellness and routine balance",
  "Helps improve overall comfort and vitality",
  "Made with carefully selected Ayurvedic herbs",
  "Suitable for consistent long-term use",
];

const ProductBenefits = ({
  productName = "This Product",
  benefits = fallbackBenefits,
}: ProductBenefitsProps) => {
  const normalizedBenefits = benefits.slice(0, 6);

  return (
    <section className="mt-12 w-full ">
      <div className="rounded-2xl  py-6 ">
        <h2 className="mt-2 text-2xl font-bold text-[#1F2F46] md:text-3xl text-center">
          Benefits of Using {productName}
        </h2>

        <div className="mt-6 grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {normalizedBenefits.map((benefit) => (
            <article
              key={benefit}
              className="rounded-xl border border-[#D9E8F4] bg-white/80 p-4 flex flex-col items-center"
            >
              <div className="mb-3 h-36 w-36 rounded-lg border border-[#CFE4F2]   p-1.5">
                <img
                  src="/Reduces_Addictive_Cravings.webp"
                  alt="Benefit icon"
                  className="h-full w-full rounded-md object-cover"
                />
              </div>
              <h3 className="text-base font-semibold text-[#1F2F46]">
                Key Benefit
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#2F4A68]">{benefit}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductBenefits;
