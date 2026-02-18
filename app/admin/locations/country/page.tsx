"use client";

import { AxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import api from "@/lib/helper";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Country = {
  id: number;
  name: string;
  iso_code: string | null;
  phone_code: string | null;
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
  const [countries, setCountries] = useState<Country[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [isoCode, setIsoCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const activeCount = useMemo(
    () => countries.filter((country) => country.status === "active").length,
    [countries],
  );
  const inactiveCount = countries.length - activeCount;

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setIsoCode("");
    setPhoneCode("");
    setStatus("active");
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setIsoCode("");
    setPhoneCode("");
    setStatus("active");
    setIsModalOpen(true);
  };

  const downloadTemplate = () => {
    const templateRows = [
      {
        name: "India",
        iso_code: "IN",
        phone_code: "+91",
        status: "active",
      },
      {
        name: "United States",
        iso_code: "US",
        phone_code: "+1",
        status: "active",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Countries");
    XLSX.writeFile(workbook, "country-template.xlsx");
  };

  const fetchCountries = useCallback(
    async (page: number) => {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get("/api/locations/country", {
          params: {
            page,
            limit: pagination.limit,
          },
        });

        setCountries(response.data?.data ?? []);
        setPagination(response.data?.pagination ?? defaultPagination);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setMessage(axiosError.response?.data?.message ?? "Failed to fetch countries");
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
        name: name.trim(),
        iso_code: isoCode.trim() || null,
        phone_code: phoneCode.trim() || null,
        status,
      };

      if (editingId) {
        const response = await api.put("/api/locations/country", {
          id: editingId,
          ...payload,
        });
        setMessage(response.data?.message ?? "Country updated successfully");
      } else {
        const response = await api.post("/api/locations/country", payload);
        setMessage(response.data?.message ?? "Country created successfully");
      }

      resetForm();
      await fetchCountries(isEditing ? pagination.page : 1);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to save country");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (country: Country) => {
    setEditingId(country.id);
    setName(country.name);
    setIsoCode(country.iso_code ?? "");
    setPhoneCode(country.phone_code ?? "");
    setStatus(country.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setMessage("");

    try {
      const response = await api.delete("/api/locations/country", { data: { id } });
      setMessage(response.data?.message ?? "Country deleted successfully");
      const hasOnlyOneItem = countries.length === 1;
      const targetPage =
        hasOnlyOneItem && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await fetchCountries(targetPage);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to delete country");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setSelectedFileName(file?.name ?? "");
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select an excel file to upload");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/locations/country", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        message?: string;
        errors?: string[];
      };

      if (!response.ok) {
        const firstError = data.errors?.[0];
        setMessage(firstError ? `${data.message}: ${firstError}` : data.message ?? "Upload failed");
        return;
      }

      setMessage(data.message ?? "Country excel imported successfully");
      setSelectedFile(null);
      setSelectedFileName("");
      await fetchCountries(1);
    } catch {
      setMessage("Failed to upload country excel");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    void fetchCountries(1);
  }, [fetchCountries]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
            Location Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">
            Country
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#4F6D7A]">
            Create, update, delete, and import country records.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] shadow-sm transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A]"
            >
              Add Country
            </button>
            <button
              type="button"
              onClick={() => void fetchCountries(pagination.page)}
              className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-4 py-2 text-sm font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={downloadTemplate}
              className="rounded-md border border-[#1F3B4D]/45 bg-white px-4 py-2 text-sm font-semibold text-[#1F3B4D] transition hover:bg-[#eef3f6]"
            >
              Download Template
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

        <div className="rounded-2xl border border-[#C0D6DF]/50 bg-white p-4 shadow-[0_8px_22px_rgba(127,127,127,0.16)]">
          <h2 className="text-base font-semibold text-[#1F3B4D]">Bulk Upload (Excel)</h2>
          <p className="mt-1 text-sm text-[#4F6D7A]">
            Accepted columns:{" "}
            <span className="font-medium">name, iso_code, phone_code, status</span>
          </p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="block w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] file:mr-3 file:rounded-md file:border file:border-[#4F6D7A]/35 file:bg-[#C0D6DF]/15 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-[#1F3B4D]"
            />
            <button
              type="button"
              onClick={handleBulkUpload}
              disabled={uploading}
              className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {uploading ? "Uploading..." : "Upload Excel"}
            </button>
          </div>
          {selectedFileName ? (
            <p className="mt-2 text-xs text-[#4F6D7A]">Selected file: {selectedFileName}</p>
          ) : null}
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
                <TableHead className="font-semibold text-[#f1f1f3]">Name</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">ISO Code</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Phone Code</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Status</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm">
                    Loading countries...
                  </TableCell>
                </TableRow>
              ) : countries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm">
                    No countries found.
                  </TableCell>
                </TableRow>
              ) : (
                countries.map((country, index) => (
                  <TableRow key={country.id} className="hover:bg-[#C0D6DF]/12">
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {country.name}
                    </TableCell>
                    <TableCell className="text-[#4F6D7A]">{country.iso_code || "-"}</TableCell>
                    <TableCell className="text-[#4F6D7A]">
                      {country.phone_code || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          country.status === "active"
                            ? "border border-[#4F6D7A]/40 bg-[#C0D6DF]/30 text-[#1F3B4D]"
                            : "border border-[#C0D6DF]/60 bg-[#C0D6DF]/20 text-[#4F6D7A]"
                        }`}
                      >
                        {country.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(country)}
                          className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(country.id)}
                          disabled={deletingId === country.id}
                          className="rounded-md border border-[#1F3B4D]/35 bg-[#1F3B4D]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#1F3B4D]/25 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {deletingId === country.id ? "Deleting..." : "Delete"}
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
                onClick={() => void fetchCountries(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => void fetchCountries(pagination.page + 1)}
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
                  {editingId ? "Update Country" : "Create Country"}
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
                <label className="text-xs font-semibold text-[#1F3B4D]">Country Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  placeholder="Enter country name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">ISO Code</label>
                <input
                  type="text"
                  value={isoCode}
                  onChange={(event) => setIsoCode(event.target.value.toUpperCase())}
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  placeholder="IN, US, AE..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">Phone Code</label>
                <input
                  type="text"
                  value={phoneCode}
                  onChange={(event) => setPhoneCode(event.target.value)}
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  placeholder="+91, +1..."
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
                  {submitting ? "Saving..." : editingId ? "Update Country" : "Create Country"}
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
