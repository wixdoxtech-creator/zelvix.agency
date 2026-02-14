import { IndianRupee, Star } from "lucide-react";

const flashDeals = [
  {
    name: "Liver Tonic",
    image: "/herbs-step.webp",
    price: 899,
    oldPrice: 1199,
    rating: 4,
  },
  {
    name: "Immunity Booster",
    image: "/herbs-step.webp",
    price: 749,
    oldPrice: 999,
    rating: 5,
  },
  {
    name: "Detox Care",
    image: "/herbs-step.webp",
    price: 699,
    oldPrice: 899,
    rating: 4,
  },
  {
    name: "Stress Relief",
    image: "/herbs-step.webp",
    price: 799,
    oldPrice: 1099,
    rating: 4,
  },
];

const HomeFlashDeals = () => {
  return (
    <section id="product" className="w-full py-14 md:py-20">
      <div className="mx-auto w-[95%] max-w-7xl md:w-[90%]">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#CFE4F2] bg-[#FFF1EB]/75 px-5 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_24px_rgba(31,47,70,0.08)] md:flex-row md:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#4B7FA8]">
              Limited Offer
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#1F2F46] md:text-3xl">
              Flash Deals
            </h2>
          </div>
          <div className="rounded-full border border-[#5C8DB8]/50 bg-white/70 px-4 py-2 text-sm font-semibold text-[#2F4A68]">
            Ends in: 48d : 20h : 17m : 19s
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {flashDeals.map((deal) => (
            <article
              key={deal.name}
              className="min-h-110 rounded-2xl border border-[#CFE4F2] bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_22px_rgba(31,47,70,0.08)]"
            >
              <div className="relative mb-4 overflow-hidden rounded-xl border border-[#ACE0F9] bg-[#FFF1EB]">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="h-96 w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              <h3 className="text-base font-semibold text-[#1F2F46]">
                {deal.name}
              </h3>
              <p className="mt-1 text-xs text-[#4A63A3]">{deal.name}</p>

              <div className="mt-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`${deal.name}-${i}`}
                    className={`h-4 w-4 ${
                      i < deal.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <p className="flex items-center text-lg font-bold text-[#1F2F46]">
                  <IndianRupee className="h-4 w-4" />
                  {deal.price}
                </p>
                <p className="flex items-center text-sm text-[#5C8DB8] line-through">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {deal.oldPrice}
                </p>
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-full border border-[#2F4A68] bg-transparent px-4 py-2 text-sm font-semibold text-[#1F2F46] transition hover:bg-[#EAF2FF]"
              >
                Add to Cart
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFlashDeals;
