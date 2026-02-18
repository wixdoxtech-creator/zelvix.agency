"use client";

import { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/helper";

type Category = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  status: "active" | "inactive";
};

const HealthCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/api/products/product-category", {
          params: {
            page: 1,
            limit: 100,
          },
        });

        const data = (response.data?.data ?? []) as Category[];
        const activeCategories = data.filter(
          (category) => category.status === "active",
        );
        setCategories(activeCategories);
      } catch (err: unknown) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(
          axiosError.response?.data?.message ?? "Failed to fetch categories",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchCategories();
  }, []);

  return (
    <main className="w-full bg-[#faf8f5] py-10 md:py-14">
      <section className="mx-auto w-[95%] max-w-7xl md:w-[90%]">
        <div className="mb-8 text-center md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4A63A3]">
            Wellness Focus
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F2F46] md:text-5xl">
            Health Categories
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-[#2F4A68] md:text-base">
            Explore Ayurvedic solutions by health goal, so you can choose
            products with more clarity and confidence.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <article
                key={index}
                className="animate-pulse rounded-2xl border border-[#CFE4F2] bg-white/80 p-4"
              >
                <div className="h-48 rounded-xl bg-[#E5EEF6]" />
                <div className="mt-4 h-5 w-2/3 rounded bg-[#E5EEF6]" />
                <div className="mt-2 h-4 w-full rounded bg-[#E5EEF6]" />
                <div className="mt-2 h-4 w-4/5 rounded bg-[#E5EEF6]" />
                <div className="mt-4 h-9 w-36 rounded-full bg-[#E5EEF6]" />
              </article>
            ))}
          </div>
        ) : null}

        {!loading && categories.length === 0 ? (
          <div className="rounded-xl border border-[#CFE4F2] bg-white px-4 py-6 text-center text-sm text-[#2F4A68]">
            No active categories found.
          </div>
        ) : null}

        {!loading && categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                href={`/health-categories/${category.slug}`}
                key={category.id}
              >
                <article className="rounded-2xl border border-[#CFE4F2] bg-white/80 p-4 shadow-[0_12px_30px_rgba(31,47,70,0.08)]">
                  <div className="overflow-hidden rounded-xl border border-[#D9E8F4]">
                    <Image
                      src={category.image || "/homeImage2.webp"}
                      alt={category.name}
                      width={800}
                      height={480}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-[#1F2F46]">
                    {category.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#2F4A68]">
                    Explore products and guidance curated for this health focus.
                  </p>

                  <button className="mt-4 inline-flex rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-4 py-2 text-sm font-semibold text-[#FFF1EB] transition hover:opacity-90">
                    Explore Category
                  </button>
                </article>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default HealthCategoriesPage;
