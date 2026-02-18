"use client";

import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import api, { parseImageArray } from "@/lib/helper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Product = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category_id: number;
  qty: number;
  prise: string | number;
  offer_prise?: string | number | null;
  tax: string | number;
  hsn?: string | null;
  description?: string | null;
  length?: string | null;
  breadth?: string | null;
  hight?: string | null;
  sep_title?: string | null;
  seo_descrition?: string | null;
  keywords?: string[] | string | null;
  qty_offers?: unknown;
  new_product?: boolean;
  is_best?: boolean;
  is_top?: boolean;
  status: "active" | "inactive";
  images?: string | string[];
};

type Category = {
  id: number;
  name: string;
};

type QtyOfferInput = {
  qty: string;
  price: string;
  label: string;
  label2: string;
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

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const toImages = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    const parsed = parseImageArray(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item ?? "").trim())
        .filter((item) => item.length > 0);
    }

    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
};

const toKeywordText = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter((item) => item.length > 0)
      .join(", ");
  }

  return String(value ?? "").trim();
};

const toQtyOffers = (value: unknown): QtyOfferInput[] => {
  let source: unknown = value;

  if (typeof value === "string") {
    const text = value.trim();
    if (!text) {
      return [];
    }

    try {
      source = JSON.parse(text);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const raw = item as Record<string, unknown>;
      return {
        qty: String(raw.qty ?? ""),
        price: String(raw.price ?? ""),
        label: String(raw.label ?? "").trim(),
        label2: String(raw.label2 ?? "").trim(),
      };
    })
    .filter((item): item is QtyOfferInput => item !== null);
};

const Page = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [qty, setQty] = useState("0");
  const [price, setPrice] = useState("0");
  const [offerPrice, setOfferPrice] = useState("");
  const [tax, setTax] = useState("0");
  const [hsn, setHsn] = useState("");
  const [description, setDescription] = useState("");
  const [length, setLength] = useState("");
  const [breadth, setBreadth] = useState("");
  const [hight, setHight] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [qtyOffers, setQtyOffers] = useState<QtyOfferInput[]>([]);
  const [newProduct, setNewProduct] = useState(false);
  const [isBest, setIsBest] = useState(false);
  const [isTop, setIsTop] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setSku("");
    setCategoryId("");
    setQty("0");
    setPrice("0");
    setOfferPrice("");
    setTax("0");
    setHsn("");
    setDescription("");
    setLength("");
    setBreadth("");
    setHight("");
    setSeoTitle("");
    setSeoDescription("");
    setKeywords("");
    setQtyOffers([]);
    setNewProduct(false);
    setIsBest(false);
    setIsTop(false);
    setStatus("active");
    setImages([]);
    setImageInput("");
    setSelectedImageName("");
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const fetchProducts = useCallback(
    async (page: number) => {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get("/api/products/create-product", {
          params: { page, limit: pagination.limit },
        });

        setProducts(response.data?.data ?? []);
        setPagination(response.data?.pagination ?? defaultPagination);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setMessage(
          axiosError.response?.data?.message ?? "Failed to fetch products",
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/api/products/product-category", {
        params: { page: 1, limit: 100 },
      });

      setCategories(response.data?.data ?? []);
    } catch {
      setCategories([]);
    }
  }, []);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedImageName(file.name);
    setUploadingImage(true);
    setMessage("");

    try {
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
        setMessage(data.message ?? "Image upload failed");
        return;
      }

      const uploadedUrl = data.data?.url?.trim() ?? "";
      if (uploadedUrl) {
        setImages((prev) => [...prev, uploadedUrl]);
        setImageInput("");
      }
      setMessage(data.message ?? "Image uploaded successfully");
    } catch {
      setMessage("Image upload failed");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const addImageFromInput = () => {
    const trimmed = imageInput.trim();
    if (!trimmed) {
      return;
    }

    setImages((prev) => [...prev, trimmed]);
    setImageInput("");
  };

  const removeImage = (index: number) => {
    setImages((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const addQtyOfferRow = () => {
    setQtyOffers((prev) => [
      ...prev,
      { qty: "", price: "", label: "", label2: "" },
    ]);
  };

  const updateQtyOfferRow = (
    index: number,
    field: keyof QtyOfferInput,
    value: string,
  ) => {
    setQtyOffers((prev) =>
      prev.map((offer, currentIndex) =>
        currentIndex === index ? { ...offer, [field]: value } : offer,
      ),
    );
  };

  const removeQtyOfferRow = (index: number) => {
    setQtyOffers((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const isEditing = Boolean(editingId);

    try {
      const qtyOffersPayload: Array<{
        qty: number;
        price: number;
        label: string;
        label2: string;
      }> = [];

      for (const offer of qtyOffers) {
        const qtyText = offer.qty.trim();
        const priceText = offer.price.trim();
        const label = offer.label.trim();
        const label2 = offer.label2.trim();
        const isEmpty = !qtyText && !priceText && !label && !label2;

        if (isEmpty) {
          continue;
        }

        const qtyNumber = Number(qtyText);
        const priceNumber = Number(priceText);
        if (!Number.isFinite(qtyNumber) || qtyNumber <= 0) {
          setMessage("Qty offer qty must be greater than 0");
          return;
        }

        if (!Number.isFinite(priceNumber) || priceNumber < 0) {
          setMessage("Qty offer price must be 0 or greater");
          return;
        }

        if (!label) {
          setMessage("Qty offer label is required");
          return;
        }

        qtyOffersPayload.push({
          qty: Math.trunc(qtyNumber),
          price: priceNumber,
          label,
          label2,
        });
      }

      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        sku: sku.trim().toUpperCase(),
        category_id: Number(categoryId),
        qty: Number(qty || 0),
        prise: Number(price || 0),
        offer_prise: offerPrice.trim() ? Number(offerPrice) : null,
        tax: Number(tax || 0),
        hsn: hsn.trim(),
        description: description.trim(),
        length: length.trim(),
        breadth: breadth.trim(),
        hight: hight.trim(),
        sep_title: seoTitle.trim(),
        seo_descrition: seoDescription.trim(),
        keywords: keywords.trim(),
        qty_offers: qtyOffersPayload,
        new_product: newProduct,
        is_best: isBest,
        is_top: isTop,
        status,
        images,
      };

      if (isEditing) {
        const response = await api.patch("/api/products/create-product", {
          id: editingId,
          ...payload,
        });
        setMessage(response.data?.message ?? "Product updated successfully");
      } else {
        const response = await api.post(
          "/api/products/create-product",
          payload,
        );
        setMessage(response.data?.message ?? "Product created successfully");
      }

      resetForm();
      await fetchProducts(isEditing ? pagination.page : 1);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to save product",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setSlug(product.slug);
    setSku(product.sku);
    setCategoryId(String(product.category_id));
    setQty(String(product.qty ?? 0));
    setPrice(String(product.prise ?? 0));
    setOfferPrice(
      product.offer_prise === null ? "" : String(product.offer_prise ?? ""),
    );
    setTax(String(product.tax ?? 0));
    setHsn(product.hsn ?? "");
    setDescription(product.description ?? "");
    setLength(product.length ?? "");
    setBreadth(product.breadth ?? "");
    setHight(product.hight ?? "");
    setSeoTitle(product.sep_title ?? "");
    setSeoDescription(product.seo_descrition ?? "");
    setKeywords(toKeywordText(product.keywords));
    setQtyOffers(toQtyOffers(product.qty_offers));
    setNewProduct(Boolean(product.new_product));
    setIsBest(Boolean(product.is_best));
    setIsTop(Boolean(product.is_top));
    setStatus(product.status);
    setImages(toImages(product.images));
    setImageInput("");
    setSelectedImageName("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setMessage("");

    try {
      const response = await api.delete("/api/products/create-product", {
        data: { id },
      });

      setMessage(response.data?.message ?? "Product deleted successfully");
      const hasOnlyOneItem = products.length === 1;
      const targetPage =
        hasOnlyOneItem && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;
      await fetchProducts(targetPage);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to delete product",
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    void fetchProducts(1);
    void fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        resetForm();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
            Product Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">
            Create Product
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#4F6D7A]">
            Manage products with add, edit, and delete actions.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] shadow-sm transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A]"
            >
              Add Product
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
                <TableHead className="font-semibold text-[#f1f1f3]">
                  S.N
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  Name
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  Image
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  SKU
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  Price
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product, index) => {
                  const categoryName =
                    categories.find((item) => item.id === product.category_id)
                      ?.name ?? "-";
                  const serialNumber =
                    (pagination.page - 1) * pagination.limit + index + 1;
                  const productImages = toImages(product.images);

                  return (
                    <TableRow
                      key={product.id}
                      className="hover:bg-[#C0D6DF]/12"
                    >
                      <TableCell className="font-medium text-[#1F3B4D]">
                        {serialNumber}
                      </TableCell>
                      <TableCell className="font-medium text-[#1F3B4D]">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {productImages[0] ? (
                          <Image
                            src={productImages[0]}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md border border-[#C0D6DF]/45 object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#C0D6DF]/45 bg-[#C0D6DF]/12 text-[10px] font-semibold text-[#4F6D7A]">
                            N/A
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-[#4F6D7A]">
                        {product.sku}
                      </TableCell>
                      <TableCell className="text-[#4F6D7A]">
                        {categoryName}
                      </TableCell>
                      <TableCell className="text-[#4F6D7A]">
                        {product.prise}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.status === "active"
                              ? "border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 text-[#1F3B4D]"
                              : "border border-[#C0D6DF]/60 bg-[#C0D6DF]/20 text-[#4F6D7A]"
                          }`}
                        >
                          {product.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#1F3B4D]/25 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingId === product.id
                              ? "Deleting..."
                              : "Delete"}
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
              Page {pagination.page} of {pagination.totalPages} | Total{" "}
              {pagination.totalItems}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchProducts(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/12 px-3 py-1.5 text-[#1F3B4D] transition hover:bg-[#C0D6DF]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchProducts(pagination.page + 1)}
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
            className="w-full max-h-[90vh] max-w-4xl overflow-y-auto rounded-2xl border border-[#C0D6DF]/65 bg-[#f3f3f5] p-5 shadow-[0_16px_36px_rgba(89,89,89,0.28)] md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#1F3B4D]">
                  {editingId ? "Edit Product" : "Add Product"}
                </h2>
                <p className="mt-1 text-xs text-[#4F6D7A]">
                  Fill product details and save changes.
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
              className="mt-5 grid items-start gap-3 border-t border-[#C0D6DF]/35 pt-4 md:grid-cols-2"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => {
                    const nextName = event.target.value;
                    setName(nextName);
                    setSlug(toSlug(nextName));
                  }}
                  placeholder="Product name"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Product Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  readOnly
                  placeholder="Product slug"
                  className="cursor-not-allowed rounded-md border border-[#C0D6DF]/70 bg-[#C0D6DF]/16 px-3 py-2 text-sm text-[#4F6D7A] outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(event) => setSku(event.target.value.toUpperCase())}
                  placeholder="SKU"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="h-10 w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={qty}
                  onChange={(event) => setQty(event.target.value)}
                  placeholder="Quantity"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Price"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Offer Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={offerPrice}
                  onChange={(event) => setOfferPrice(event.target.value)}
                  placeholder="Offer price"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Tax
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tax}
                  onChange={(event) => setTax(event.target.value)}
                  placeholder="Tax"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  HSN
                </label>
                <input
                  type="text"
                  value={hsn}
                  onChange={(event) => setHsn(event.target.value)}
                  placeholder="HSN code"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Length
                </label>
                <input
                  type="text"
                  value={length}
                  onChange={(event) => setLength(event.target.value)}
                  placeholder="Length"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Breadth
                </label>
                <input
                  type="text"
                  value={breadth}
                  onChange={(event) => setBreadth(event.target.value)}
                  placeholder="Breadth"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Hight
                </label>
                <input
                  type="text"
                  value={hight}
                  onChange={(event) => setHight(event.target.value)}
                  placeholder="Hight"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Product description"
                  rows={4}
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(event) => setSeoTitle(event.target.value)}
                  placeholder="SEO title"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Keywords
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(event) => setKeywords(event.target.value)}
                  placeholder="keyword1, keyword2"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1F3B4D]">
                    Qty Offers
                  </label>
                  <button
                    type="button"
                    onClick={addQtyOfferRow}
                    className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                  >
                    Add Offer
                  </button>
                </div>
                {qtyOffers.length === 0 ? (
                  <p className="rounded-md bg-[#C0D6DF]/12 px-3 py-2 text-xs text-[#4F6D7A]">
                    No qty offers added.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {qtyOffers.map((offer, index) => (
                      <div
                        key={`qty-offer-${index}`}
                        className="grid gap-2 rounded-md border border-[#C0D6DF]/50 bg-white p-2 md:grid-cols-[1fr_1fr_1.5fr_1.5fr_auto]"
                      >
                        <input
                          type="number"
                          min="1"
                          value={offer.qty}
                          onChange={(event) =>
                            updateQtyOfferRow(index, "qty", event.target.value)
                          }
                          placeholder="Qty"
                          className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={offer.price}
                          onChange={(event) =>
                            updateQtyOfferRow(
                              index,
                              "price",
                              event.target.value,
                            )
                          }
                          placeholder="Price"
                          className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                        />
                        <input
                          type="text"
                          value={offer.label}
                          onChange={(event) =>
                            updateQtyOfferRow(
                              index,
                              "label",
                              event.target.value,
                            )
                          }
                          placeholder="Label (e.g. Best Seller)"
                          className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                        />
                        <input
                          type="text"
                          value={offer.label2}
                          onChange={(event) =>
                            updateQtyOfferRow(
                              index,
                              "label2",
                              event.target.value,
                            )
                          }
                          placeholder="Label 2 Name"
                          className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeQtyOfferRow(index)}
                          className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-2 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#1F3B4D]/25"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  SEO Description
                </label>
                <textarea
                  value={seoDescription}
                  onChange={(event) => setSeoDescription(event.target.value)}
                  placeholder="SEO description"
                  rows={3}
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Product Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="h-10 w-full overflow-hidden rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] file:mr-3 file:rounded-md file:border file:border-[#4F6D7A]/45 file:bg-[#C0D6DF]/20 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#1F3B4D] hover:file:bg-[#C0D6DF]/35"
                />
                <p className="truncate text-xs text-[#4F6D7A]">
                  {selectedImageName
                    ? `Selected: ${selectedImageName}`
                    : "No file selected"}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(event) => setImageInput(event.target.value)}
                    placeholder="Add image URL"
                    className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={addImageFromInput}
                    className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-2 text-sm font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                  >
                    Add
                  </button>
                </div>
                {uploadingImage ? (
                  <p className="text-xs text-[#4F6D7A]">Uploading image...</p>
                ) : null}
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 rounded-md bg-[#C0D6DF]/12 p-2 md:grid-cols-4">
                    {images.map((img, index) => (
                      <div key={`${img}-${index}`} className="space-y-1">
                        <Image
                          src={img}
                          alt={`Product image ${index + 1}`}
                          width={120}
                          height={90}
                          className="h-20 w-full rounded-md border border-[#C0D6DF]/55 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="w-full rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-2 py-1 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#1F3B4D]/25"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-4 rounded-md border border-[#C0D6DF]/45 bg-white px-3 py-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-[#1F3B4D]">
                  <input
                    type="checkbox"
                    checked={newProduct}
                    onChange={(event) => setNewProduct(event.target.checked)}
                  />
                  New Product
                </label>
                <label className="flex items-center gap-2 text-sm text-[#1F3B4D]">
                  <input
                    type="checkbox"
                    checked={isBest}
                    onChange={(event) => setIsBest(event.target.checked)}
                  />
                  Is Best
                </label>
                <label className="flex items-center gap-2 text-sm text-[#1F3B4D]">
                  <input
                    type="checkbox"
                    checked={isTop}
                    onChange={(event) => setIsTop(event.target.checked)}
                  />
                  Is Top
                </label>
              </div>

              <div className="space-y-1 md:col-span-2 md:max-w-xs">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as "active" | "inactive")
                  }
                  className="h-10 w-full self-start rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              <div className="mt-1 flex items-center justify-between gap-2 border-t border-[#C0D6DF]/35 pt-4 md:col-span-2">
                <p className="text-xs text-[#4F6D7A]">
                  All fields stay aligned on resize.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-4 py-2 text-sm font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting
                      ? editingId
                        ? "Updating..."
                        : "Creating..."
                      : editingId
                        ? "Update Product"
                        : "Create Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default Page;
