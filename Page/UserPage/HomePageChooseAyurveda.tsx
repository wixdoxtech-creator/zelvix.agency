const benefits = [
  {
    title: "Natural and Safe",
    description:
      "Ayurvedic care is based on herbs, plants, fruits, and natural ingredients that are gentle for daily wellness use.",
    icon: "/Natural_and_Safe_icons.avif",
  },
  {
    title: "Holistic Healing",
    description:
      "Instead of only treating symptoms, Ayurveda focuses on balancing body, mind, and lifestyle together.",
    icon: "/Natural_and_Safe_icons.avif",
  },
  {
    title: "Fewer Side Effects",
    description:
      "When used with proper guidance, Ayurvedic formulations are known for supportive long-term use with mild effects.",
    icon: "/Natural_and_Safe_icons.avif",
  },
  {
    title: "Personalized Approach",
    description:
      "Treatments can be adapted based on your body type and routine, making care more practical and specific.",
    icon: "/Natural_and_Safe_icons.avif",
  },
  {
    title: "Builds Long-Term Strength",
    description:
      "Ayurveda supports immunity, digestion, energy, and resilience over time rather than only short-term relief.",
    icon: "/Natural_and_Safe_icons.avif",
  },
  {
    title: "Root-Cause Focus",
    description:
      "The approach aims to identify and improve underlying causes of imbalance, not only surface-level discomfort.",
    icon: "/Natural_and_Safe_icons.avif",
  },
];

const HomePageChooseAyurveda = () => {
  return (
    <section id="about" className="w-full py-14 md:py-20">
      <div className="mx-auto w-[95%] max-w-7xl md:w-[90%]">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#4B7FA8]">
            Why Choose Us
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#1F2F46] md:text-4xl">
            Why Choose Ayurveda?
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-[#2F4A68] md:text-base">
            Ayurvedic wellness combines natural ingredients and traditional knowledge to support
            healthier living in a sustainable and balanced way.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-2xl border border-[#CFE4F2] bg-white/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_24px_rgba(31,47,70,0.08)]"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#ACE0F9] bg-[#FFF1EB]">
                <img src={benefit.icon} alt={benefit.title} className="h-9 w-9 object-contain" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F2F46]">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#2F4A68]">{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePageChooseAyurveda;
