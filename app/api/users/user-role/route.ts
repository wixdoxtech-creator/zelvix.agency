import User from "@/model/user";
import { hash } from "bcryptjs";
import { Op } from "sequelize";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = new Set([
  "admin",
  "inventory_manager",
  "sales",
  "warehouse",
]);

const ALLOWED_STATUS = new Set(["block", "not_block"]);

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parseUserId(request: Request, body?: Record<string, unknown>) {
  const { searchParams } = new URL(request.url);
  const idFromQuery = Number(searchParams.get("id"));
  const idFromBody = Number(body?.id ?? body?.userId);

  if (Number.isInteger(idFromQuery) && idFromQuery > 0) {
    return idFromQuery;
  }

  if (Number.isInteger(idFromBody) && idFromBody > 0) {
    return idFromBody;
  }

  return Number.NaN;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = Number(searchParams.get("id"));

    if (Number.isInteger(idParam) && idParam > 0) {
      const user = await User.findByPk(idParam, {
        attributes: ["id", "email", "role", "status", "createdAt", "updatedAt"],
      });

      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      return NextResponse.json(
        { message: "User fetched successfully", data: user },
        { status: 200 },
      );
    }

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);
    const roleParam = normalizeText(searchParams.get("role"));
    const statusParam = normalizeText(searchParams.get("status"));
    const searchParam = normalizeText(searchParams.get("search"));

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10;
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      role: { [Op.ne]: "user" },
    };

    if (ALLOWED_ROLES.has(roleParam)) {
      whereClause.role = roleParam;
    }

    if (ALLOWED_STATUS.has(statusParam)) {
      whereClause.status = statusParam;
    }

    if (searchParam) {
      whereClause.email = { [Op.like]: `%${searchParam}%` };
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: ["id", "email", "role", "status", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "User role list fetched successfully",
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
      { message: "Failed to fetch user role list" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = normalizeText(body?.email).toLowerCase();
    const password = String(body?.password ?? "");
    const role = normalizeText(body?.role);
    const status = normalizeText(body?.status) || "not_block";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (!role || !ALLOWED_ROLES.has(role)) {
      return NextResponse.json(
        { message: "Invalid role value" },
        { status: 400 },
      );
    }

    if (!ALLOWED_STATUS.has(status)) {
      return NextResponse.json(
        { message: "Status must be 'block' or 'not_block'" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 409 },
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      status,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        data: {
          id: user.get("id"),
          email: user.get("email"),
          role: user.get("role"),
          status: user.get("status"),
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const userId = parseUserId(request, body);
    const email = normalizeText(body?.email).toLowerCase();
    const role = normalizeText(body?.role);
    const status = normalizeText(body?.status);
    const password = String(body?.password ?? "");

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { message: "Valid user id is required" },
        { status: 400 },
      );
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!email && !role && !status && !password) {
      return NextResponse.json(
        { message: "At least one field is required to update" },
        { status: 400 },
      );
    }

    if (email) {
      if (!isValidEmail(email)) {
        return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && Number(existingUser.get("id")) !== userId) {
        return NextResponse.json(
          { message: "Email is already in use" },
          { status: 409 },
        );
      }
      user.set("email", email);
    }

    if (role) {
      if (!ALLOWED_ROLES.has(role)) {
        return NextResponse.json(
          { message: "Invalid role value" },
          { status: 400 },
        );
      }
      user.set("role", role);
    }

    if (status) {
      if (!ALLOWED_STATUS.has(status)) {
        return NextResponse.json(
          { message: "Status must be 'block' or 'not_block'" },
          { status: 400 },
        );
      }
      user.set("status", status);
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { message: "Password must be at least 6 characters" },
          { status: 400 },
        );
      }
      const hashedPassword = await hash(password, 10);
      user.set("password", hashedPassword);
    }

    await user.save();

    return NextResponse.json(
      {
        message: "User updated successfully",
        data: {
          id: user.get("id"),
          email: user.get("email"),
          role: user.get("role"),
          status: user.get("status"),
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
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

    const userId = parseUserId(request, body);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { message: "Valid user id is required" },
        { status: 400 },
      );
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await user.destroy();

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}
