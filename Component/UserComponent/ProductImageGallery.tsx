"use client";

import { useMemo, useState } from "react";

type ProductImageGalleryProps = {
  images: string[];
  title: string;
  slug: string;
};

const ProductImageGallery = ({
  images,
  title,
  slug,
}: ProductImageGalleryProps) => {
  const [activeImage, setActiveImage] = useState(0);

  const safeActiveImage = useMemo(() => {
    if (images.length === 0) return 0;
    return Math.min(activeImage, images.length - 1);
  }, [activeImage, images.length]);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1 shadow-[0_14px_30px_rgba(31,47,70,0.12)]">
        <img
          src={images[safeActiveImage] ?? "/homeImage2.webp"}
          alt={title}
          className="aspect-square w-full rounded-xl object-cover md:aspect-4/5"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={`${slug}-${index}`}
            type="button"
            onClick={() => setActiveImage(index)}
            className={`shrink-0 overflow-hidden rounded-lg border p-1 transition ${
              activeImage === index
                ? "border-[#1F2F46] bg-[#EAF2FF] ring-2 ring-[#9fb6d0]"
                : "border-[#CFE4F2] bg-white hover:border-[#7b98b7]"
            }`}
            aria-label={`Show image ${index + 1}`}
          >
            <img
              src={image}
              alt={`${title} image ${index + 1}`}
              className="h-20 w-20 rounded-lg object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
