const carouselItems = [
  "Addiction Support",
  "Stress Relief",
  "Immunity Boost",
  "Digestive Care",
  "Better Sleep",
  "Daily Detox",
];

const HeroCorosal = () => {
  return (
    <section className="relative overflow-hidden py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0)_42%)]" />

      <div className="relative mx-auto w-[95%] max-w-7xl md:w-[90%]">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4B7FA8]">
            Herbal Benefits
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#1F2F46] md:text-4xl">
            Nature-Powered Wellness Focus
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#2F4A68] md:text-base">
            Discover key wellness areas supported by traditional Ayurvedic herbs
            and clean formulations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {carouselItems.map((item) => (
            <article
              key={item}
              className="rounded-2xl border border-[#5C8DB8]/45 bg-[#FFF1EB]/80 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_rgba(31,47,70,0.12)] backdrop-blur-sm"
            >
              <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border-2 border-[#78B8DD] p-1">
                <img
                  src="/herbs-step.webp"
                  alt={`${item} herbal support`}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <h3 className="text-base font-semibold text-[#1F2F46]">{item}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCorosal;
