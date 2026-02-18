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

type BlockedUser = {
  id: number;
  email: string;
  role: "user";
  status: "block" | "not_block";
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
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const fetchBlockedUsers = useCallback(async (page: number) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/api/users/block-user", {
        params: {
          page,
          limit: pagination.limit,
        },
      });

      setUsers(response.data?.data ?? []);
      setPagination(response.data?.pagination ?? defaultPagination);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to fetch blocked users",
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  const updateStatus = async (userId: number, status: "block" | "not_block") => {
    setUpdatingUserId(userId);
    setMessage("");

    try {
      const response = await api.patch("/api/users/block-user", {
        userId,
        status,
      });

      setMessage(response.data?.message ?? "Status updated");
      await fetchBlockedUsers(pagination.page);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(
        axiosError.response?.data?.message ?? "Failed to update status",
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDelete = async (userId: number) => {
    setDeletingId(userId);
    setMessage("");

    try {
      const response = await api.delete("/api/users/customer-list", {
        data: { userId },
      });
      setMessage(response.data?.message ?? "Customer deleted successfully");

      const hasOnlyOneItem = users.length === 1;
      const targetPage =
        hasOnlyOneItem && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await fetchBlockedUsers(targetPage);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to delete customer");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    void fetchBlockedUsers(1);
  }, [fetchBlockedUsers]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
            User Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">
            Block User List
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#4F6D7A]">
            Manage blocked users from this table.
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
                    Loading blocked users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm">
                    No blocked users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.id} className="hover:bg-[#C0D6DF]/12">
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-[#1F3B4D]">{user.email}</TableCell>
                    <TableCell className="text-[#4F6D7A]">{user.role}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.is_verified
                            ? "border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 text-[#1F3B4D]"
                            : "border border-[#C0D6DF]/60 bg-[#C0D6DF]/20 text-[#4F6D7A]"
                        }`}
                      >
                        {user.is_verified ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.is_block
                            ? "border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 text-[#1F3B4D]"
                            : "border border-[#C0D6DF]/60 bg-[#C0D6DF]/20 text-[#4F6D7A]"
                        }`}
                      >
                        {user.is_block ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 px-2.5 py-1 text-xs font-semibold text-[#1F3B4D]">
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#4F6D7A]">{toDateLabel(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateStatus(user.id, "not_block")}
                          disabled={updatingUserId === user.id}
                          className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {updatingUserId === user.id ? "Updating..." : "Unblock"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#1F3B4D]/25 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {deletingId === user.id ? "Deleting..." : "Delete"}
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
              Page {pagination.page} of {pagination.totalPages} | Total{" "}
              {pagination.totalItems}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchBlockedUsers(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => void fetchBlockedUsers(pagination.page + 1)}
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
