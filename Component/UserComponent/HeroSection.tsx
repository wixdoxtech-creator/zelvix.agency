const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden py-16 md:py-24">
      <div className="relative mx-auto grid w-[95%] max-w-7xl grid-cols-1 items-center gap-10 md:w-[90%] md:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-[#2171b5]/60 bg-[#BDD7E7]/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#3e2f5b] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm">
            Pure Ayurveda Wellness
          </span>

          <h1 className="text-4xl font-bold leading-tight text-[#3e2f5b] md:text-5xl lg:text-6xl">
            Unlock the Ancient Science of Ayurveda
          </h1>

          <p className="max-w-xl text-base leading-7 text-[#3e2f5b] md:text-lg">
            Our Ayurvedic formulations are crafted with clean herbs and natural
            ingredients, inspired by timeless Ayurvedic principles to support
            balance, vitality, and daily well-being.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#product"
              className="rounded-full border border-[#3e2f5b] bg-linear-to-b from-[#2171b5] to-[#3e2f5b] px-6 py-3 text-sm font-semibold text-[#BDD7E7] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_20px_rgba(31,47,70,0.25)] transition hover:opacity-90"
            >
              Explore Products
            </a>
            <a
              href="#about"
              className="rounded-full border border-[#2171b5]/70 bg-[#BDD7E7]/80 px-6 py-3 text-sm font-semibold text-[#3e2f5b] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_18px_rgba(47,74,104,0.15)] backdrop-blur-sm transition hover:brightness-95"
            >
              Learn More
            </a>
          </div>

          <div className="grid max-w-md grid-cols-3 gap-3 pt-3">
            <div className="rounded-xl border border-[#2171b5]/45 bg-[#BDD7E7]/75 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_20px_rgba(47,74,104,0.12)] backdrop-blur-sm">
              <p className="text-xl font-bold text-[#3e2f5b]">100%</p>
              <p className="text-xs text-[#3e2f5b]">Natural</p>
            </div>
            <div className="rounded-xl border border-[#2171b5]/45 bg-[#BDD7E7]/75 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_20px_rgba(47,74,104,0.12)] backdrop-blur-sm">
              <p className="text-xl font-bold text-[#3e2f5b]">10k+</p>
              <p className="text-xs text-[#3e2f5b]">Happy Users</p>
            </div>
            <div className="rounded-xl border border-[#2171b5]/45 bg-[#BDD7E7]/75 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_20px_rgba(47,74,104,0.12)] backdrop-blur-sm">
              <p className="text-xl font-bold text-[#3e2f5b]">24/7</p>
              <p className="text-xs text-[#3e2f5b]">Support</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-[#3e2f5b]/15 blur-xl" />
          <div className="relative overflow-hidden rounded-3xl border border-[#2171b5]/55 bg-[#BDD7E7]/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_14px_32px_rgba(31,47,70,0.2)] backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-x-3 top-3 h-20 rounded-2xl bg-linear-to-b from-white/45 to-transparent" />
            <img
              src="/homeImage2.webp"
              alt="Ayurvedic products and herbs"
              className="h-90 w-full rounded-2xl object-cover md:h-120"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
