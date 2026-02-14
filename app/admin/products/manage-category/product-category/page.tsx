"use client";

import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import api from "@/lib/helper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Category = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  status: "active" | "inactive";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setImage("");
    setStatus("active");
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setImage("");
    setSelectedImageName("");
    setStatus("active");
    setIsModalOpen(false);
  };

  const fetchCategories = useCallback(
    async (page: number) => {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get("/api/products/product-category", {
          params: {
            page,
            limit: pagination.limit,
          },
        });

        setCategories(response.data?.data ?? []);
        setPagination(response.data?.pagination ?? defaultPagination);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setMessage(
          axiosError.response?.data?.message ?? "Failed to fetch categories",
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const isEditing = Boolean(editingId);

    try {
      const payload = {
        name,
        slug,
        image: image.trim() || null,
        status,
      };

      if (editingId) {
        const response = await api.put("/api/products/product-category", {
          id: editingId,
          ...payload,
        });
        setMessage(response.data?.message ?? "Category updated successfully");
      } else {
        const response = await api.post(
          "/api/products/product-category",
          payload,
        );
        setMessage(response.data?.message ?? "Category created successfully");
      }

      resetForm();
      await fetchCategories(isEditing ? pagination.page : 1);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to save category",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setImage(category.image ?? "");
    setSelectedImageName("");
    setStatus(category.status);
    setIsModalOpen(true);
  };

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

      const uploadedUrl = data.data?.url ?? "";
      setImage(uploadedUrl);
      setMessage(data.message ?? "Image uploaded successfully");
    } catch {
      setMessage("Image upload failed");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setMessage("");

    try {
      const response = await api.delete("/api/products/product-category", {
        data: { id },
      });

      setMessage(response.data?.message ?? "Category deleted successfully");
      const hasOnlyOneItem = categories.length === 1;
      const targetPage =
        hasOnlyOneItem && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;
      await fetchCategories(targetPage);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to delete category",
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    void fetchCategories(1);
  }, [fetchCategories]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
            Product Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">
            Product Category
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#4F6D7A]">
            Create, update, and delete product categories.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] shadow-sm transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A]"
            >
              Add Category
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
                  Slug
                </TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">
                  Image
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
                  <TableCell colSpan={6} className="py-8 text-center text-sm">
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <TableRow key={category.id} className="hover:bg-[#C0D6DF]/12">
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-[#4F6D7A]">
                      {category.slug}
                    </TableCell>
                    <TableCell className="text-[#4F6D7A]">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-md border border-[#C0D6DF]/45 object-cover"
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          category.status === "active"
                            ? "border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 text-[#1F3B4D]"
                            : "border border-[#C0D6DF]/60 bg-[#C0D6DF]/20 text-[#4F6D7A]"
                        }`}
                      >
                        {category.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          disabled={deletingId === category.id}
                          className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#1F3B4D]/25 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {deletingId === category.id
                            ? "Deleting..."
                            : "Delete"}
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
                onClick={() => fetchCategories(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/12 px-3 py-1.5 text-[#1F3B4D] transition hover:bg-[#C0D6DF]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchCategories(pagination.page + 1)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F3B4D]/45 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-2xl rounded-2xl border border-[#C0D6DF]/65 bg-[#f3f3f5] p-5 shadow-[0_16px_36px_rgba(89,89,89,0.28)] md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#1F3B4D]">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-5 grid gap-3 md:grid-cols-2"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => {
                    const nextName = event.target.value;
                    setName(nextName);
                    setSlug(toSlug(nextName));
                  }}
                  placeholder="Category name"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Category Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  readOnly
                  placeholder="Category slug"
                  className="cursor-not-allowed rounded-md border border-[#C0D6DF]/70 bg-[#C0D6DF]/16 px-3 py-2 text-sm text-[#4F6D7A] outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">
                  Category Image
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
                <input
                  type="text"
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  placeholder="Image URL (auto-filled after upload)"
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 placeholder:text-[#4F6D7A] focus:ring-2"
                />
                {uploadingImage ? (
                  <p className="text-xs text-[#4F6D7A]">Uploading image...</p>
                ) : null}
                {image ? (
                  <Image
                    src={image}
                    alt="Category preview"
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-md border border-[#C0D6DF]/70 object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-1">
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
              <div className="md:col-span-2">
                <p className="rounded-md bg-[#C0D6DF]/15 px-2 py-1 text-xs text-[#4F6D7A]">
                  Slug is auto-generated from category name.
                </p>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
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
                      ? "Update Category"
                      : "Create Category"}
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
