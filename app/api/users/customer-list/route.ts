import User from "@/model/user";
import { Op } from "sequelize";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const statusParam = searchParams.get("status");

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = { role: "user" };
    if (statusParam === "block") {
      whereClause[Op.or] = [{ status: "block" }, { is_block: true }];
    } else if (statusParam === "not_block") {
      whereClause[Op.and] = [{ status: "not_block" }, { is_block: false }];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
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
        message: "Customer list fetched successfully",
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
      { message: "Failed to fetch customer list" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const userId = Number(body?.userId);
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
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
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
        message: "Customer updated successfully",
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
      { message: "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    let userId = Number(userIdParam);

    if (!userIdParam) {
      try {
        const body = await request.json();
        userId = Number(body?.userId);
      } catch {
        userId = Number.NaN;
      }
    }

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
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await user.destroy();

    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
