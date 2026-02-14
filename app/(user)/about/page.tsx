const page = () => {
  const wellness = [
    {
      title: "🌿 Immunity Boosters",
      desc: "Boost your immune system and strengthen stamina against infections and fatigue.",
    },
    {
      title: "🌿 Digestive Health",
      desc: "Supports gut health and improves metabolism for better digestion and overall comfort.",
    },
    {
      title: "🌿 Overall Wellness",
      desc: "Daily supplements that promote energy, vitality, and long-term balance in body and mind.",
    },
    {
      title: "🌿 Energy & Vitality",
      desc: "Herbal blends designed to enhance stamina, strength, and everyday performance.",
    },
    {
      title: "🌿 Stress & Anxiety Relief",
      desc: "Calming formulations that support relaxation and reduce stress naturally.",
    },
    {
      title: "🌿 Weight Management",
      desc: "Natural support for gut health and healthy weight balance without side motioneffects.",
    },
  ];

  const whyChoose = [
    {
      title: "⭐ Authentic Ayurveda",
      desc: "Rooted in traditional Ayurvedic wisdom refined with modern research.",
    },
    {
      title: "⭐ Safe & Natural",
      desc: "No harmful chemicals, only clinically tested herbal ingredients.",
    },
    {
      title: "⭐ Holistic Healing",
      desc: "Focuses on mind, body, and lifestyle instead of symptoms alone.",
    },
    {
      title: "⭐ Modern Friendly",
      desc: "Easy-to-use solutions designed for busy modern lifestyles.",
    },
  ];

  return (
    <section
      id="about"
      className="w-full relative overflow-hidden bg-[#faf8f5]"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {/* ---------- Header ---------- */}
        <div className="max-w-5xl mx-auto text-center mb-16">
         
          <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-zinc-900">
            About <span className="text-emerald-700">ZELVIX</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-zinc-600 max-w-3xl mx-auto leading-relaxed">
            Zelvix brings the wisdom of Ayurveda into modern living. Our herbal
            formulations are designed to restore balance, improve vitality, and
            support long-term wellness naturally.
          </p>
        </div>

        {/* ---------- Who We Are ---------- */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h2 className="text-3xl font-semibold text-zinc-900 mb-4">
            Who We Are
          </h2>

          <p className="text-zinc-600 leading-relaxed">
            Zelvix offers Ayurvedic wellness solutions for immunity, digestion,
            mental balance, energy, and overall health. Every product is crafted
            using time-tested herbs and modern scientific validation.
          </p>
        </div>

        {/* ---------- Approach ---------- */}
        <div className="max-w-6xl mx-auto mb-16 grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm">
            <h3 className="text-2xl font-bold mb-3 text-zinc-900">
              Our Ayurvedic Approach
            </h3>
            <p className="text-zinc-600 leading-relaxed">
              We balance Vata, Pitta, and Kapha through carefully formulated
              herbal blends that address the root cause of imbalance.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm">
            <h3 className="text-2xl font-bold mb-3 text-zinc-900">
              Everyday Wellness
            </h3>
            <p className="text-zinc-600 leading-relaxed">
              Designed for daily use, Zelvix products integrate seamlessly into
              modern routines without compromising Ayurvedic authenticity.
            </p>
          </div>
        </div>

        {/* ---------- Wellness Grid ---------- */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-center text-3xl font-semibold mb-10">
            Wellness Solutions
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {wellness.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm"
              >
                <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                <p className="text-zinc-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Why Choose ---------- */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-center text-3xl font-semibold mb-10">
            Why Choose Zelvix?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-3xl bg-white border border-zinc-200 text-center shadow-sm"
              >
                <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                <p className="text-zinc-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default page;
