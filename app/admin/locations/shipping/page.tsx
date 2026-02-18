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

type ShippingRow = {
  id: number;
  pincode_id: number | null;
  min_amount: string | number;
  max_amount: string | number;
  shipping_amount: string | number;
  status: "active" | "inactive";
};

type PincodeOption = {
  id: number;
  pincode: string;
  area_name: string | null;
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

const toAmount = (value: string | number) => Number(value ?? 0).toFixed(2);

const Page = () => {
  const [rows, setRows] = useState<ShippingRow[]>([]);
  const [pincodes, setPincodes] = useState<PincodeOption[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [pincodeId, setPincodeId] = useState("");
  const [minAmount, setMinAmount] = useState("0");
  const [maxAmount, setMaxAmount] = useState("0");
  const [shippingAmount, setShippingAmount] = useState("0");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const pincodeMap = useMemo(() => {
    const map = new Map<number, string>();
    pincodes.forEach((item) => {
      map.set(item.id, item.area_name ? `${item.pincode} (${item.area_name})` : item.pincode);
    });
    return map;
  }, [pincodes]);

  const activeCount = useMemo(
    () => rows.filter((row) => row.status === "active").length,
    [rows],
  );
  const inactiveCount = rows.length - activeCount;

  const resetForm = () => {
    setEditingId(null);
    setPincodeId("");
    setMinAmount("0");
    setMaxAmount("0");
    setShippingAmount("0");
    setStatus("active");
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setPincodeId("");
    setMinAmount("0");
    setMaxAmount("0");
    setShippingAmount("0");
    setStatus("active");
    setIsModalOpen(true);
  };

  const fetchPincodes = useCallback(async () => {
    try {
      const response = await api.get("/api/locations/pincode", {
        params: {
          page: 1,
          limit: 1000,
          status: "active",
        },
      });
      setPincodes(response.data?.data ?? []);
    } catch {
      setPincodes([]);
    }
  }, []);

  const fetchShipping = useCallback(
    async (page: number) => {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get("/api/locations/shipping", {
          params: {
            page,
            limit: pagination.limit,
          },
        });

        setRows(response.data?.data ?? []);
        setPagination(response.data?.pagination ?? defaultPagination);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setMessage(axiosError.response?.data?.message ?? "Failed to fetch shipping data");
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

    const parsedMin = Number(minAmount);
    const parsedMax = Number(maxAmount);
    const parsedShipping = Number(shippingAmount);
    const parsedPincode = pincodeId ? Number(pincodeId) : null;

    if (!Number.isFinite(parsedMin) || !Number.isFinite(parsedMax) || !Number.isFinite(parsedShipping)) {
      setMessage("Amounts must be valid numbers");
      setSubmitting(false);
      return;
    }

    if (parsedMin < 0 || parsedMax < 0 || parsedShipping < 0) {
      setMessage("Amounts cannot be negative");
      setSubmitting(false);
      return;
    }

    if (parsedMin > parsedMax) {
      setMessage("Min amount cannot be greater than max amount");
      setSubmitting(false);
      return;
    }

    if (parsedPincode !== null && (!Number.isInteger(parsedPincode) || parsedPincode <= 0)) {
      setMessage("Please select a valid pincode");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        pincode_id: parsedPincode,
        min_amount: parsedMin,
        max_amount: parsedMax,
        shipping_amount: parsedShipping,
        status,
      };

      if (editingId) {
        const response = await api.put("/api/locations/shipping", {
          id: editingId,
          ...payload,
        });
        setMessage(response.data?.message ?? "Shipping updated successfully");
      } else {
        const response = await api.post("/api/locations/shipping", payload);
        setMessage(response.data?.message ?? "Shipping created successfully");
      }

      resetForm();
      await fetchShipping(isEditing ? pagination.page : 1);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to save shipping");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (row: ShippingRow) => {
    setEditingId(row.id);
    setPincodeId(row.pincode_id ? String(row.pincode_id) : "");
    setMinAmount(String(row.min_amount ?? 0));
    setMaxAmount(String(row.max_amount ?? 0));
    setShippingAmount(String(row.shipping_amount ?? 0));
    setStatus(row.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setMessage("");

    try {
      const response = await api.delete("/api/locations/shipping", { data: { id } });
      setMessage(response.data?.message ?? "Shipping deleted successfully");
      const hasOnlyOneItem = rows.length === 1;
      const targetPage =
        hasOnlyOneItem && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await fetchShipping(targetPage);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to delete shipping");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    void fetchPincodes();
    void fetchShipping(1);
  }, [fetchPincodes, fetchShipping]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
            Location Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">Shipping</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#4F6D7A]">
            Create and manage shipping rates by order amount range.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] shadow-sm transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A]"
            >
              Add Shipping Rule
            </button>
            <button
              type="button"
              onClick={() => void fetchShipping(pagination.page)}
              className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-4 py-2 text-sm font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#C0D6DF]/60 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[#4F6D7A]">Total Records</p>
              <p className="mt-1 text-xl font-semibold text-[#1F3B4D]">{pagination.totalItems}</p>
            </div>
            <div className="rounded-xl border border-[#C0D6DF]/60 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[#4F6D7A]">Active (Page)</p>
              <p className="mt-1 text-xl font-semibold text-[#1F3B4D]">{activeCount}</p>
            </div>
            <div className="rounded-xl border border-[#C0D6DF]/60 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[#4F6D7A]">Inactive (Page)</p>
              <p className="mt-1 text-xl font-semibold text-[#1F3B4D]">{inactiveCount}</p>
            </div>
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
                <TableHead className="font-semibold text-[#f1f1f3]">Pincode</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Min Amount</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Max Amount</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Shipping Amount</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Status</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm">
                    Loading shipping rules...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm">
                    No shipping rules found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={row.id} className="hover:bg-[#C0D6DF]/12">
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>
                    <TableCell className="text-[#4F6D7A]">
                      {row.pincode_id ? pincodeMap.get(row.pincode_id) ?? `#${row.pincode_id}` : "All"}
                    </TableCell>
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {toAmount(row.min_amount)}
                    </TableCell>
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {toAmount(row.max_amount)}
                    </TableCell>
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {toAmount(row.shipping_amount)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          row.status === "active"
                            ? "border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 text-[#1F3B4D]"
                            : "border border-[#C0D6DF]/60 bg-[#C0D6DF]/20 text-[#4F6D7A]"
                        }`}
                      >
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(row.id)}
                          disabled={deletingId === row.id}
                          className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#1F3B4D]/25 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {deletingId === row.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#C0D6DF]/45 pt-3">
            <p className="text-xs text-[#4F6D7A]">
              Page {pagination.page} of {pagination.totalPages} | Total {pagination.totalItems}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchShipping(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => void fetchShipping(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-[#1F3B4D]/45 p-4 pt-8 md:items-center md:pt-4"
          onClick={resetForm}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-[#C0D6DF]/65 bg-[#f3f3f5] p-5 shadow-[0_16px_36px_rgba(89,89,89,0.28)] md:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#1F3B4D]">
                  {editingId ? "Update Shipping Rule" : "Create Shipping Rule"}
                </h2>
                <p className="mt-1 text-xs text-[#4F6D7A]">Fill the details and save changes.</p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="self-start rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1 text-sm font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3 border-t border-[#C0D6DF]/35 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">Pincode (Optional)</label>
                <select
                  value={pincodeId}
                  onChange={(event) => setPincodeId(event.target.value)}
                  className="h-10 w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                >
                  <option value="">All Pincodes</option>
                  {pincodes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.area_name ? `${item.pincode} (${item.area_name})` : item.pincode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">Min Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minAmount}
                  onChange={(event) => setMinAmount(event.target.value)}
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">Max Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxAmount}
                  onChange={(event) => setMaxAmount(event.target.value)}
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">Shipping Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingAmount}
                  onChange={(event) => setShippingAmount(event.target.value)}
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                />
              </div>

              <div className="space-y-2">
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

              <div className="flex justify-end gap-2 pt-2">
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
                  {submitting ? "Saving..." : editingId ? "Update Rule" : "Create Rule"}
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
