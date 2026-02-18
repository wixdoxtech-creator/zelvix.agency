"use client";

import { IndianRupee, X } from "lucide-react";
import { deleteCart, getCart, setCart } from "@/lib/helper";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type CartProduct = {
  name: string;
  image: string;
  prise: number;
};

type CartItem = CartProduct & {
  qty: number;
};

type AddToCartProps = {
  isOpen: boolean;
  onPress?: (nextOpen: boolean) => void;
};

const AddToCart = ({ isOpen, onPress }: AddToCartProps) => {
  const [, forceRefresh] = useState(0);
  const mounted = typeof window !== "undefined";
  const items = getCart<CartItem>();

  useEffect(() => {
    if (!mounted || !isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, mounted]);

  const clearCart = () => {
    deleteCart();
    forceRefresh((prev) => prev + 1);
  };

  const removeCartItem = (name: string) => {
    const current = getCart<CartItem>();
    const next = current.filter((item) => item.name !== name);

    if (next.length === 0) {
      deleteCart();
    } else {
      setCart<CartItem>(next);
    }

    forceRefresh((prev) => prev + 1);
  };

  const total = items.reduce((sum, item) => sum + item.prise, 0);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-90 overflow-hidden transition-all duration-300 ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => onPress?.(false)}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-full bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-[85%] lg:w-[40%] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#e3edf6] px-5 py-4">
            <h3 className="text-lg font-bold text-[#1F2F46]">Your Cart</h3>
            <button
              type="button"
              onClick={() => onPress?.(false)}
              className="rounded-full border border-[#d7e5f2] p-2 text-[#2F4A68] hover:bg-[#f1f7fd]"
              aria-label="Close cart"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <p className="text-sm text-[#2F4A68]">Your cart is empty.</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.name}
                    className="rounded-xl border border-[#D9E8F4] bg-[#f9fcff] p-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image || "/homeImage2.webp"}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg border border-[#D9E8F4] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-[#1F2F46]">
                            {item.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.name)}
                            className="rounded-md border border-[#e3c6c6] px-2 py-1 text-[11px] font-semibold text-[#a53b3b] transition hover:bg-[#fff1f1]"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-[#1F2F46]">
                          Qty: {item.qty}
                        </p>
                        <p className="mt-2 flex items-center text-sm font-semibold text-[#1F2F46]">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {item.prise.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[#e3edf6] p-5">
            <p className="mb-3 text-sm text-[#2F4A68]">
              Total:{" "}
              <span className="font-semibold text-[#1F2F46]">
                ₹{total.toFixed(2)}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearCart}
                className="w-1/2 rounded-full border border-[#2F4A68] bg-white px-4 py-3 text-sm font-semibold text-[#1F2F46] transition hover:bg-[#EAF2FF]"
              >
                Remove Cart Data
              </button>
              <Link
                href={"/buynow"}
                className="flex items-center justify-center w-1/2 rounded-full border border-[#2F4A68] bg-linear-to-b from-[#5C8DB8] to-[#1F2F46] px-4 py-3 text-sm font-semibold text-[#FFF1EB] shadow-[0_10px_20px_rgba(31,47,70,0.25)] transition hover:opacity-90"
              >
                <button type="button">Buy Now</button>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
};

export default AddToCart;
