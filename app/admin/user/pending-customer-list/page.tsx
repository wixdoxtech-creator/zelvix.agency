"use client";

import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/helper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PendingCustomer = {
  id: number;
  email: string;
  role: "user";
  status: "not_block" | "block";
  is_block: boolean;
  is_verified: boolean;
  createdAt: string;
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

const toDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString();
};

const Page = () => {
  const [customers, setCustomers] = useState<PendingCustomer[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const fetchCustomers = useCallback(
    async (page: number) => {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get("/api/users/pending-customer-list", {
          params: {
            page,
            limit: pagination.limit,
          },
        });

        setCustomers(response.data?.data ?? []);
        setPagination(response.data?.pagination ?? defaultPagination);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setMessage(
          axiosError.response?.data?.message ?? "Failed to fetch pending customers",
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  const handleBlock = async (userId: number) => {
    setUpdatingId(userId);
    setMessage("");

    try {
      const response = await api.patch("/api/users/pending-customer-list", {
        userId,
        status: "block",
      });
      setMessage(response.data?.message ?? "Customer blocked successfully");
      await fetchCustomers(pagination.page);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to block customer");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: number) => {
    setDeletingId(userId);
    setMessage("");

    try {
      const response = await api.delete("/api/users/pending-customer-list", {
        data: { userId },
      });
      setMessage(response.data?.message ?? "Pending customer deleted successfully");

      const hasOnlyOneItem = customers.length === 1;
      const targetPage =
        hasOnlyOneItem && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await fetchCustomers(targetPage);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to delete pending customer",
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    void fetchCustomers(1);
  }, [fetchCustomers]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
            User Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">
            Pending Customer List
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#4F6D7A]">
            Review pending customers and block or delete records.
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
                <TableHead className="font-semibold text-[#f1f1f3]">Email</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Role</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Verified</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Blocked</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Status</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Created</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm">
                    Loading pending customers...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm">
                    No pending customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer, index) => (
                  <TableRow key={customer.id} className="hover:bg-[#C0D6DF]/12">
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {customer.email}
                    </TableCell>
                    <TableCell className="text-[#4F6D7A]">{customer.role}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          customer.is_verified
                            ? "border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 text-[#1F3B4D]"
                            : "border border-[#C0D6DF]/60 bg-[#C0D6DF]/20 text-[#4F6D7A]"
                        }`}
                      >
                        {customer.is_verified ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          customer.is_block
                            ? "border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 text-[#1F3B4D]"
                            : "border border-[#C0D6DF]/60 bg-[#C0D6DF]/20 text-[#4F6D7A]"
                        }`}
                      >
                        {customer.is_block ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 px-2.5 py-1 text-xs font-semibold text-[#1F3B4D]">
                        {customer.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#4F6D7A]">{toDateLabel(customer.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleBlock(customer.id)}
                          disabled={updatingId === customer.id}
                          className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {updatingId === customer.id ? "Blocking..." : "Block"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer.id)}
                          disabled={deletingId === customer.id}
                          className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#1F3B4D]/25 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {deletingId === customer.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#C0D6DF]/45 pt-3">
            <p className="text-xs text-[#4F6D7A]">
              Page {pagination.page} of {pagination.totalPages} | Total {pagination.totalItems}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchCustomers(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => void fetchCustomers(pagination.page + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
