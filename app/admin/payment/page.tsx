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

type PaymentGateway = {
  id: number;
  name: string;
  app_id: string | null;
  secret_key: string | null;
  is_active: boolean;
  createdAt?: string;
};

const Page = () => {
  const [rows, setRows] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [appId, setAppId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setAppId("");
    setSecretKey("");
    setIsActive(true);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const fetchGateways = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/api/payment");
      setRows(response.data?.data ?? []);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to fetch payment gateways",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGateways();
  }, [fetchGateways]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        name: name.trim(),
        app_id: appId.trim() || null,
        secret_key: secretKey.trim() || null,
        is_active: isActive,
      };

      if (!payload.name) {
        setMessage("Gateway name is required");
        return;
      }

      if (editingId) {
        await api.patch(`/api/payment?id=${editingId}`, payload);
        setMessage("Payment gateway updated successfully");
      } else {
        await api.post("/api/payment", payload);
        setMessage("Payment gateway created successfully");
      }

      resetForm();
      await fetchGateways();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to save payment gateway",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (gateway: PaymentGateway) => {
    setEditingId(gateway.id);
    setName(gateway.name ?? "");
    setAppId(gateway.app_id ?? "");
    setSecretKey(gateway.secret_key ?? "");
    setIsActive(Boolean(gateway.is_active));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setMessage("");

    try {
      await api.delete(`/api/payment?id=${id}`);
      setMessage("Payment gateway deleted successfully");
      await fetchGateways();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to delete payment gateway",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full px-4 py-5 md:px-6">
      <div className="rounded-xl border border-[#d9e6f2] bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#1F2F46] md:text-2xl">
              Payment Gateway
            </h1>
            <p className="mt-1 text-sm text-[#2F4A68]">
              Manage payment gateway credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-5 py-2 text-sm font-semibold text-[#FFF1EB] transition hover:opacity-90"
          >
            Add Gateway
          </button>
        </div>

        {message && <p className="mt-3 text-sm text-[#2F4A68]">{message}</p>}

        <div className="mt-5 overflow-hidden rounded-lg border border-[#d9e6f2]">
          <Table>
            <TableHeader className="bg-[#f2f7fc]">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>App ID</TableHead>
                <TableHead>Secret Key</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-sm">
                    Loading payment gateways...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-sm">
                    No payment gateways found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell className="font-medium text-[#1F2F46]">
                      {row.name}
                    </TableCell>
                    <TableCell>{row.app_id || "-"}</TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {row.secret_key || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          row.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {row.is_active ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          className="rounded-md border border-[#c2d3e3] px-3 py-1 text-xs font-semibold text-[#1F2F46] hover:bg-[#edf4fc]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === row.id}
                          onClick={() => handleDelete(row.id)}
                          className="rounded-md border border-[#efb3b3] px-3 py-1 text-xs font-semibold text-[#8d2222] hover:bg-[#fff1f1] disabled:opacity-70"
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
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2F46]/45 p-4"
          onClick={resetForm}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-[#d7e5f2] bg-white p-5 shadow-[0_16px_36px_rgba(31,47,70,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1F2F46]">
                {editingId ? "Edit Payment Gateway" : "Create Payment Gateway"}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-[#d7e5f2] px-3 py-1.5 text-sm font-semibold text-[#2F4A68]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Gateway Name"
                className="rounded-md border border-[#CFE4F2] px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
                required
              />
              <input
                type="text"
                value={appId}
                onChange={(event) => setAppId(event.target.value)}
                placeholder="App ID"
                className="rounded-md border border-[#CFE4F2] px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
              />
              <input
                type="text"
                value={secretKey}
                onChange={(event) => setSecretKey(event.target.value)}
                placeholder="Secret Key"
                className="rounded-md border border-[#CFE4F2] px-3 py-2 text-sm outline-none ring-[#4F6D7A]/30 focus:ring-2"
              />

              <div className="grid grid-cols-1 gap-3">
                <label className="inline-flex items-center gap-2 rounded-md border border-[#CFE4F2] px-3 py-2 text-sm text-[#2F4A68]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                  />
                  Is Active
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-6 py-3 text-sm font-semibold text-[#FFF1EB] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting
                  ? "Saving..."
                  : editingId
                    ? "Update Gateway"
                    : "Create Gateway"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
