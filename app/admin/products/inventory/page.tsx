"use client";

import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
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

type InventoryItem = {
  id: number;
  name: string;
  sku: string;
  category_id: number;
  tax: string | number;
  hsn: string | null;
  qty: number;
  sold_qty: number;
  status: "active" | "inactive";
};

type ProductOption = {
  id: number;
  name: string;
  sku: string;
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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("0");
  const [soldQty, setSoldQty] = useState("0");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const resetForm = () => {
    setEditingId(null);
    setProductId("");
    setQty("0");
    setSoldQty("0");
    setStatus("active");
    setIsModalOpen(false);
  };

  const fetchInventory = useCallback(
    async (page: number) => {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get("/api/products/inventory", {
          params: { page, limit: pagination.limit },
        });

        setInventory(response.data?.data ?? []);
        setPagination(response.data?.pagination ?? defaultPagination);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setMessage(axiosError.response?.data?.message ?? "Failed to fetch inventory");
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get("/api/products/create-product", {
        params: { page: 1, limit: 100 },
      });
      setProductOptions(response.data?.data ?? []);
    } catch {
      setProductOptions([]);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const isEditing = Boolean(editingId);

    try {
      const payload = {
        qty: Number(qty || 0),
        sold_qty: Number(soldQty || 0),
        status,
      };

      if (isEditing) {
        const response = await api.put("/api/products/inventory", {
          id: editingId,
          ...payload,
        });
        setMessage(response.data?.message ?? "Inventory updated successfully");
      } else {
        const response = await api.post("/api/products/inventory", {
          product_id: Number(productId),
          ...payload,
        });
        setMessage(response.data?.message ?? "Inventory added successfully");
      }

      resetForm();
      await fetchInventory(isEditing ? pagination.page : 1);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to save inventory");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setProductId(String(item.id));
    setQty(String(item.qty ?? 0));
    setSoldQty(String(item.sold_qty ?? 0));
    setStatus(item.status);
    setIsModalOpen(true);
  };

  useEffect(() => {
    void fetchInventory(1);
    void fetchProducts();
  }, [fetchInventory, fetchProducts]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
            Product Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">
            Inventory
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#4F6D7A]">
            Manage product stock using add and update actions.
          </p>
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
                <TableHead className="font-semibold text-[#f1f1f3]">SKU</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Tax</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">HSN</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Qty</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Sold Qty</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Status</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm">
                    No inventory data found.
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item, index) => {
                  const serialNumber =
                    (pagination.page - 1) * pagination.limit + index + 1;

                  return (
                    <TableRow key={item.id} className="hover:bg-[#C0D6DF]/12">
                      <TableCell className="font-medium text-[#1F3B4D]">
                        {serialNumber}
                      </TableCell>
                      <TableCell className="font-medium text-[#1F3B4D]">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-[#4F6D7A]">{item.sku}</TableCell>
                      <TableCell className="text-[#4F6D7A]">{item.tax}</TableCell>
                      <TableCell className="text-[#4F6D7A]">{item.hsn || "-"}</TableCell>
                      <TableCell className="text-[#4F6D7A]">{item.qty}</TableCell>
                      <TableCell className="text-[#4F6D7A]">{item.sold_qty}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.status === "active"
                              ? "border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 text-[#1F3B4D]"
                              : "border border-[#C0D6DF]/60 bg-[#C0D6DF]/20 text-[#4F6D7A]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                        >
                          Update
                        </button>
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
                onClick={() => fetchInventory(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/12 px-3 py-1.5 text-[#1F3B4D] transition hover:bg-[#C0D6DF]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchInventory(pagination.page + 1)}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F3B4D]/45 p-4 backdrop-blur-[1px]"
          onClick={resetForm}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#C0D6DF]/65 bg-[#f3f3f5] p-5 shadow-[0_16px_36px_rgba(89,89,89,0.28)] md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#1F3B4D]">
                {editingId ? "Update Inventory" : "Add Inventory"}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1 text-sm font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="space-y-1 md:col-span-2">
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">Qty</label>
                <input
                  type="number"
                  min="0"
                  value={qty}
                  onChange={(event) => setQty(event.target.value)}
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#1F3B4D]">Sold Qty</label>
                <input
                  type="number"
                  min="0"
                  value={soldQty}
                  onChange={(event) => setSoldQty(event.target.value)}
                  className="rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                />
              </div>

              <div className="space-y-1 md:col-span-2 md:max-w-xs">
                <label className="text-xs font-semibold text-[#1F3B4D]">Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as "active" | "inactive")}
                  className="h-10 w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              <div className="mt-1 flex items-center justify-end gap-2 border-t border-[#C0D6DF]/35 pt-4 md:col-span-2">
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
                  className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting
                    ? editingId
                      ? "Updating..."
                      : "Adding..."
                    : editingId
                      ? "Update Inventory"
                      : "Add Inventory"}
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
