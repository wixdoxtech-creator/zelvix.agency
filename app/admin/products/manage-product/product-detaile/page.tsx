"use client";

import { AxiosError } from "axios";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import api from "@/lib/helper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProductOption = {
  id: number;
  name: string;
  sku: string;
};

type BenefitRow = {
  img: string;
  heding: string;
  pera: string;
};

type UseBlock = {
  heading: string;
  paragraf: string;
  protipText: string;
};

type DetailItem = {
  id: number;
  product_id: number;
  img1?: string | null;
  img2?: string | null;
  benefits?: BenefitRow[] | string | null;
  Ingredients?: BenefitRow[] | string | null;
  Use?: Array<{ heading: string; paragraf: string; protip: string[] }> | string | null;
};

type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const defaultPagination: Pagination = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const parseJsonArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const text = value.trim();
    if (!text) {
      return [];
    }

    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const toRows = (value: unknown): BenefitRow[] => {
  return parseJsonArray(value)
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const row = item as Record<string, unknown>;
      return {
        img: String(row.img ?? "").trim(),
        heding: String(row.heding ?? "").trim(),
        pera: String(row.pera ?? "").trim(),
      };
    })
    .filter((item): item is BenefitRow => item !== null);
};

const toUseBlocks = (value: unknown): UseBlock[] => {
  return parseJsonArray(value)
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const row = item as Record<string, unknown>;
      const protip = Array.isArray(row.protip)
        ? row.protip.map((tip) => String(tip ?? "").trim()).filter((tip) => tip)
        : [];

      return {
        heading: String(row.heading ?? "").trim(),
        paragraf: String(row.paragraf ?? "").trim(),
        protipText: protip.join(", "),
      };
    })
    .filter((item): item is UseBlock => item !== null);
};

const Page = () => {
  const [items, setItems] = useState<DetailItem[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const [productId, setProductId] = useState("");
  const [img1, setImg1] = useState("");
  const [img2, setImg2] = useState("");
  const [benefits, setBenefits] = useState<BenefitRow[]>([]);
  const [ingredients, setIngredients] = useState<BenefitRow[]>([]);
  const [useBlocks, setUseBlocks] = useState<UseBlock[]>([]);

  const resetForm = () => {
    setEditingId(null);
    setProductId("");
    setImg1("");
    setImg2("");
    setBenefits([]);
    setIngredients([]);
    setUseBlocks([]);
    setIsModalOpen(false);
  };

  const fetchDetails = useCallback(
    async (page: number) => {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get("/api/products/product-detaile", {
          params: { page, limit: pagination.limit },
        });

        setItems(response.data?.data ?? []);
        setPagination(response.data?.pagination ?? defaultPagination);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setMessage(
          axiosError.response?.data?.message ?? "Failed to fetch product details",
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get("/api/products/create-product", {
        params: { page: 1, limit: 200 },
      });
      setProductOptions(response.data?.data ?? []);
    } catch {
      setProductOptions([]);
    }
  }, []);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as {
      message?: string;
      data?: { url?: string };
    };

    if (!response.ok) {
      throw new Error(data.message ?? "Image upload failed");
    }

    return data.data?.url?.trim() ?? "";
  };

  const handleUploadToField = async (
    event: ChangeEvent<HTMLInputElement>,
    setUrl: (url: string) => void,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingImage(true);
    setMessage("");

    try {
      const url = await uploadImage(file);
      if (url) {
        setUrl(url);
      }
      setMessage("Image uploaded successfully");
    } catch (error: unknown) {
      const uploadError = error as Error;
      setMessage(uploadError.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const addBenefitRow = () =>
    setBenefits((prev) => [...prev, { img: "", heding: "", pera: "" }]);

  const addIngredientRow = () =>
    setIngredients((prev) => [...prev, { img: "", heding: "", pera: "" }]);

  const addUseBlock = () =>
    setUseBlocks((prev) => [...prev, { heading: "", paragraf: "", protipText: "" }]);

  const updateBenefit = (index: number, field: keyof BenefitRow, value: string) => {
    setBenefits((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const updateIngredient = (
    index: number,
    field: keyof BenefitRow,
    value: string,
  ) => {
    setIngredients((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const updateUseBlock = (index: number, field: keyof UseBlock, value: string) => {
    setUseBlocks((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const removeBenefit = (index: number) =>
    setBenefits((prev) => prev.filter((_, i) => i !== index));

  const removeIngredient = (index: number) =>
    setIngredients((prev) => prev.filter((_, i) => i !== index));

  const removeUseBlock = (index: number) =>
    setUseBlocks((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const isEditing = Boolean(editingId);

    try {
      const payload = {
        product_id: Number(productId),
        img1: img1.trim(),
        img2: img2.trim(),
        benefits: benefits.filter((item) => item.img || item.heding || item.pera),
        Ingredients: ingredients.filter((item) => item.img || item.heding || item.pera),
        Use: useBlocks
          .map((item) => ({
            heading: item.heading.trim(),
            paragraf: item.paragraf.trim(),
            protip: item.protipText
              .split(",")
              .map((tip) => tip.trim())
              .filter((tip) => tip.length > 0),
          }))
          .filter(
            (item) => item.heading || item.paragraf || item.protip.length > 0,
          ),
      };

      if (isEditing) {
        const response = await api.patch("/api/products/product-detaile", {
          id: editingId,
          ...payload,
        });
        setMessage(response.data?.message ?? "Product details updated successfully");
      } else {
        const response = await api.post("/api/products/product-detaile", payload);
        setMessage(response.data?.message ?? "Product details created successfully");
      }

      resetForm();
      await fetchDetails(isEditing ? pagination.page : 1);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to save product details");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: DetailItem) => {
    setEditingId(item.id);
    setProductId(String(item.product_id));
    setImg1(item.img1 ?? "");
    setImg2(item.img2 ?? "");
    setBenefits(toRows(item.benefits));
    setIngredients(toRows(item.Ingredients));
    setUseBlocks(toUseBlocks(item.Use));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setMessage("");

    try {
      const response = await api.delete("/api/products/product-detaile", {
        data: { id },
      });
      setMessage(response.data?.message ?? "Product details deleted successfully");

      const hasOnlyOneItem = items.length === 1;
      const targetPage =
        hasOnlyOneItem && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;
      await fetchDetails(targetPage);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to delete product details",
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    void fetchDetails(1);
    void fetchProducts();
  }, [fetchDetails, fetchProducts]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
            Product Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">
            Product Details
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#4F6D7A]">
            Manage content blocks, upload images, and maintain product detail sections.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A]"
            >
              Add Product Detail
            </button>
          </div>
        </div>

        {message ? (
          <div className="rounded-xl border border-[#C0D6DF]/50 bg-[linear-gradient(145deg,#ffffff_0%,#f5f5f7_100%)] px-4 py-3 text-sm text-[#1F3B4D] shadow-sm">
            {message}
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#C0D6DF]/50 bg-white p-3 shadow-[0_8px_22px_rgba(127,127,127,0.16)] md:p-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-[linear-gradient(90deg,#1F3B4D_0%,#4F6D7A_100%)] hover:bg-[linear-gradient(90deg,#1F3B4D_0%,#4F6D7A_100%)]">
                <TableHead className="font-semibold text-[#f1f1f3]">S.N</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Product</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Img1</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Img2</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Benefits</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Ingredients</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Use Blocks</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm">
                    Loading product details...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm">
                    No product details found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const serialNumber = (pagination.page - 1) * pagination.limit + index + 1;
                  const productLabel =
                    productOptions.find((product) => product.id === item.product_id)?.name ??
                    `#${item.product_id}`;

                  return (
                    <TableRow key={item.id} className="hover:bg-[#C0D6DF]/12">
                      <TableCell className="font-medium text-[#1F3B4D]">{serialNumber}</TableCell>
                      <TableCell className="font-medium text-[#1F3B4D]">{productLabel}</TableCell>
                      <TableCell>
                        {item.img1 ? (
                          <Image
                            src={item.img1}
                            alt="img1"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md border border-[#C0D6DF]/45 object-cover"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {item.img2 ? (
                          <Image
                            src={item.img2}
                            alt="img2"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md border border-[#C0D6DF]/45 object-cover"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-[#4F6D7A]">{toRows(item.benefits).length}</TableCell>
                      <TableCell className="text-[#4F6D7A]">{toRows(item.Ingredients).length}</TableCell>
                      <TableCell className="text-[#4F6D7A]">{toUseBlocks(item.Use).length}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#1F3B4D]/25 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingId === item.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#C0D6DF]/45 pt-3 text-sm">
            <p className="rounded-md bg-[#C0D6DF]/15 px-3 py-1.5 text-[#1F3B4D]">
              Page {pagination.page} of {pagination.totalPages} | Total {pagination.totalItems}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchDetails(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/12 px-3 py-1.5 text-[#1F3B4D] transition hover:bg-[#C0D6DF]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchDetails(pagination.page + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/12 px-3 py-1.5 text-[#1F3B4D] transition hover:bg-[#C0D6DF]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-[#1F3B4D]/45 p-4 pt-8 backdrop-blur-[1px] md:items-center md:pt-4"
          onClick={resetForm}
        >
          <div
            className="w-full max-h-[92vh] max-w-5xl overflow-y-auto rounded-2xl border border-[#C0D6DF]/65 bg-[#f3f3f5] p-5 shadow-[0_16px_36px_rgba(89,89,89,0.28)] md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#1F3B4D]">
                  {editingId ? "Edit Product Detail" : "Add Product Detail"}
                </h2>
                <p className="mt-1 text-xs text-[#4F6D7A]">
                  Keep details structured for a better product page experience.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="self-start rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1 text-sm font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-5 grid items-start gap-4 border-t border-[#C0D6DF]/35 pt-4 md:grid-cols-2"
            >
              <div className="space-y-1 rounded-xl border border-[#C0D6DF]/55 bg-white p-3 md:col-span-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">Product</label>
                <select
                  value={productId}
                  onChange={(event) => setProductId(event.target.value)}
                  className="h-10 w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={Boolean(editingId)}
                  required
                >
                  <option value="">Select product</option>
                  {productOptions.map((product) => (
                    <option value={product.id} key={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 rounded-xl border border-[#C0D6DF]/55 bg-white p-3">
                <label className="text-xs font-semibold text-[#1F3B4D]">Img1</label>
                <input
                  type="text"
                  value={img1}
                  onChange={(event) => setImg1(event.target.value)}
                  placeholder="Image 1 URL"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleUploadToField(event, setImg1)}
                  className="h-10 w-full overflow-hidden rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border file:border-[#4F6D7A]/45 file:bg-[#C0D6DF]/20 file:px-3 file:py-1 file:text-xs file:font-semibold"
                />
                {img1 ? (
                  <Image
                    src={img1}
                    alt="img1 preview"
                    width={140}
                    height={96}
                    className="h-20 w-28 rounded-md border border-[#C0D6DF]/60 object-cover"
                  />
                ) : null}
              </div>

              <div className="space-y-2 rounded-xl border border-[#C0D6DF]/55 bg-white p-3">
                <label className="text-xs font-semibold text-[#1F3B4D]">Img2</label>
                <input
                  type="text"
                  value={img2}
                  onChange={(event) => setImg2(event.target.value)}
                  placeholder="Image 2 URL"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleUploadToField(event, setImg2)}
                  className="h-10 w-full overflow-hidden rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border file:border-[#4F6D7A]/45 file:bg-[#C0D6DF]/20 file:px-3 file:py-1 file:text-xs file:font-semibold"
                />
                {img2 ? (
                  <Image
                    src={img2}
                    alt="img2 preview"
                    width={140}
                    height={96}
                    className="h-20 w-28 rounded-md border border-[#C0D6DF]/60 object-cover"
                  />
                ) : null}
              </div>

              <div className="space-y-2 rounded-xl border border-[#C0D6DF]/55 bg-white p-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1F3B4D]">Benefits</label>
                  <button
                    type="button"
                    onClick={addBenefitRow}
                    className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1 text-xs font-semibold text-[#1F3B4D]"
                  >
                    Add Benefit
                  </button>
                </div>
                {benefits.map((item, index) => (
                  <div
                    key={`benefit-${index}`}
                    className="grid gap-2 rounded-md border border-[#C0D6DF]/50 bg-white p-2 md:grid-cols-[1.6fr_1fr_2fr_auto]"
                  >
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.img}
                        onChange={(event) => updateBenefit(index, "img", event.target.value)}
                        placeholder="Image URL"
                        className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          void handleUploadToField(event, (url) =>
                            updateBenefit(index, "img", url),
                          )
                        }
                        className="h-10 w-full overflow-hidden rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border file:border-[#4F6D7A]/45 file:bg-[#C0D6DF]/20 file:px-3 file:py-1 file:text-xs file:font-semibold"
                      />
                    </div>
                    <input
                      type="text"
                      value={item.heding}
                      onChange={(event) => updateBenefit(index, "heding", event.target.value)}
                      placeholder="Heading"
                      className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                    />
                    <input
                      type="text"
                      value={item.pera}
                      onChange={(event) => updateBenefit(index, "pera", event.target.value)}
                      placeholder="Paragraph"
                      className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-2 text-xs font-semibold text-[#1F3B4D]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 rounded-xl border border-[#C0D6DF]/55 bg-white p-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1F3B4D]">Ingredients</label>
                  <button
                    type="button"
                    onClick={addIngredientRow}
                    className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1 text-xs font-semibold text-[#1F3B4D]"
                  >
                    Add Ingredient
                  </button>
                </div>
                {ingredients.map((item, index) => (
                  <div
                    key={`ingredient-${index}`}
                    className="grid gap-2 rounded-md border border-[#C0D6DF]/50 bg-white p-2 md:grid-cols-[1.6fr_1fr_2fr_auto]"
                  >
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.img}
                        onChange={(event) => updateIngredient(index, "img", event.target.value)}
                        placeholder="Image URL"
                        className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          void handleUploadToField(event, (url) =>
                            updateIngredient(index, "img", url),
                          )
                        }
                        className="h-10 w-full overflow-hidden rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border file:border-[#4F6D7A]/45 file:bg-[#C0D6DF]/20 file:px-3 file:py-1 file:text-xs file:font-semibold"
                      />
                    </div>
                    <input
                      type="text"
                      value={item.heding}
                      onChange={(event) => updateIngredient(index, "heding", event.target.value)}
                      placeholder="Heading"
                      className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                    />
                    <input
                      type="text"
                      value={item.pera}
                      onChange={(event) => updateIngredient(index, "pera", event.target.value)}
                      placeholder="Paragraph"
                      className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-2 text-xs font-semibold text-[#1F3B4D]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 rounded-xl border border-[#C0D6DF]/55 bg-white p-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1F3B4D]">Use Blocks</label>
                  <button
                    type="button"
                    onClick={addUseBlock}
                    className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1 text-xs font-semibold text-[#1F3B4D]"
                  >
                    Add Use Block
                  </button>
                </div>
                {useBlocks.map((item, index) => (
                  <div
                    key={`use-${index}`}
                    className="grid gap-2 rounded-md border border-[#C0D6DF]/50 bg-white p-2 md:grid-cols-[1fr_1.5fr_2fr_auto]"
                  >
                    <input
                      type="text"
                      value={item.heading}
                      onChange={(event) => updateUseBlock(index, "heading", event.target.value)}
                      placeholder="Heading"
                      className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                    />
                    <input
                      type="text"
                      value={item.paragraf}
                      onChange={(event) => updateUseBlock(index, "paragraf", event.target.value)}
                      placeholder="Paragraph"
                      className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                    />
                    <input
                      type="text"
                      value={item.protipText}
                      onChange={(event) => updateUseBlock(index, "protipText", event.target.value)}
                      placeholder="Pro tips (comma separated)"
                      className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeUseBlock(index)}
                      className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-2 text-xs font-semibold text-[#1F3B4D]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <p className="text-[11px] text-[#4F6D7A]">
                  Pro tips can be entered as comma separated values.
                </p>
              </div>

              <div className="sticky bottom-0 z-10 mt-1 flex items-center justify-end gap-2 border-t border-[#C0D6DF]/45 bg-[#f3f3f5]/95 pt-4 md:col-span-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-4 py-2 text-sm font-semibold text-[#1F3B4D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting
                    ? editingId
                      ? "Updating..."
                      : "Creating..."
                    : editingId
                      ? "Update Product Detail"
                      : "Create Product Detail"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default Page;
