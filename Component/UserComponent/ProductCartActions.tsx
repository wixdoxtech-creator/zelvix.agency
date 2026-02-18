"use client";

import { useState } from "react";
import { getCart, setCart } from "@/lib/helper";
import AddToCart from "@/Component/UserComponent/AddToCart";
import Link from "next/link";

type QtyOffer = {
  qty: number;
  price: number;
  label: string;
  label2: string;
};

type CartProduct = {
  name: string;
  image: string;
  prise: number;
  orgPrise: number;
};

type CartItem = CartProduct & {
  qty: number;
};

type ProductCartActionsProps = {
  product: CartProduct;
  qtyOffers?: QtyOffer[];
};

const ProductCartActions = ({
  product,
  qtyOffers = [],
}: ProductCartActionsProps) => {
  const [openCart, setOpenCart] = useState(false);
  const [selectedOfferQty, setSelectedOfferQty] = useState<number | null>(
    qtyOffers[0]?.qty ?? null,
  );
  const selectedOffer =
    selectedOfferQty === null
      ? undefined
      : qtyOffers.find((offer) => offer.qty === selectedOfferQty);
  const currentUnitPrice = selectedOffer?.price ?? product.prise;
  const currentQty = selectedOffer?.qty ?? 1;
  const currentTotalPrice = Number((currentUnitPrice * currentQty).toFixed(2));
  const currentDiscountPercentage =
    product.orgPrise > 0
      ? Math.max(
          0,
          Math.round(
            ((product.orgPrise - currentUnitPrice) / product.orgPrise) * 100,
          ),
        )
      : 0;

  const handleAddToCart = () => {
    const current = getCart<CartItem>();
    const qty = currentQty;
    const totalPrice = currentTotalPrice;
    const existing = current.find((item) => item.name === product.name);

    const next = existing
      ? current.map((item) =>
          item.name === product.name
            ? {
                ...item,
                qty: item.qty + qty,
                prise: Number((item.prise + totalPrice).toFixed(2)),
              }
            : item,
        )
      : [
          ...current,
          {
            ...product,
            qty,
            prise: Number(totalPrice.toFixed(2)),
          },
        ];

    setCart<CartItem>(next);
    setOpenCart(true);
  };

  return (
    <>
      <div className="mt-5 rounded-2xl border border-[#d8e6f2] bg-[#f8fbff] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-3xl font-bold text-[#1F2F46]">
            ₹{currentUnitPrice}
          </p>
          <p className="text-base text-[#5C8DB8] line-through">
            ₹{product.orgPrise}
          </p>
          {currentDiscountPercentage > 0 && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Save {currentDiscountPercentage}%
            </span>
          )}
          {selectedOffer && (
            <span className="rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#1F2F46]">
              {selectedOffer.label2 || selectedOffer.label}
            </span>
          )}
        </div>
        {selectedOffer && (
          <p className="mt-2 text-xs text-[#2F4A68]">
            Pack total ({currentQty} items): ₹{currentTotalPrice}
          </p>
        )}
      </div>

      {qtyOffers.length > 0 && (
        <div className="mt-7">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#4A63A3]">
            Qty Offers
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {qtyOffers.map((offer) => (
              <button
                key={`${offer.qty}-${offer.label}`}
                type="button"
                onClick={() => setSelectedOfferQty(offer.qty)}
                className={`rounded-xl border p-3 text-left transition ${
                  selectedOfferQty === offer.qty
                    ? "border-[#1F2F46] bg-[#EAF2FF] shadow-[0_8px_20px_rgba(31,47,70,0.12)]"
                    : "border-[#CFE4F2] bg-[#F8FBFF] hover:border-[#7b98b7]"
                }`}
              >
                <p className="text-sm font-semibold text-[#1F2F46]">
                  {offer.label}
                </p>
                {offer.label2 && (
                  <p className="mt-1 text-xs font-medium text-[#4A63A3]">
                    {offer.label2}
                  </p>
                )}
                <p className="mt-1 text-xs text-[#2F4A68]">
                  Pack of {offer.qty}
                </p>
                <p className="mt-2 text-lg font-bold text-[#1F2F46]">
                  ₹{offer.price}
                </p>
                {selectedOfferQty === offer.qty && (
                  <p className="mt-1 text-xs font-semibold text-[#1F2F46]">
                    Selected
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 rounded-full border border-[#2F4A68] bg-transparent px-6 py-3 text-sm font-semibold text-[#1F2F46] transition hover:bg-[#EAF2FF] md:flex-none"
        >
          Add to Cart
        </button>
      </div>

      <p className="mt-2 text-xs text-[#2F4A68]">
        {selectedOfferQty === null
          ? "No qty offer selected: Add to Cart will add 1 product."
          : `Qty offer selected: ${
              selectedOffer?.label2 ||
              selectedOffer?.label ||
              `${selectedOfferQty}`
            } (${selectedOfferQty} items).`}
      </p>

      <AddToCart isOpen={openCart} onPress={setOpenCart} />
    </>
  );
};

export default ProductCartActions;
