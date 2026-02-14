"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const banners = [
  {
    title: "Flash",
    image: "/b1.png",
  },
  {
    title: "Boost",
    image: "/b2.png",
  },
  {
    title: "Clean",
    image: "/b1.png",
  },
  {
    title: "Ingredients",
    image: "/b2.png",
  },
];

const HomePageBanner = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || isHovered) return;

    const id = setInterval(() => {
      api.scrollNext();
    }, 3500);

    return () => clearInterval(id);
  }, [api, isHovered]);

  return (
    <section className="w-full py-8 md:py-12 ">
      <div className="mx-auto w-[95%] max-w-7xl md:w-[90%]">
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: true }}
          className="w-full"
        >
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <CarouselContent className="ml-0">
              {banners.map((banner) => (
                <CarouselItem key={banner.title} className="pl-0">
                  <article className="relative min-h-80 overflow-hidden rounded-3xl border border-[#CFE4F2] md:h-70">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="h-full w-full object-cover"
                    />
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-4 border-[#CFE4F2] bg-white/90 text-[#1F2F46] hover:bg-[#FFF1EB]" />
            <CarouselNext className="right-4 border-[#CFE4F2] bg-white/90 text-[#1F2F46] hover:bg-[#FFF1EB]" />
          </div>
        </Carousel>

        <div className="mt-4 flex items-center justify-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.title}
              type="button"
              onClick={() => api?.scrollTo(index)}
              className={`h-2.5 rounded-full transition-all ${
                activeIndex === index
                  ? "w-7 bg-[#2F4A68]"
                  : "w-2.5 bg-[#8EC9EA]"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePageBanner;
