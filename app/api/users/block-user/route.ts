import User from "@/model/user";
import { NextResponse } from "next/server";

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
        status: "block",
      },
      attributes: ["id", "email", "role", "status", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return NextResponse.json(
      {
        message: "Blocked customer list fetched successfully",
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
      { message: "Failed to fetch blocked customer list" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const userId = Number(body?.userId);
    const status = String(body?.status ?? "");

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { message: "Valid userId is required" },
        { status: 400 },
      );
    }

    if (status !== "block" && status !== "not_block") {
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

    user.set("status", status);
    await user.save();

    return NextResponse.json(
      {
        message: "Customer status updated successfully",
        data: {
          id: user.get("id"),
          email: user.get("email"),
          status: user.get("status"),
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to update customer status" },
      { status: 500 },
    );
  }
}
