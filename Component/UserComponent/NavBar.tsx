"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Health Categories", url: "health-categories" },
  { name: "About", url: "about" },
  { name: "Consult an Expert", url: "consult-an-expert" },
  { name: "Blogs", url: "blogs" },
];

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);


  return (
    <header className="fixed left-0 right-0 top-0 z-50  bg-[#faf8f5]/95 backdrop-blur">
      <nav className="mx-auto flex h-16 w-[95%] max-w-7xl items-center justify-between md:w-[90%]">
        <Link href="/" className="shrink-0">
          <img
            src="/logo.webp"
            alt="Zelvix logo"
            className="h-11 w-auto object-contain"
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.url}
              href={`/${item.url}`}
              className="text-sm font-medium text-[#2F4A68] transition-colors hover:text-[#1F2F46]"
            >
              {item.name}
            </Link>
          ))}

          {role === "admin" && (
            <Link
              key={`/admin/dashboard`}
              href={`/admin/dashboard`}
              className="text-sm font-medium text-[#2F4A68] transition-colors hover:text-[#1F2F46]"
            >
              Admin
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="tel:+10000000000"
            className="rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-4 py-2 text-sm font-semibold text-[#FFF1EB] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_16px_rgba(31,47,70,0.2)] transition hover:from-[#4B7FA8] hover:to-[#1F2F46]"
          >
            Call Us
          </Link>
          <Link
            href="https://wa.me/10000000000"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#5C8DB8]/70 bg-[#FFF1EB]/75 px-4 py-2 text-sm font-semibold text-[#1F2F46] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_18px_rgba(47,74,104,0.12)] backdrop-blur-sm transition hover:bg-[#FFF1EB]"
          >
            WhatsApp
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md border border-[#5C8DB8]/70 bg-[#FFF1EB]/75 px-3 py-2 text-sm font-semibold text-[#1F2F46] backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          Menu
        </button>
      </nav>

      {isMenuOpen ? (
        <div className="border-t border-[#5C8DB8]/60 bg-[#ACE0F9]/95 px-[5%] py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.url}
                href={`/${item.url}`}
                className="text-sm font-medium text-[#2F4A68] transition-colors hover:text-[#1F2F46]"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="tel:+10000000000"
              className="mt-2 rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-4 py-2 text-center text-sm font-semibold text-[#FFF1EB]"
            >
              Call Us
            </Link>
            <Link
              href="https://wa.me/10000000000"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#5C8DB8]/70 bg-[#FFF1EB] px-4 py-2 text-center text-sm font-semibold text-[#1F2F46]"
            >
              WhatsApp
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default NavBar;
