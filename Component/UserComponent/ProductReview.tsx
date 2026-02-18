"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BadgeCheck, Quote, Sparkles, Star } from "lucide-react";

type ReviewItem = {
  name: string;
  role?: string;
  comment: string;
  rating: number;
  image?: string;
};

const ProductReview = ({ reviews }: { reviews: ReviewItem[] }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <section className="w-full py-14 md:py-20">
        <div className="mx-auto w-full max-w-7xl rounded-3xl p-6 text-center md:p-10">
          <h2 className="text-2xl font-bold text-[#1F2F46] md:text-3xl">
            Customer Reviews
          </h2>
          <p className="mt-3 text-sm text-[#2F4A68] md:text-base">
            No reviews available for this product yet.
          </p>
        </div>
      </section>
    );
  }

  const averageRating = (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <section className="w-full py-14 md:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-3xl  p-6 md:p-0">
          <div className="mb-8 flex flex-col items-center text-center">
            <p className="inline-flex items-center gap-1 rounded-full border border-[#b8d3e8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2F4A68]">
              <Sparkles className="h-3.5 w-3.5" />
              Customer Love
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[#1F2F46] md:text-3xl">
              Real Reviews From Zelvix Users
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#2F4A68] md:text-base">
              Feedback from customers who follow a consistent wellness routine
              with Zelvix products.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E3C879]  px-4 py-1.5 text-sm font-semibold text-[#7A5D1D]">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {averageRating}/5 Average Rating
            </div>
          </div>

          <Carousel
            opts={{ align: "start", loop: true, slidesToScroll: 1 }}
            className="w-full px-1 md:px-5 "
          >
            <CarouselContent>
              {reviews.map((review) => (
                <CarouselItem
                  key={review.name}
                  className="basis-full sm:basis-1/2 lg:basis-1/3 "
                >
                  <Card className="h-full rounded-2xl border-[#D7E6F3] bg-white/95  hover:shadow-[0_18px_28px_rgba(31,47,70,0.14)]">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src="/homeImage2.webp"
                            alt={review.name}
                            className="h-12 w-12 rounded-full border border-[#CFE4F2] object-cover"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#1F2F46]">
                              {review.name}
                            </p>
                            <p className="text-xs text-[#5C8DB8]">
                              {review.role ?? "Verified Customer"}
                            </p>
                          </div>
                        </div>
                        <Quote className="h-5 w-5 text-[#8FB7D9]" />
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

                      <p className="mt-4 flex-1 text-sm leading-6 text-[#2F4A68]">
                        {review.comment}
                      </p>

                      <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <BadgeCheck className="h-4 w-4" />
                        Verified purchase
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="mt-6 flex items-center justify-center gap-3">
              <CarouselPrevious className="static translate-y-0 border-[#5C8DB8]/40 bg-white text-[#1F2F46] hover:bg-[#ACE0F9]" />
              <CarouselNext className="static translate-y-0 border-[#5C8DB8]/40 bg-white text-[#1F2F46] hover:bg-[#ACE0F9]" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default ProductReview;
