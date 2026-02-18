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

type Pincode = {
  id: number;
  city_id: number;
  pincode: string;
  area_name: string | null;
  status: "active" | "inactive";
};

type CityOption = {
  id: number;
  name: string;
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
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [cityId, setCityId] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [areaName, setAreaName] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const cityMap = useMemo(() => {
    const map = new Map<number, string>();
    cities.forEach((city) => {
      map.set(city.id, city.name);
    });
    return map;
  }, [cities]);
  const activeCount = useMemo(
    () => pincodes.filter((row) => row.status === "active").length,
    [pincodes],
  );
  const inactiveCount = pincodes.length - activeCount;

  const resetForm = () => {
    setEditingId(null);
    setCityId("");
    setPinCode("");
    setAreaName("");
    setStatus("active");
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setCityId("");
    setPinCode("");
    setAreaName("");
    setStatus("active");
    setIsModalOpen(true);
  };

  const downloadTemplate = () => {
    const templateRows = [
      {
        city_id: 1,
        pincode: "395007",
        area_name: "Vesu",
        status: "active",
      },
      {
        city_id: 1,
        pincode: "395003",
        area_name: "Adajan",
        status: "active",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pincodes");
    XLSX.writeFile(workbook, "pincode-template.xlsx");
  };

  const fetchCities = useCallback(async () => {
    try {
      const response = await api.get("/api/locations/city", {
        params: {
          page: 1,
          limit: 1000,
          status: "active",
        },
      });
      setCities(response.data?.data ?? []);
    } catch {
      setCities([]);
    }
  }, []);

  const fetchPincodes = useCallback(
    async (page: number) => {
      setLoading(true);
      setMessage("");

      try {
        const response = await api.get("/api/locations/pincode", {
          params: {
            page,
            limit: pagination.limit,
          },
        });

        setPincodes(response.data?.data ?? []);
        setPagination(response.data?.pagination ?? defaultPagination);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setMessage(axiosError.response?.data?.message ?? "Failed to fetch pincodes");
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
    const parsedCityId = Number(cityId);
    const isEditing = Boolean(editingId);

    if (!Number.isInteger(parsedCityId) || parsedCityId <= 0) {
      setMessage("Please select a valid city");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        city_id: parsedCityId,
        pincode: pinCode.trim(),
        area_name: areaName.trim() || null,
        status,
      };

      if (editingId) {
        const response = await api.put("/api/locations/pincode", {
          id: editingId,
          ...payload,
        });
        setMessage(response.data?.message ?? "Pincode updated successfully");
      } else {
        const response = await api.post("/api/locations/pincode", payload);
        setMessage(response.data?.message ?? "Pincode created successfully");
      }

      resetForm();
      await fetchPincodes(isEditing ? pagination.page : 1);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to save pincode");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (row: Pincode) => {
    setEditingId(row.id);
    setCityId(String(row.city_id));
    setPinCode(row.pincode);
    setAreaName(row.area_name ?? "");
    setStatus(row.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setMessage("");

    try {
      const response = await api.delete("/api/locations/pincode", { data: { id } });
      setMessage(response.data?.message ?? "Pincode deleted successfully");
      const hasOnlyOneItem = pincodes.length === 1;
      const targetPage =
        hasOnlyOneItem && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await fetchPincodes(targetPage);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to delete pincode");
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

      const response = await fetch("/api/locations/pincode", {
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

      setMessage(data.message ?? "Pincode excel imported successfully");
      setSelectedFile(null);
      setSelectedFileName("");
      await fetchPincodes(1);
    } catch {
      setMessage("Failed to upload pincode excel");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    void fetchCities();
    void fetchPincodes(1);
  }, [fetchCities, fetchPincodes]);

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
            Location Management
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">
            Pincode
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#4F6D7A]">
            Create, update, delete, and import pincode records.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] shadow-sm transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A]"
            >
              Add Pincode
            </button>
            <button
              type="button"
              onClick={() => void fetchPincodes(pagination.page)}
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
            <span className="font-medium">city_id, pincode, area_name, status</span>
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
                <TableHead className="font-semibold text-[#f1f1f3]">Pincode</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Area Name</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">City</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Status</TableHead>
                <TableHead className="font-semibold text-[#f1f1f3]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm">
                    Loading pincodes...
                  </TableCell>
                </TableRow>
              ) : pincodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm">
                    No pincodes found.
                  </TableCell>
                </TableRow>
              ) : (
                pincodes.map((row, index) => (
                  <TableRow key={row.id} className="hover:bg-[#C0D6DF]/12">
                    <TableCell className="font-medium text-[#1F3B4D]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-[#1F3B4D]">{row.pincode}</TableCell>
                    <TableCell className="text-[#4F6D7A]">{row.area_name || "-"}</TableCell>
                    <TableCell className="text-[#4F6D7A]">
                      {cityMap.get(row.city_id) ?? `City #${row.city_id}`}
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
                onClick={() => void fetchPincodes(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="rounded-md border border-[#4F6D7A]/45 bg-[#C0D6DF]/15 px-3 py-1.5 text-xs font-semibold text-[#1F3B4D] transition hover:bg-[#C0D6DF]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => void fetchPincodes(pagination.page + 1)}
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
                  {editingId ? "Update Pincode" : "Create Pincode"}
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
                <label className="text-xs font-semibold text-[#1F3B4D]">City</label>
                <select
                  value={cityId}
                  onChange={(event) => setCityId(event.target.value)}
                  className="h-10 w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  required
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">Pincode</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(event) => setPinCode(event.target.value)}
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  placeholder="Enter pincode"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1F3B4D]">Area Name</label>
                <input
                  type="text"
                  value={areaName}
                  onChange={(event) => setAreaName(event.target.value)}
                  className="w-full rounded-md border border-[#C0D6DF]/70 bg-white px-3 py-2 text-sm text-[#1F3B4D] outline-none ring-[#4F6D7A]/30 focus:ring-2"
                  placeholder="Optional area name"
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
                  {submitting ? "Saving..." : editingId ? "Update Pincode" : "Create Pincode"}
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
