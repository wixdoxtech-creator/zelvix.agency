import Address from "@/model/address";
import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parseNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const text = value.trim().toLowerCase();
    if (text === "true") {
      return true;
    }
    if (text === "false") {
      return false;
    }
  }

  return undefined;
}

function parseAddressId(request: Request, body?: Record<string, unknown>) {
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
    const userIdParam = Number(searchParams.get("user_id"));

    if (Number.isInteger(idParam) && idParam > 0) {
      const address = await Address.findByPk(idParam);

      if (!address) {
        return NextResponse.json({ message: "Address not found" }, { status: 404 });
      }

      return NextResponse.json(
        { message: "Address fetched successfully", data: address },
        { status: 200 },
      );
    }

    if (Number.isInteger(userIdParam) && userIdParam > 0) {
      const addresses = await Address.findAll({
        where: { user_id: userIdParam },
        order: [["is_default", "DESC"], ["createdAt", "DESC"]],
      });

      return NextResponse.json(
        { message: "User addresses fetched successfully", data: addresses },
        { status: 200 },
      );
    }

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const statusParam = normalizeText(searchParams.get("status"));

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};
    if (statusParam === "active" || statusParam === "inactive") {
      whereClause.status = statusParam;
    }

    const { count, rows } = await Address.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "Address list fetched successfully",
        data: rows,
        pagination: {
          page,
          limit,
          totalItems: count,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch address data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const userId = parseNumber(body?.user_id);
    const fullName = normalizeText(body?.full_name);
    const mobile = normalizeText(body?.mobile);
    const addressLine1 = normalizeText(body?.address_line_1);
    const postalCode = normalizeText(body?.postal_code);

    if (
      userId === undefined ||
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !fullName ||
      !mobile ||
      !addressLine1 ||
      !postalCode
    ) {
      return NextResponse.json(
        {
          message:
            "user_id, full_name, mobile, address_line_1 and postal_code are required",
        },
        { status: 400 },
      );
    }

    const addressType = normalizeText(body?.address_type) || "home";
    if (!["home", "office", "other"].includes(addressType)) {
      return NextResponse.json(
        { message: "address_type must be home, office or other" },
        { status: 400 },
      );
    }

    const status = normalizeText(body?.status) || "active";
    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { message: "status must be active or inactive" },
        { status: 400 },
      );
    }

    const isDefault = parseBoolean(body?.is_default) ?? false;

    if (isDefault) {
      await Address.update({ is_default: false }, { where: { user_id: userId } });
    }

    const payload = {
      user_id: Math.trunc(userId),
      full_name: fullName,
      mobile,
      alternate_mobile: normalizeText(body?.alternate_mobile) || null,
      address_line_1: addressLine1,
      address_line_2: normalizeText(body?.address_line_2) || null,
      landmark: normalizeText(body?.landmark) || null,
      country_id: parseNumber(body?.country_id) ?? null,
      state_id: parseNumber(body?.state_id) ?? null,
      city_id: parseNumber(body?.city_id) ?? null,
      pincode_id: parseNumber(body?.pincode_id) ?? null,
      postal_code: postalCode,
      address_type: addressType,
      is_default: isDefault,
      status,
    };

    const address = await Address.create(payload);

    return NextResponse.json(
      { message: "Address created successfully", data: address },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to create address" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const addressId = parseAddressId(request, body);

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return NextResponse.json(
        { message: "Valid address id is required" },
        { status: 400 },
      );
    }

    const address = await Address.findByPk(addressId);
    if (!address) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 });
    }

    const hasUserId = Object.prototype.hasOwnProperty.call(body, "user_id");
    const hasFullName = Object.prototype.hasOwnProperty.call(body, "full_name");
    const hasMobile = Object.prototype.hasOwnProperty.call(body, "mobile");
    const hasAlternateMobile = Object.prototype.hasOwnProperty.call(
      body,
      "alternate_mobile",
    );
    const hasAddressLine1 = Object.prototype.hasOwnProperty.call(
      body,
      "address_line_1",
    );
    const hasAddressLine2 = Object.prototype.hasOwnProperty.call(
      body,
      "address_line_2",
    );
    const hasLandmark = Object.prototype.hasOwnProperty.call(body, "landmark");
    const hasCountryId = Object.prototype.hasOwnProperty.call(body, "country_id");
    const hasStateId = Object.prototype.hasOwnProperty.call(body, "state_id");
    const hasCityId = Object.prototype.hasOwnProperty.call(body, "city_id");
    const hasPincodeId = Object.prototype.hasOwnProperty.call(body, "pincode_id");
    const hasPostalCode = Object.prototype.hasOwnProperty.call(body, "postal_code");
    const hasAddressType = Object.prototype.hasOwnProperty.call(
      body,
      "address_type",
    );
    const hasIsDefault = Object.prototype.hasOwnProperty.call(body, "is_default");
    const hasStatus = Object.prototype.hasOwnProperty.call(body, "status");

    if (
      !hasUserId &&
      !hasFullName &&
      !hasMobile &&
      !hasAlternateMobile &&
      !hasAddressLine1 &&
      !hasAddressLine2 &&
      !hasLandmark &&
      !hasCountryId &&
      !hasStateId &&
      !hasCityId &&
      !hasPincodeId &&
      !hasPostalCode &&
      !hasAddressType &&
      !hasIsDefault &&
      !hasStatus
    ) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    if (hasUserId) {
      const userId = parseNumber(body?.user_id);
      if (userId === undefined || !Number.isInteger(userId) || userId <= 0) {
        return NextResponse.json(
          { message: "user_id must be a valid positive integer" },
          { status: 400 },
        );
      }
      address.set("user_id", Math.trunc(userId));
    }

    if (hasFullName) {
      const fullName = normalizeText(body?.full_name);
      if (!fullName) {
        return NextResponse.json(
          { message: "full_name cannot be empty" },
          { status: 400 },
        );
      }
      address.set("full_name", fullName);
    }

    if (hasMobile) {
      const mobile = normalizeText(body?.mobile);
      if (!mobile) {
        return NextResponse.json(
          { message: "mobile cannot be empty" },
          { status: 400 },
        );
      }
      address.set("mobile", mobile);
    }

    if (hasAlternateMobile) {
      address.set("alternate_mobile", normalizeText(body?.alternate_mobile) || null);
    }

    if (hasAddressLine1) {
      const value = normalizeText(body?.address_line_1);
      if (!value) {
        return NextResponse.json(
          { message: "address_line_1 cannot be empty" },
          { status: 400 },
        );
      }
      address.set("address_line_1", value);
    }

    if (hasAddressLine2) {
      address.set("address_line_2", normalizeText(body?.address_line_2) || null);
    }

    if (hasLandmark) {
      address.set("landmark", normalizeText(body?.landmark) || null);
    }

    if (hasCountryId) {
      const value = parseNumber(body?.country_id);
      address.set("country_id", value === undefined ? null : Math.trunc(value));
    }

    if (hasStateId) {
      const value = parseNumber(body?.state_id);
      address.set("state_id", value === undefined ? null : Math.trunc(value));
    }

    if (hasCityId) {
      const value = parseNumber(body?.city_id);
      address.set("city_id", value === undefined ? null : Math.trunc(value));
    }

    if (hasPincodeId) {
      const value = parseNumber(body?.pincode_id);
      address.set("pincode_id", value === undefined ? null : Math.trunc(value));
    }

    if (hasPostalCode) {
      const value = normalizeText(body?.postal_code);
      if (!value) {
        return NextResponse.json(
          { message: "postal_code cannot be empty" },
          { status: 400 },
        );
      }
      address.set("postal_code", value);
    }

    if (hasAddressType) {
      const value = normalizeText(body?.address_type);
      if (!["home", "office", "other"].includes(value)) {
        return NextResponse.json(
          { message: "address_type must be home, office or other" },
          { status: 400 },
        );
      }
      address.set("address_type", value);
    }

    if (hasStatus) {
      const value = normalizeText(body?.status);
      if (!["active", "inactive"].includes(value)) {
        return NextResponse.json(
          { message: "status must be active or inactive" },
          { status: 400 },
        );
      }
      address.set("status", value);
    }

    if (hasIsDefault) {
      const isDefault = parseBoolean(body?.is_default);
      if (isDefault === undefined) {
        return NextResponse.json(
          { message: "is_default must be boolean" },
          { status: 400 },
        );
      }

      if (isDefault) {
        const userId = Number(address.get("user_id"));
        if (Number.isInteger(userId) && userId > 0) {
          await Address.update(
            { is_default: false },
            { where: { user_id: userId } },
          );
        }
      }

      address.set("is_default", isDefault);
    }

    await address.save();

    return NextResponse.json(
      { message: "Address updated successfully", data: address },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update address" },
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

    const addressId = parseAddressId(request, body);

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return NextResponse.json(
        { message: "Valid address id is required" },
        { status: 400 },
      );
    }

    const address = await Address.findByPk(addressId);
    if (!address) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 });
    }

    await address.destroy();

    return NextResponse.json(
      { message: "Address deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete address" },
      { status: 500 },
    );
  }
}
