import User from "@/model/user";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

function parseUserIdFromRequest(request: Request, body?: Record<string, unknown>) {
  const { searchParams } = new URL(request.url);
  const idFromQuery = Number(searchParams.get("userId"));
  const idFromBody = Number(body?.userId);

  if (Number.isInteger(idFromQuery) && idFromQuery > 0) {
    return idFromQuery;
  }

  if (Number.isInteger(idFromBody) && idFromBody > 0) {
    return idFromBody;
  }

  return Number.NaN;
}

async function updatePendingCustomer(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const userId = parseUserIdFromRequest(request, body);
    const email = body?.email ? String(body.email).trim().toLowerCase() : undefined;
    const status = body?.status ? String(body.status) : undefined;

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { message: "Valid userId is required" },
        { status: 400 },
      );
    }

    if (status && status !== "block" && status !== "not_block") {
      return NextResponse.json(
        { message: "Status must be 'block' or 'not_block'" },
        { status: 400 },
      );
    }

    const user = await User.findOne({
      where: {
        id: userId,
        role: "user",
        [Op.and]: [{ status: "not_block" }, { is_block: false }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Pending customer not found" },
        { status: 404 },
      );
    }

    if (!email && !status) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && Number(existingUser.get("id")) !== userId) {
        return NextResponse.json(
          { message: "Email is already in use" },
          { status: 409 },
        );
      }
      user.set("email", email);
    }

    if (status) {
      user.set("status", status);
      user.set("is_block", status === "block");
    }

    await user.save();

    return NextResponse.json(
      {
        message: "Pending customer updated successfully",
        data: {
          id: user.get("id"),
          email: user.get("email"),
          role: user.get("role"),
          status: user.get("status"),
          is_block: user.get("is_block"),
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update pending customer" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: {
        role: "user",
        [Op.and]: [{ status: "not_block" }, { is_block: false }],
      },
      attributes: [
        "id",
        "email",
        "role",
        "status",
        "is_block",
        "is_verified",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "Pending customer list fetched successfully",
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
      { message: "Failed to fetch pending customer list" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  return updatePendingCustomer(request);
}

export async function PATCH(request: Request) {
  return updatePendingCustomer(request);
}

export async function DELETE(request: Request) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const userId = parseUserIdFromRequest(request, body);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { message: "Valid userId is required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({
      where: {
        id: userId,
        role: "user",
        [Op.and]: [{ status: "not_block" }, { is_block: false }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Pending customer not found" },
        { status: 404 },
      );
    }

    await user.destroy();

    return NextResponse.json(
      { message: "Pending customer deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete pending customer" },
      { status: 500 },
    );
  }
}
