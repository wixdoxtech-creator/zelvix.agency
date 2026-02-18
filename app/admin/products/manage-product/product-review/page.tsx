"use client";

import { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
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

type ReviewItem = {
  id: number;
  product_id: number;
  product_name: string;
  name: string;
  image?: string | null;
  rating?: string | number | null;
  dis?: string | null;
  is_active: boolean;
};

type ProductItem = {
  id: number;
  name: string;
  slug: string;
};

type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const MYSQL_TEXT_MAX_BYTES = 65535;

const getUtf8ByteLength = (value: string) => new TextEncoder().encode(value).length;

const defaultPagination: Pagination = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const Page = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [rating, setRating] = useState("0");
  const [dis, setDis] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedImageName, setSelectedImageName] = useState("");
  const disBytesUsed = useMemo(() => getUtf8ByteLength(dis), [dis]);
  const disBytesRemaining = MYSQL_TEXT_MAX_BYTES - disBytesUsed;

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === Number(productId)) ?? null,
    [productId, products],
  );

  const resetForm = () => {
    setEditingId(null);
    setProductId("");
    setName("");
    setImage("");
    setRating("0");
    setDis("");
    setIsActive(true);
    setSelectedImageName("");
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setProductId("");
    setName("");
    setImage("");
    setRating("0");
    setDis("");
    setIsActive(true);
    setSelectedImageName("");
    setIsModalOpen(true);
  };

  const fetchReviews = useCallback(
    async (page: number) => {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get("/api/products/product-review", {
          params: { page, limit: pagination.limit },
        });

        setReviews(response.data?.data ?? []);
        setPagination(response.data?.pagination ?? defaultPagination);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setMessage(
          axiosError.response?.data?.message ?? "Failed to fetch reviews",
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
        params: { page: 1, limit: 200, status: "active" },
      });
      setProducts(response.data?.data ?? []);
    } catch {
      setProducts([]);
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
        setImage(uploadedUrl);
      }
      setMessage(data.message ?? "Image uploaded successfully");
    } catch {
      setMessage("Image upload failed");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (!selectedProduct) {
        setMessage("Please select a product");
        return;
      }

      const ratingNumber = Number(rating);
      if (!Number.isFinite(ratingNumber) || ratingNumber < 0 || ratingNumber > 5) {
        setMessage("Rating must be between 0 and 5");
        return;
      }

      if (!name.trim()) {
        setMessage("Name is required");
        return;
      }

      if (disBytesUsed > MYSQL_TEXT_MAX_BYTES) {
        setMessage("Description exceeds TEXT limit (65535 bytes)");
        return;
      }

      const payload = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.slug,
        name: name.trim(),
        image: image.trim() || null,
        rating: ratingNumber,
        dis: dis.trim() || null,
        is_active: isActive,
      };

      if (editingId) {
        const response = await api.put("/api/products/product-review", {
          id: editingId,
          ...payload,
        });
        setMessage(response.data?.message ?? "Review updated successfully");
      } else {
        const response = await api.post("/api/products/product-review", payload);
        setMessage(response.data?.message ?? "Review created successfully");
      }

      resetForm();
      await fetchReviews(editingId ? pagination.page : 1);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to save review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review: ReviewItem) => {
    setEditingId(review.id);
    setProductId(String(review.product_id));
    setName(String(review.name ?? ""));
    setImage(String(review.image ?? ""));
    setRating(String(review.rating ?? "0"));
    setDis(String(review.dis ?? ""));
    setIsActive(Boolean(review.is_active));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm("Delete this review?");
    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);
    setMessage("");

    try {
      const response = await api.delete("/api/products/product-review", {
        data: { id },
      });

      setMessage(response.data?.message ?? "Review deleted successfully");
      const hasOnlyOneItem = reviews.length === 1;
      const targetPage =
        hasOnlyOneItem && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;
      await fetchReviews(targetPage);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to delete review",
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    void fetchProducts();
    void fetchReviews(1);
  }, [fetchProducts, fetchReviews]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
            Product Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">
            Product Review
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#4F6D7A]">
            Create, update, and delete product reviews.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] shadow-sm transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A]"
            >
              Add Review
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
                <TableHead className="font-semibold text-[#f1f1f3]">Name</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Rating</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Status</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm">
                    Loading reviews...
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm">
                    No reviews found.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review, index) => (
                  <TableRow key={review.id} className="hover:bg-[#C0D6DF]/12">
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>
                    <TableCell className="text-[#4F6D7A]">
                      <p className="font-medium text-[#1F3B4D]">{review.product_name}</p>
                      <p className="text-xs text-[#4F6D7A]">ID: {review.product_id}</p>
                    </TableCell>
                    <TableCell className="text-[#4F6D7A]">{review.name}</TableCell>
                    <TableCell className="text-[#4F6D7A]">
                      {Number(review.rating ?? 0).toFixed(1)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          review.is_active
                            ? "border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 text-[#1F3B4D]"
                            : "border border-[#C0D6DF]/60 bg-[#C0D6DF]/20 text-[#4F6D7A]"
                        }`}
                      >
                        {review.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(review)}
                          className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(review.id)}
                          disabled={deletingId === review.id}
                          className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#1F3B4D]/25 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {deletingId === review.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
                onClick={() => void fetchReviews(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/12 px-3 py-1.5 text-[#1F3B4D] transition hover:bg-[#C0D6DF]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => void fetchReviews(pagination.page + 1)}
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
                  {editingId ? "Edit Review" : "Add Review"}
                </h2>
                <p className="mt-1 text-xs text-[#4F6D7A]">
                  Fill review details and save changes.
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
                  Product
                </label>
                  <select
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                    required
                    className="h-10 w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.slug})
                      </option>
                    ))}
                  </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Name
                </label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="Reviewer name"
                    className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                  />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Image URL
                </label>
                  <input
                    value={image}
                    onChange={(event) => setImage(event.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                  />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Upload Image
                </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="h-10 w-full overflow-hidden rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border file:border-[#4F6D7A]/45 file:bg-[#C0D6DF]/20 file:px-3 file:py-1 file:text-xs file:font-semibold"
                  />
                  {selectedImageName ? (
                    <p className="text-xs text-[#4F6D7A]">
                      Selected: {selectedImageName}
                    </p>
                  ) : null}
                  {uploadingImage ? (
                    <p className="text-xs text-[#4F6D7A]">Uploading image...</p>
                  ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Rating (0-5)
                </label>
                  <input
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                  />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Status
                </label>
                  <select
                    value={isActive ? "active" : "inactive"}
                    onChange={(event) => setIsActive(event.target.value === "active")}
                    className="h-10 w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Description
                </label>
                  <textarea
                    value={dis}
                    onChange={(event) => setDis(event.target.value)}
                    rows={4}
                    placeholder="Review description"
                    className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={
                        disBytesRemaining < 0 ? "text-red-700" : "text-[#4F6D7A]"
                      }
                    >
                      {disBytesUsed.toLocaleString()} / {MYSQL_TEXT_MAX_BYTES.toLocaleString()} bytes
                    </span>
                    <span
                      className={
                        disBytesRemaining < 0 ? "text-red-700" : "text-[#4F6D7A]"
                      }
                    >
                      Remaining: {disBytesRemaining.toLocaleString()}
                    </span>
                  </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 md:col-span-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-4 py-2 text-sm font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] shadow-sm transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                      ? "Update Review"
                      : "Create Review"}
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
