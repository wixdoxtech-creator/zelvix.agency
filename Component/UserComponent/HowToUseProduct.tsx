import { type FC } from "react";

interface Step {
  number: string;
  title: string;
  description: string;
  tips?: string[];
}

interface HowToUseProps {
  steps: Step[];
  subtitle?: string;
}

const HowToUseProduct: FC<HowToUseProps> = ({
  steps,
  subtitle = "Follow these simple steps to incorporate ancient healing wisdom into your daily routine",
}) => {
  return (
    <section className="py-20 relative overflow-hidden  ">
      <div className="container max-w-7xl mx-auto relative z-10 ">
        <div className="text-center mb-14">
          <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800 mb-5">
            Usage Guide
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-5">
            How to Use
            <span className="text-yellow-600 italic"> Ayurvedic Medicine</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="space-y-5">
          {steps.map((step) => {
            return (
              <article
                key={step.number}
                className="rounded-2xl border border-zinc-200 bg-white/90 backdrop-blur-sm shadow-sm p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="shrink-0">
                    <div className="h-12 w-12 rounded-full bg-emerald-600 text-white text-lg font-semibold flex items-center justify-center shadow-sm">
                      {step.number}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-base md:text-lg text-zinc-600 leading-relaxed">
                      {step.description}
                    </p>

                    {step.tips && step.tips.length > 0 && (
                      <div className="mt-6 rounded-xl p-5 border border-zinc-200 bg-zinc-50/90">
                        <h4 className="text-lg font-semibold text-zinc-900 mb-3">
                          Pro Tips
                        </h4>
                        <ul className="space-y-2">
                          {step.tips.map((tip, tipIndex) => (
                            <li
                              key={tipIndex}
                              className="flex items-start gap-3 text-zinc-700"
                            >
                              <span className="text-emerald-700 mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowToUseProduct;
