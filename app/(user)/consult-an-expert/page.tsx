"use client";

import {
  Award,
  Globe,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck,
} from "lucide-react";
import FAQSection from "@/Component/UserComponent/FAQSection";

const doctors = [
  {
    name: "Dr. Radhika Sharma",
    qualification: "BAMS, MD (Ayurveda)",
    expertise: "Digestive Health, Stress Management, Lifestyle Disorders",
    experience: "12+ years of clinical Ayurvedic practice",
    languages: "Hindi, English, Gujarati",
    photo: "/homeImage2.webp",
    about:
      "Dr. Radhika Sharma is an experienced Ayurvedic physician focused on root-cause healing and personalized routines. She combines classical Ayurvedic principles with practical modern lifestyle guidance to help patients build consistent, sustainable wellness habits. Her consultations focus on understanding digestion, sleep, stress patterns, and daily behavior before recommending herbal and routine-based support.",
  },
  {
    name: "Dr. Amit Kulkarni",
    qualification: "BAMS, PG Diploma in Clinical Ayurveda",
    expertise: "Metabolic Wellness, Liver Support, Energy & Vitality Care",
    experience: "10+ years of integrative Ayurvedic consultation",
    languages: "Hindi, English, Marathi",
    photo: "/homeImage2.webp",
    about:
      "Dr. Amit Kulkarni specializes in long-term wellness programs for fatigue, metabolic imbalance, and lifestyle-driven health concerns. His consultation style is structured and practical, combining Ayurvedic assessment with realistic daily habit plans so patients can follow treatment consistently and track measurable progress.",
  },
];

const whyChooseUs = [
  {
    title: "Experienced Ayurvedic Doctors",
    description:
      "Get guidance from qualified practitioners with real clinical experience in chronic wellness concerns.",
    icon: Stethoscope,
  },
  {
    title: "Personalized Consultation",
    description:
      "Recommendations are tailored to your symptoms, routine, body type, and long-term goals.",
    icon: UserRoundCheck,
  },
  {
    title: "Safe & Practical Guidance",
    description:
      "Clear, realistic plans that combine herbs, food timing, sleep discipline, and stress management.",
    icon: ShieldCheck,
  },
  {
    title: "Holistic Recovery Focus",
    description:
      "We support complete wellness improvement, not just temporary symptom-level control.",
    icon: Award,
  },
];

const faqs = [
  {
    question: "How does the consultation process work?",
    answer:
      "After you share your health concern, our doctor reviews your symptoms, routine, and medical background, then provides a personalized Ayurvedic guidance plan.",
  },
  {
    question: "Can I consult for multiple health concerns together?",
    answer:
      "Yes. The consultation can cover multiple related concerns such as digestion, sleep, stress, energy, and routine imbalance in one session.",
  },
  {
    question: "Are consultations available in regional languages?",
    answer:
      "Yes. Consultations can be conducted in Hindi and English, and language support may be available based on doctor schedule.",
  },
  {
    question: "Will I get only products or full routine guidance?",
    answer:
      "You receive complete guidance, including lifestyle and dietary suggestions, daily routine improvements, and product recommendations when relevant.",
  },
  {
    question: "Is online consultation suitable for long-term care?",
    answer:
      "Yes. With regular follow-up and adherence to guidance, online consultations can effectively support long-term wellness management.",
  },
];

const page = () => {
  return (
    <main className="w-full bg-linear-to-b from-[#faf8f5] via-white to-[#f5f9ff] py-10 md:py-14">
      <section className="mx-auto w-[95%] max-w-7xl md:w-[90%]">
        <div className="rounded-3xl bg-[linear-gradient(120deg,#ffffff_5%,#eef6ff_65%,#fff7ec_100%)] p-6 shadow-[0_14px_34px_rgba(31,47,70,0.08)] md:p-10">
          <p className="inline-flex rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4A63A3]">
            Consult an Expert
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F2F46] md:text-5xl">
            Meet Our Ayurvedic Doctors
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[#2F4A68] md:text-base">
            Get one-to-one guidance from experienced Ayurvedic experts for
            personalized wellness planning and routine-based recovery support.
          </p>
        </div>

        <section className="mt-10 rounded-3xl">
          <div className="space-y-8">
            {doctors.map((doctor, index) => (
              <article
                key={doctor.name}
                className={`flex gap-6 rounded-2xl bg-[#FBFDFF] p-4 shadow-[0_8px_22px_rgba(31,47,70,0.06)] md:gap-8 md:p-5 ${
                  index === 1
                    ? "flex-col-reverse md:flex-row-reverse"
                    : "flex-col md:flex-row"
                }`}
              >
                <div className="rounded-2xl bg-[#F3F9FF] p-4 md:w-70 md:shrink-0">
                  <img
                    src={doctor.photo}
                    alt={doctor.name}
                    className="h-72 w-full rounded-xl object-cover"
                  />
                  <div className="mt-4 rounded-xl bg-white p-3 shadow-[0_4px_12px_rgba(31,47,70,0.06)]">
                    <p className="text-xs uppercase tracking-[0.12em] text-[#4A63A3]">
                      Languages Known
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#1F2F46]">
                      <Globe className="h-4 w-4 text-[#4A63A3]" />
                      {doctor.languages}
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-[#1F2F46] md:text-3xl">
                    {doctor.name}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-[#4A63A3] md:text-base">
                    {doctor.qualification}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <article className="rounded-xl bg-[#F6FAFF] p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-[#4A63A3]">
                        Area of Expertise
                      </p>
                      <p className="mt-1 text-sm text-[#1F2F46]">
                        {doctor.expertise}
                      </p>
                    </article>
                    <article className="rounded-xl bg-[#F6FAFF] p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-[#4A63A3]">
                        Professional Experience
                      </p>
                      <p className="mt-1 text-sm text-[#1F2F46]">
                        {doctor.experience}
                      </p>
                    </article>
                  </div>

                  <article className="mt-4 rounded-xl bg-[#F8FBFF] p-4">
                    <h3 className="text-base font-semibold text-[#1F2F46]">
                      About the Doctor
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#2F4A68] md:text-base">
                      {doctor.about}
                    </p>
                  </article>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl bg-white/90 p-5 shadow-[0_12px_28px_rgba(31,47,70,0.07)] md:p-8">
          <h2 className="text-2xl font-bold text-[#1F2F46] md:text-3xl">
            Why Choose Us
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[#2F4A68] md:text-base">
            We provide trusted Ayurvedic consultation with practical,
            personalized, and long-term wellness-focused support.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {whyChooseUs.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl bg-[#FAFDFF] p-4 shadow-[0_6px_16px_rgba(31,47,70,0.05)]"
                >
                  <div className="mb-2 inline-flex rounded-full bg-[#EAF2FF] p-2">
                    <Icon className="h-5 w-5 text-[#2F4A68]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#1F2F46]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#2F4A68]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-3xl  p-5  ">
          <FAQSection faqs={faqs} />
        </section>
      </section>
    </main>
  );
};

export default page;
