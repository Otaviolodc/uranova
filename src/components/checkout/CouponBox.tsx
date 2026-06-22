"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface CouponBoxProps {
  price: number;
}

export default function CouponBox({
  price,
}: CouponBoxProps) {

  const [coupon, setCoupon] =
    useState("");

  const [discount, setDiscount] =
    useState(0);

  const [finalPrice, setFinalPrice] =
    useState(price);

  const [message, setMessage] =
    useState<string>("");

  async function applyCoupon() {

    if (!coupon.trim()) {

  setMessage("Digite um cupom");

  return;

}

    type Coupon = {
      discount: number;
    };

    const {
      data,
      error,
    }: {
      data: Coupon | null;
      error: any;
    } = await supabase
      .from("coupons")
      .select("discount")
      .eq("code", coupon.toUpperCase())
      .eq("active", true)
      .maybeSingle();

    if (error) {

  console.error(error);

  setMessage(
    "Erro ao validar cupom"
  );

  return;

}

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
            setCoupon(
              e.target.value.toUpperCase()
            )
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
          disabled={!coupon.trim()}
          className="
            bg-green-500
            text-black
            px-6
            rounded-2xl
            font-bold
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          Aplicar
        </button>

      </div>

      {message && (

        <p
          className={`
            mt-3
            text-sm
            ${
              message.includes("✅")
                ? "text-green-400"
                : "text-red-400"
            }
          `}
        >
          {message}
        </p>

      )}

      {discount > 0 && (

        <div className="mt-6">

          <p className="text-zinc-500 line-through">
            R$ {price.toFixed(2)}
          </p>

          <p className="text-4xl font-black text-green-400">
            R$ {finalPrice.toFixed(2)}
          </p>

        </div>

      )}

    </div>

  );
}