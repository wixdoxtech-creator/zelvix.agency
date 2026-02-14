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
  name?: string;
  email: string;
  status: "block" | "not_block";
  phoneNumber?: string;
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
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const fetchBlockedUsers = useCallback(async (page: number) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/api/auth/users/customer-list", {
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
      const response = await api.patch("/api/auth/users/customer-list", {
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

  useEffect(() => {
    void fetchBlockedUsers(1);
  }, [fetchBlockedUsers]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(180deg,#f8fbff_0%,#eef3fb_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#1b263b]/10 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1b263b]/65">
            User Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1b263b] md:text-3xl">
            Block User List
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage blocked users from this table.
          </p>
        </div>

        {message ? (
          <div className="rounded-xl border border-[#1b263b]/10 bg-white px-4 py-3 text-sm text-[#1b263b]">
            {message}
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#1b263b]/10 bg-white p-3 shadow-sm md:p-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1b263b]/5 hover:bg-[#1b263b]/5">
                <TableHead className="font-semibold text-[#1b263b]">Name</TableHead>
                <TableHead className="font-semibold text-[#1b263b]">Email</TableHead>
                <TableHead className="font-semibold text-[#1b263b]">Status</TableHead>
                <TableHead className="font-semibold text-[#1b263b]">
                  Phone Number
                </TableHead>
                <TableHead className="font-semibold text-[#1b263b]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm">
                    Loading blocked users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm">
                    No blocked users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-[#1b263b]">
                      {user.name ?? "-"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>{user.phoneNumber ?? "-"}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => updateStatus(user.id, "not_block")}
                        disabled={updatingUserId === user.id}
                        className="rounded-md bg-[#1b263b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#24324b] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {updatingUserId === user.id ? "Updating..." : "Unblock"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#1b263b]/10 pt-3 text-sm">
            <p className="text-[#1b263b]/80">
              Page {pagination.page} of {pagination.totalPages} | Total{" "}
              {pagination.totalItems}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchBlockedUsers(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-md border border-[#1b263b]/20 px-3 py-1.5 text-[#1b263b] transition hover:bg-[#1b263b]/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchBlockedUsers(pagination.page + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="rounded-md border border-[#1b263b]/20 px-3 py-1.5 text-[#1b263b] transition hover:bg-[#1b263b]/5 disabled:cursor-not-allowed disabled:opacity-50"
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
