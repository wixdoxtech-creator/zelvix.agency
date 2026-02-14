"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Amit Pal",
    role: "Verified Customer",
    comment:
      "The detox and immunity products feel very clean and easy to include in my routine. I noticed better energy in just a few weeks.",
    rating: 5,
  },
  {
    name: "Neha Sharma",
    role: "Returning Customer",
    comment:
      "Packaging is great and the herbal quality feels premium. The stress support blend helped me sleep more consistently.",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Verified Customer",
    comment:
      "I started with one product and now use three daily. Good results and quick support from the team whenever I had questions.",
    rating: 4,
  },
  {
    name: "Priya Nair",
    role: "Happy User",
    comment:
      "Loved the natural ingredient approach. The products are gentle, and I can feel the difference without side effects.",
    rating: 5,
  },
  {
    name: "Karan Mehta",
    role: "Verified Customer",
    comment:
      "Great value and authentic experience. I appreciate that the formulas are simple and clearly explained.",
    rating: 4,
  },
];

const HomePageRating = () => {
  return (
    <section className="w-full py-14 md:py-20">
      <div className="mx-auto w-[95%] max-w-7xl md:w-[90%]">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#4B7FA8]">
            Customer Love
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#1F2F46] md:text-3xl">
            What People Say About Zelvix
          </h2>
        </div>

        <Carousel
          opts={{ align: "start", loop: true, slidesToScroll: 1 }}
          className="w-full px-1 md:px-2"
        >
          <CarouselContent>
            {reviews.map((review) => (
              <CarouselItem
                key={review.name}
                className="basis-full sm:basis-1/2 lg:basis-1/3 "
              >
                <Card className="h-full rounded-2xl bg-white">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <img
                        src="/homeImage2.webp"
                        alt={review.name}
                        className="h-12 w-12 rounded-full border border-[#CFE4F2] object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#1F2F46]">
                          {review.name}
                        </p>
                        <p className="text-xs text-[#5C8DB8]">{review.role}</p>
                      </div>
                    </div>

                    <p className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={`${review.name}-${i}`}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </p>

                    <p className="mt-4 text-sm leading-6 text-[#2F4A68]">
                      {review.comment}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-6 flex items-center justify-center gap-3">
            <CarouselPrevious className="static translate-y-0 border-[#5C8DB8]/40 text-[#1F2F46] bg-white hover:bg-[#ACE0F9]" />
            <CarouselNext className="static translate-y-0 border-[#5C8DB8]/40 text-[#1F2F46] bg-white hover:bg-[#ACE0F9]" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default HomePageRating;
