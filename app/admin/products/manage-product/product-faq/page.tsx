"use client";

import { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import api from "@/lib/helper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FaqItem = {
  id: number;
  product_id: number;
  product_name: string;
  name?: string | null;
  question: string;
  answer: string;
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

const defaultPagination: Pagination = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const Page = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === Number(productId)) ?? null,
    [productId, products],
  );

  const resetForm = () => {
    setEditingId(null);
    setProductId("");
    setName("");
    setQuestion("");
    setAnswer("");
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setProductId("");
    setName("");
    setQuestion("");
    setAnswer("");
    setIsModalOpen(true);
  };

  const fetchFaqs = useCallback(
    async (page: number) => {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get("/api/products/product-faq", {
          params: { page, limit: pagination.limit },
        });

        setFaqs(response.data?.data ?? []);
        setPagination(response.data?.pagination ?? defaultPagination);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setMessage(
          axiosError.response?.data?.message ?? "Failed to fetch FAQs",
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (!selectedProduct) {
        setMessage("Please select a product");
        return;
      }

      const payload = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.slug,
        name: name.trim() || null,
        question: question.trim(),
        answer: answer.trim(),
      };

      if (!payload.question || !payload.answer) {
        setMessage("Question and answer are required");
        return;
      }

      if (editingId) {
        const response = await api.put("/api/products/product-faq", {
          id: editingId,
          ...payload,
        });
        setMessage(response.data?.message ?? "FAQ updated successfully");
      } else {
        const response = await api.post("/api/products/product-faq", payload);
        setMessage(response.data?.message ?? "FAQ created successfully");
      }

      resetForm();
      await fetchFaqs(editingId ? pagination.page : 1);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to save FAQ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (faq: FaqItem) => {
    setEditingId(faq.id);
    setProductId(String(faq.product_id));
    setName(String(faq.name ?? ""));
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm("Delete this FAQ?");
    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);
    setMessage("");

    try {
      const response = await api.delete("/api/products/product-faq", {
        data: { id },
      });

      setMessage(response.data?.message ?? "FAQ deleted successfully");
      const hasOnlyOneItem = faqs.length === 1;
      const targetPage =
        hasOnlyOneItem && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;
      await fetchFaqs(targetPage);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to delete FAQ");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    void fetchProducts();
    void fetchFaqs(1);
  }, [fetchFaqs, fetchProducts]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
            Product Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">
            Product FAQ
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#4F6D7A]">
            Create, update, and delete product FAQs.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] shadow-sm transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A]"
            >
              Add FAQ
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
                  Product
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  Name
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  Question
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  Answer
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm">
                    Loading FAQs...
                  </TableCell>
                </TableRow>
              ) : faqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm">
                    No FAQs found.
                  </TableCell>
                </TableRow>
              ) : (
                faqs.map((faq, index) => (
                  <TableRow key={faq.id} className="hover:bg-[#C0D6DF]/12">
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>
                    <TableCell className="text-[#4F6D7A]">
                      <p className="font-medium text-[#1F3B4D]">
                        {faq.product_name}
                      </p>
                      <p className="text-xs text-[#4F6D7A]">
                        ID: {faq.product_id}
                      </p>
                    </TableCell>
                    <TableCell className="text-[#4F6D7A]">
                      {faq.name || "-"}
                    </TableCell>
                    <TableCell className="max-w-85 text-[#4F6D7A]">
                      <p className="line-clamp-2">{faq.question}</p>
                    </TableCell>
                    <TableCell className="max-w-85 text-[#4F6D7A]">
                      <p className="line-clamp-2">{faq.answer}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(faq)}
                          className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(faq.id)}
                          disabled={deletingId === faq.id}
                          className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#1F3B4D]/25 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {deletingId === faq.id ? "Deleting..." : "Delete"}
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
                onClick={() => void fetchFaqs(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/12 px-3 py-1.5 text-[#1F3B4D] transition hover:bg-[#C0D6DF]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => void fetchFaqs(pagination.page + 1)}
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
                  {editingId ? "Edit FAQ" : "Add FAQ"}
                </h2>
                <p className="mt-1 text-xs text-[#4F6D7A]">
                  Fill FAQ details and save changes.
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
                  placeholder="Optional display name"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Question
                </label>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={3}
                  required
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  rows={4}
                  required
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
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
                      ? "Update FAQ"
                      : "Create FAQ"}
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
