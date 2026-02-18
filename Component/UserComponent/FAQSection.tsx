"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQSection = ({ faqs }: { faqs: FAQItem[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative lg:py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-10 md:mb-14 animate-fade-in">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold  leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base md:text-lg  max-w-2xl mx-auto">
            Find answers to common questions about Ayurveda, our products, and
            how to begin your holistic wellness journey.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 animate-fade-in-up delay-100">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="
  rounded-2xl 
  border border-[hsl(var(--border))]
  bg-[hsl(var(--ayur-cream))]/80 
  backdrop-blur-sm 
  shadow-[0_4px_20px_-2px_hsl(145_25%_45%/_0.08)]
  hover:shadow-[0_10px_40px_-5px_hsl(145_25%_45%/_0.15)]
  hover:-translate-y-0.5
  transition-all duration-300
"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="
                    w-full 
                    flex items-center justify-between 
                    text-left 
                    px-5 md:px-6 
                    py-4 md:py-5
                  "
                  aria-expanded={isOpen}
                >
                  <span className=" font-semibold text-base md:text-lg">
                    {item.question}
                  </span>
                  <div>
                    <span
                      className="
                      ml-4 
                      flex items-center justify-center 
                      w-8 h-8 
                      rounded-full 
                      border border-[hsl(var(--border))]
                      
                      text-sm
                      "
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {/* Answer */}
                <div
                  className={`
                    px-5 md:px-6 pb-4 md:pb-5 
                    text-sm md:text-base 
                   
                    transition-[max-height,opacity] 
                    duration-300 
                    overflow-hidden 
                    ${isOpen ? "opacity-100 max-h-60" : "opacity-0 max-h-0"}
                  `}
                >
                  <p className="pt-1 leading-relaxed ">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
