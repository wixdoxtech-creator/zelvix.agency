"use client";

import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/helper";

const Page = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });
      setMessage(response.data?.message ?? "Registration successful");
      router.push("/auth/login");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setMessage(axiosError.response?.data?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 py-10 md:py-16 flex items-center justify-center">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(24,24,27,0.08)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          User Registration
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">
          Create Account
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Register to continue with Zelvix wellness services.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-zinc-800"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-700"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-zinc-800"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-700"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-zinc-800"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-700"
              required
            />
          </div>

          {message ? (
            <p className="text-sm text-zinc-700" aria-live="polite">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-600">
          You have account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-linear-to-b from-[#5C8DB8] to-[#1F2F46] underline-offset-4 hover:underline"
          >
            Login
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Page;
