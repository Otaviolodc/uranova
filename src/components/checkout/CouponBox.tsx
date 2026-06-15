"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Props {
  price: number;
}

export default function CouponBox({
  price,
}: Props) {

  const [coupon, setCoupon] =
    useState("");

  const [discount, setDiscount] =
    useState(0);

  const [finalPrice, setFinalPrice] =
    useState(price);

  const [message, setMessage] =
    useState("");

  async function applyCoupon() {

    const { data } =
      await supabase
        .from("coupons")
        .select("*")
        .eq(
          "code",
          coupon.toUpperCase()
        )
        .eq("active", true)
        .maybeSingle();

    if (!data) {

      setMessage(
        "❌ Cupom inválido"
      );

      return;
    }

    const value =
      price -
      (price * data.discount) / 100;

    setDiscount(data.discount);

    setFinalPrice(value);

    setMessage(
      `✅ Cupom aplicado (${data.discount}% OFF)`
    );
  }

  return (

    <div className="mt-8">

      <div className="flex gap-3">

        <input
          value={coupon}
          onChange={(e) =>
            setCoupon(e.target.value)
          }
          placeholder="Cupom de desconto"
          className="
            flex-1
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            p-4
          "
        />

        <button
          onClick={applyCoupon}
          className="
            bg-green-500
            text-black
            px-6
            rounded-2xl
            font-bold
          "
        >
          Aplicar
        </button>

      </div>

      {message && (

        <p className="mt-3 text-sm">
          {message}
        </p>

      )}

      {discount > 0 && (

        <div className="mt-6">

          <p className="text-zinc-500 line-through">
            R$ {price}
          </p>

          <p className="text-4xl font-black text-green-400">
            R$ {finalPrice.toFixed(2)}
          </p>

        </div>

      )}

    </div>

  );
}