"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import api from "@/lib/helper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DashboardStats = {
  products: number;
  categories: number;
  inventory: number;
  coupons: number;
  customers: number;
  blockedCustomers: number;
};

const defaultStats: DashboardStats = {
  products: 0,
  categories: 0,
  inventory: 0,
  coupons: 0,
  customers: 0,
  blockedCustomers: 0,
};

const getTotalItems = (response: unknown) => {
  const payload = response as {
    data?: {
      data?: unknown[];
      pagination?: { totalItems?: number };
    };
  };

  return payload?.data?.pagination?.totalItems ?? payload?.data?.data?.length ?? 0;
};

const formatNumber = (value: number) => value.toLocaleString("en-US");

const buildLinePoints = (values: number[], width: number, height: number) => {
  const max = Math.max(...values, 1);
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  return values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
};

const buildAreaPath = (values: number[], width: number, height: number) => {
  const linePoints = buildLinePoints(values, width, height);
  const firstX = 0;
  const lastX = values.length > 1 ? width : 0;
  return `M ${firstX},${height} L ${linePoints.replace(/ /g, " L ")} L ${lastX},${height} Z`;
};

const Page = () => {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const [productsRes, categoriesRes, inventoryRes, couponsRes, customersRes, blockedRes] =
        await Promise.all([
          api.get("/api/products/create-product", { params: { page: 1, limit: 1 } }),
          api.get("/api/products/product-category", { params: { page: 1, limit: 1 } }),
          api.get("/api/products/inventory", { params: { page: 1, limit: 1 } }),
          api.get("/api/coupon"),
          api.get("/api/users/customer-list", { params: { page: 1, limit: 1 } }),
          api.get("/api/users/block-user", { params: { page: 1, limit: 1 } }),
        ]);

      setStats({
        products: getTotalItems(productsRes),
        categories: getTotalItems(categoriesRes),
        inventory: getTotalItems(inventoryRes),
        coupons:
          (couponsRes.data?.data as unknown[] | undefined)?.length ?? getTotalItems(couponsRes),
        customers: getTotalItems(customersRes),
        blockedCustomers: getTotalItems(blockedRes),
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardStats();
  }, [fetchDashboardStats]);

  const overviewData = useMemo(
    () => [
      { label: "Products", value: stats.products },
      { label: "Categories", value: stats.categories },
      { label: "Inventory", value: stats.inventory },
      { label: "Coupons", value: stats.coupons },
    ],
    [stats],
  );

  const customerData = useMemo(
    () => [
      { label: "Customers", value: stats.customers },
      { label: "Blocked", value: stats.blockedCustomers },
    ],
    [stats],
  );

  const allValues = overviewData.map((item) => item.value);
  const linePoints = buildLinePoints(allValues, 260, 110);
  const areaPath = buildAreaPath(allValues, 260, 110);
  const maxOverview = Math.max(...allValues, 1);
  const totalOverview = Math.max(
    overviewData.reduce((sum, item) => sum + item.value, 0),
    1,
  );

  const pieTotal = Math.max(stats.products + stats.categories + stats.coupons, 1);
  const productPct = (stats.products / pieTotal) * 100;
  const categoryPct = (stats.categories / pieTotal) * 100;
  const couponPct = Math.max(0, 100 - productPct - categoryPct);

  const radialValue = stats.customers > 0 ? (stats.blockedCustomers / stats.customers) * 100 : 0;
  const radialSafe = Math.min(100, Math.max(0, radialValue));

  const radarMax = Math.max(
    stats.products,
    stats.categories,
    stats.inventory,
    stats.coupons,
    stats.customers,
    1,
  );

  const radarPoints = [
    { x: 80, y: 10, value: stats.products / radarMax },
    { x: 145, y: 50, value: stats.categories / radarMax },
    { x: 120, y: 125, value: stats.inventory / radarMax },
    { x: 40, y: 125, value: stats.coupons / radarMax },
    { x: 15, y: 50, value: stats.customers / radarMax },
  ];

  const radarPolygon = radarPoints
    .map((point) => {
      const cx = 80;
      const cy = 70;
      const x = cx + (point.x - cx) * point.value;
      const y = cy + (point.y - cy) * point.value;
      return `${x},${y}`;
    })
    .join(" ");

  const radarVertices = radarPoints.map((point) => {
    const cx = 80;
    const cy = 70;
    const x = cx + (point.x - cx) * point.value;
    const y = cy + (point.y - cy) * point.value;
    return { x, y };
  });

  return (
    <section className="min-h-screen w-full bg-[linear-gradient(160deg,#f6f6f7_0%,#ededf0_45%,#e2e2e6_100%)] p-4 md:p-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-[#4F6D7A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f1f4_100%)] p-5 shadow-[0_10px_30px_rgba(89,89,89,0.12)] md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F6D7A]">
                Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-[#1F3B4D] md:text-3xl">
                Admin Overview
              </h1>
            </div>
            <button
              type="button"
              onClick={() => void fetchDashboardStats()}
              disabled={loading}
              className="rounded-md border border-[#1F3B4D] bg-[#1F3B4D] px-4 py-2 text-sm font-semibold text-[#f1f1f3] transition hover:border-[#4F6D7A] hover:bg-[#4F6D7A] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {message ? (
          <div className="rounded-xl border border-[#C0D6DF]/50 bg-[linear-gradient(145deg,#ffffff_0%,#f5f5f7_100%)] px-4 py-3 text-sm text-[#1F3B4D] shadow-sm">
            {message}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewData.map((item) => (
            <Card
              key={item.label}
              className="border-[#C0D6DF]/60 bg-white shadow-[0_8px_22px_rgba(127,127,127,0.16)]"
            >
              <CardHeader className="space-y-2 pb-3">
                <CardDescription className="text-xs text-[#4F6D7A]">{item.label}</CardDescription>
                <CardTitle className="text-2xl text-[#1F3B4D]">{formatNumber(item.value)}</CardTitle>
                <div className="h-1.5 rounded-full bg-[#C0D6DF]/35">
                  <div
                    className="h-1.5 rounded-full bg-[linear-gradient(90deg,#1F3B4D_0%,#4F6D7A_100%)]"
                    style={{ width: `${(item.value / totalOverview) * 100}%` }}
                  />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="border-[#C0D6DF]/60 bg-white shadow-[0_8px_22px_rgba(127,127,127,0.16)]">
            <CardHeader>
              <CardTitle className="text-[#1F3B4D]">Area Chart</CardTitle>
              <CardDescription className="text-[#4F6D7A]">Entity growth area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <svg viewBox="0 0 260 120" className="h-40 w-full">
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F6D7A" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#C0D6DF" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#areaFill)" />
                <polyline points={linePoints} fill="none" stroke="#1F3B4D" strokeWidth="3" />
                {linePoints.split(" ").map((point, index) => {
                  const [x, y] = point.split(",").map(Number);
                  const item = overviewData[index];
                  return (
                    <circle key={`area-${point}`} cx={x} cy={y} r="3" fill="#1F3B4D">
                      <title>{`${item?.label ?? "Point"}: ${formatNumber(item?.value ?? 0)}`}</title>
                    </circle>
                  );
                })}
              </svg>
              <p className="text-xs text-[#4F6D7A]">Smooth area shows comparative entity volume.</p>
            </CardContent>
          </Card>

          <Card className="border-[#C0D6DF]/60 bg-white shadow-[0_8px_22px_rgba(127,127,127,0.16)]">
            <CardHeader>
              <CardTitle className="text-[#1F3B4D]">Bar Chart</CardTitle>
              <CardDescription className="text-[#4F6D7A]">Products vs Categories vs Coupons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-end justify-between gap-4">
                {overviewData.slice(0, 3).map((item) => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-[linear-gradient(180deg,#1F3B4D_0%,#4F6D7A_100%)]"
                      style={{ height: `${Math.max(12, (item.value / maxOverview) * 120)}px` }}
                      title={`${item.label}: ${formatNumber(item.value)}`}
                    />
                    <p className="text-xs font-medium text-[#4F6D7A]">{item.label}</p>
                    <p className="text-xs text-[#1F3B4D]">{formatNumber(item.value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C0D6DF]/60 bg-white shadow-[0_8px_22px_rgba(127,127,127,0.16)]">
            <CardHeader>
              <CardTitle className="text-[#1F3B4D]">Line Chart</CardTitle>
              <CardDescription className="text-[#4F6D7A]">Trend across main entities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <svg viewBox="0 0 260 120" className="h-40 w-full">
                <line x1="0" y1="30" x2="260" y2="30" stroke="#C0D6DF" strokeWidth="1" />
                <line x1="0" y1="60" x2="260" y2="60" stroke="#C0D6DF" strokeWidth="1" />
                <line x1="0" y1="90" x2="260" y2="90" stroke="#C0D6DF" strokeWidth="1" />
                <polyline points={linePoints} fill="none" stroke="#4F6D7A" strokeWidth="3" />
                {linePoints.split(" ").map((point, index) => {
                  const [x, y] = point.split(",").map(Number);
                  const item = overviewData[index];
                  return (
                    <circle key={point} cx={x} cy={y} r="3" fill="#1F3B4D">
                      <title>{`${item?.label ?? "Point"}: ${formatNumber(item?.value ?? 0)}`}</title>
                    </circle>
                  );
                })}
              </svg>
              <p className="text-xs text-[#4F6D7A]">Grid lines improve quick trend reading.</p>
            </CardContent>
          </Card>

          <Card className="border-[#C0D6DF]/60 bg-white shadow-[0_8px_22px_rgba(127,127,127,0.16)]">
            <CardHeader>
              <CardTitle className="text-[#1F3B4D]">Pie Chart</CardTitle>
              <CardDescription className="text-[#4F6D7A]">Distribution share</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-5">
              <div
                className="relative h-28 w-28 rounded-full"
                style={{
                  background: `conic-gradient(#1F3B4D 0% ${productPct}%, #4F6D7A ${productPct}% ${
                    productPct + categoryPct
                  }%, #C0D6DF ${productPct + categoryPct}% 100%)`,
                }}
              >
                <title>{`Products ${productPct.toFixed(1)}%, Categories ${categoryPct.toFixed(1)}%, Coupons ${couponPct.toFixed(1)}%`}</title>
                <div className="absolute inset-5 rounded-full bg-white" />
              </div>
              <div className="space-y-2 text-xs text-[#4F6D7A]">
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#1F3B4D]" /> Products: {productPct.toFixed(1)}%
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#4F6D7A]" /> Categories: {categoryPct.toFixed(1)}%
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#C0D6DF]" /> Coupons: {couponPct.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C0D6DF]/60 bg-white shadow-[0_8px_22px_rgba(127,127,127,0.16)]">
            <CardHeader>
              <CardTitle className="text-[#1F3B4D]">Radar Chart</CardTitle>
              <CardDescription className="text-[#4F6D7A]">Multi-metric balance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <svg viewBox="0 0 160 140" className="h-40 w-full">
                <polygon points="80,10 145,50 120,125 40,125 15,50" fill="none" stroke="#C0D6DF" strokeWidth="1" />
                <polygon points="80,30 126,58 109,111 51,111 34,58" fill="none" stroke="#C0D6DF" strokeWidth="1" />
                <polygon points={radarPolygon} fill="#4F6D7A" opacity="0.45" stroke="#1F3B4D" strokeWidth="2" />
                {radarVertices.map((vertex, index) => {
                  const item = [
                    { label: "Products", value: stats.products },
                    { label: "Categories", value: stats.categories },
                    { label: "Inventory", value: stats.inventory },
                    { label: "Coupons", value: stats.coupons },
                    { label: "Customers", value: stats.customers },
                  ][index];

                  return (
                    <circle key={`${vertex.x}-${vertex.y}`} cx={vertex.x} cy={vertex.y} r="3" fill="#1F3B4D">
                      <title>{`${item.label}: ${formatNumber(item.value)}`}</title>
                    </circle>
                  );
                })}
              </svg>
              <p className="text-xs text-[#4F6D7A]">Shows how balanced each metric is against max value.</p>
            </CardContent>
          </Card>

          <Card className="border-[#C0D6DF]/60 bg-white shadow-[0_8px_22px_rgba(127,127,127,0.16)]">
            <CardHeader>
              <CardTitle className="text-[#1F3B4D]">Radial Chart</CardTitle>
              <CardDescription className="text-[#4F6D7A]">Blocked customer rate</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-5">
              <div
                className="relative h-28 w-28 rounded-full"
                style={{
                  background: `conic-gradient(#1F3B4D 0% ${radialSafe}%, #C0D6DF ${radialSafe}% 100%)`,
                }}
                title={`Blocked ratio: ${radialSafe.toFixed(1)}%`}
              >
                <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white text-sm font-semibold text-[#1F3B4D]">
                  {radialSafe.toFixed(1)}%
                </div>
              </div>
              <div className="space-y-1 text-xs text-[#4F6D7A]">
                {customerData.map((item) => (
                  <p key={item.label}>
                    {item.label}: {formatNumber(item.value)}
                  </p>
                ))}
                <p className="font-medium text-[#1F3B4D]">Blocked Ratio: {radialSafe.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Page;
