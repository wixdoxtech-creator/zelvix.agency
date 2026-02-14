import User from "@/model/user";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const isEmailValid = email;
    if (!isEmailValid) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
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
    const attributes = User.getAttributes();
    const createPayload: Record<string, unknown> = {
      email,
      password: hashedPassword,
      role: "user",
      status: "not_block",
    };

    if (name && attributes.name) {
      createPayload.name = name;
    }

    await User.create(createPayload);

    return NextResponse.json(
      { message: "Registration successful", role: "user" },
      { status: 201 },
    );
  } catch(error) {
    console.log("this is the error",error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
