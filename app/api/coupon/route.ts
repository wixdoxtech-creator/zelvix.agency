import Coupon from "@/model/coupon";
import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parseNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function parseDate(value: unknown) {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseCouponId(request: Request, body?: Record<string, unknown>) {
  const { searchParams } = new URL(request.url);
  const idFromQuery = Number(searchParams.get("id"));
  const idFromBody = Number(body?.id);

  if (Number.isInteger(idFromQuery) && idFromQuery > 0) {
    return idFromQuery;
  }

  if (Number.isInteger(idFromBody) && idFromBody > 0) {
    return idFromBody;
  }

  return Number.NaN;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = Number(searchParams.get("id"));

    if (Number.isInteger(idParam) && idParam > 0) {
      const coupon = await Coupon.findByPk(idParam);

      if (!coupon) {
        return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
      }

      return NextResponse.json(
        {
          message: "Coupon fetched successfully",
          data: coupon,
        },
        { status: 200 },
      );
    }

    const coupons = await Coupon.findAll({
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(
      {
        message: "Coupon list fetched successfully",
        data: coupons,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch coupon data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const code = normalizeText(body?.code).toUpperCase();
    const discountType = normalizeText(body?.discount_type) || "percentage";
    const discountValue = parseNumber(body?.discount_value);

    if (!code || discountValue === undefined) {
      return NextResponse.json(
        { message: "Code and discount_value are required" },
        { status: 400 },
      );
    }

    if (discountType !== "percentage" && discountType !== "fixed") {
      return NextResponse.json(
        { message: "discount_type must be 'percentage' or 'fixed'" },
        { status: 400 },
      );
    }

    if (discountValue < 0) {
      return NextResponse.json(
        { message: "discount_value must be 0 or greater" },
        { status: 400 },
      );
    }

    const existingCoupon = await Coupon.findOne({ where: { code } });
    if (existingCoupon) {
      return NextResponse.json(
        { message: "Coupon already exists with this code" },
        { status: 409 },
      );
    }

    const status = normalizeText(body?.status) || "active";
    if (status !== "active" && status !== "inactive") {
      return NextResponse.json(
        { message: "Status must be 'active' or 'inactive'" },
        { status: 400 },
      );
    }

    const minOrderAmount = parseNumber(body?.min_order_amount);
    const maxDiscountAmount = parseNumber(body?.max_discount_amount);
    const usageLimit = parseNumber(body?.usage_limit);
    const usedCount = parseNumber(body?.used_count);

    if (minOrderAmount !== undefined && minOrderAmount < 0) {
      return NextResponse.json(
        { message: "min_order_amount must be 0 or greater" },
        { status: 400 },
      );
    }

    if (maxDiscountAmount !== undefined && maxDiscountAmount < 0) {
      return NextResponse.json(
        { message: "max_discount_amount must be 0 or greater" },
        { status: 400 },
      );
    }

    if (usageLimit !== undefined && usageLimit < 0) {
      return NextResponse.json(
        { message: "usage_limit must be 0 or greater" },
        { status: 400 },
      );
    }

    if (usedCount !== undefined && usedCount < 0) {
      return NextResponse.json(
        { message: "used_count must be 0 or greater" },
        { status: 400 },
      );
    }

    const startDate = parseDate(body?.start_date);
    if (startDate === undefined) {
      return NextResponse.json(
        { message: "start_date is invalid" },
        { status: 400 },
      );
    }

    const endDate = parseDate(body?.end_date);
    if (endDate === undefined) {
      return NextResponse.json(
        { message: "end_date is invalid" },
        { status: 400 },
      );
    }

    if (startDate && endDate && startDate > endDate) {
      return NextResponse.json(
        { message: "start_date cannot be greater than end_date" },
        { status: 400 },
      );
    }

    const coupon = await Coupon.create({
      code,
      discount_type: discountType,
      discount_value: discountValue,
      min_order_amount: minOrderAmount ?? null,
      max_discount_amount: maxDiscountAmount ?? null,
      usage_limit: usageLimit !== undefined ? Math.trunc(usageLimit) : null,
      used_count: usedCount !== undefined ? Math.trunc(usedCount) : 0,
      start_date: startDate,
      end_date: endDate,
      status,
    });

    return NextResponse.json(
      {
        message: "Coupon created successfully",
        data: coupon,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create coupon" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const couponId = parseCouponId(request, body);

    if (!Number.isInteger(couponId) || couponId <= 0) {
      return NextResponse.json(
        { message: "Valid coupon id is required" },
        { status: 400 },
      );
    }

    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
    }

    const hasCode = Object.prototype.hasOwnProperty.call(body, "code");
    const hasDiscountType = Object.prototype.hasOwnProperty.call(body, "discount_type");
    const hasDiscountValue = Object.prototype.hasOwnProperty.call(body, "discount_value");
    const hasMinOrderAmount = Object.prototype.hasOwnProperty.call(body, "min_order_amount");
    const hasMaxDiscountAmount = Object.prototype.hasOwnProperty.call(body, "max_discount_amount");
    const hasUsageLimit = Object.prototype.hasOwnProperty.call(body, "usage_limit");
    const hasUsedCount = Object.prototype.hasOwnProperty.call(body, "used_count");
    const hasStartDate = Object.prototype.hasOwnProperty.call(body, "start_date");
    const hasEndDate = Object.prototype.hasOwnProperty.call(body, "end_date");
    const hasStatus = Object.prototype.hasOwnProperty.call(body, "status");

    if (
      !hasCode &&
      !hasDiscountType &&
      !hasDiscountValue &&
      !hasMinOrderAmount &&
      !hasMaxDiscountAmount &&
      !hasUsageLimit &&
      !hasUsedCount &&
      !hasStartDate &&
      !hasEndDate &&
      !hasStatus
    ) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    if (hasCode) {
      const code = normalizeText(body?.code).toUpperCase();
      if (!code) {
        return NextResponse.json(
          { message: "code cannot be empty" },
          { status: 400 },
        );
      }

      const existingCoupon = await Coupon.findOne({ where: { code } });
      if (existingCoupon && Number(existingCoupon.get("id")) !== couponId) {
        return NextResponse.json(
          { message: "Coupon code is already in use" },
          { status: 409 },
        );
      }

      coupon.set("code", code);
    }

    if (hasDiscountType) {
      const discountType = normalizeText(body?.discount_type);
      if (discountType !== "percentage" && discountType !== "fixed") {
        return NextResponse.json(
          { message: "discount_type must be 'percentage' or 'fixed'" },
          { status: 400 },
        );
      }
      coupon.set("discount_type", discountType);
    }

    if (hasDiscountValue) {
      const discountValue = parseNumber(body?.discount_value);
      if (discountValue === undefined || discountValue < 0) {
        return NextResponse.json(
          { message: "discount_value must be 0 or greater" },
          { status: 400 },
        );
      }
      coupon.set("discount_value", discountValue);
    }

    if (hasMinOrderAmount) {
      const minOrderAmount = parseNumber(body?.min_order_amount);
      if (minOrderAmount !== undefined && minOrderAmount < 0) {
        return NextResponse.json(
          { message: "min_order_amount must be 0 or greater" },
          { status: 400 },
        );
      }
      coupon.set("min_order_amount", minOrderAmount ?? null);
    }

    if (hasMaxDiscountAmount) {
      const maxDiscountAmount = parseNumber(body?.max_discount_amount);
      if (maxDiscountAmount !== undefined && maxDiscountAmount < 0) {
        return NextResponse.json(
          { message: "max_discount_amount must be 0 or greater" },
          { status: 400 },
        );
      }
      coupon.set("max_discount_amount", maxDiscountAmount ?? null);
    }

    if (hasUsageLimit) {
      const usageLimit = parseNumber(body?.usage_limit);
      if (usageLimit !== undefined && usageLimit < 0) {
        return NextResponse.json(
          { message: "usage_limit must be 0 or greater" },
          { status: 400 },
        );
      }
      coupon.set(
        "usage_limit",
        usageLimit !== undefined ? Math.trunc(usageLimit) : null,
      );
    }

    if (hasUsedCount) {
      const usedCount = parseNumber(body?.used_count);
      if (usedCount === undefined || usedCount < 0) {
        return NextResponse.json(
          { message: "used_count must be 0 or greater" },
          { status: 400 },
        );
      }
      coupon.set("used_count", Math.trunc(usedCount));
    }

    const updatedStartDate = hasStartDate ? parseDate(body?.start_date) : undefined;
    if (updatedStartDate === undefined && hasStartDate) {
      return NextResponse.json(
        { message: "start_date is invalid" },
        { status: 400 },
      );
    }

    const updatedEndDate = hasEndDate ? parseDate(body?.end_date) : undefined;
    if (updatedEndDate === undefined && hasEndDate) {
      return NextResponse.json(
        { message: "end_date is invalid" },
        { status: 400 },
      );
    }

    const nextStartDate =
      hasStartDate ? updatedStartDate : (coupon.get("start_date") as Date | null);
    const nextEndDate =
      hasEndDate ? updatedEndDate : (coupon.get("end_date") as Date | null);

    if (nextStartDate && nextEndDate && nextStartDate > nextEndDate) {
      return NextResponse.json(
        { message: "start_date cannot be greater than end_date" },
        { status: 400 },
      );
    }

    if (hasStartDate) {
      coupon.set("start_date", updatedStartDate);
    }

    if (hasEndDate) {
      coupon.set("end_date", updatedEndDate);
    }

    if (hasStatus) {
      const status = normalizeText(body?.status);
      if (status !== "active" && status !== "inactive") {
        return NextResponse.json(
          { message: "Status must be 'active' or 'inactive'" },
          { status: 400 },
        );
      }
      coupon.set("status", status);
    }

    await coupon.save();

    return NextResponse.json(
      {
        message: "Coupon updated successfully",
        data: coupon,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update coupon" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    let body: Record<string, unknown> = {};

    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const couponId = parseCouponId(request, body);

    if (!Number.isInteger(couponId) || couponId <= 0) {
      return NextResponse.json(
        { message: "Valid coupon id is required" },
        { status: 400 },
      );
    }

    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
    }

    await coupon.destroy();

    return NextResponse.json(
      { message: "Coupon deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete coupon" },
      { status: 500 },
    );
  }
}
