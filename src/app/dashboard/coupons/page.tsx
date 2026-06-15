"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function CouponsPage() {

  const [coupons, setCoupons] =
    useState<any[]>([]);

  const [code, setCode] =
    useState("");

  const [discount, setDiscount] =
    useState("");

  async function fetchCoupons() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    setCoupons(data || []);
  }

  async function createCoupon() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("coupons")
      .insert([
        {
          user_id: user.id,
          code,
          discount: Number(discount),
        },
      ]);

    setCode("");
    setDiscount("");

    fetchCoupons();
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="p-6 md:p-8">

      <div className="mb-10">

        <h1 className="text-3xl font-bold text-white">
          Cupons
        </h1>

        <p className="text-zinc-400 mt-2">
          Gerencie descontos e promoções
        </p>

      </div>

      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-6
          mb-8
        "
      >

        <div className="grid md:grid-cols-3 gap-4">

          <input
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value.toUpperCase()
              )
            }
            placeholder="Código"
            className="
              bg-zinc-800
              rounded-2xl
              p-4
            "
          />

          <input
            value={discount}
            onChange={(e) =>
              setDiscount(e.target.value)
            }
            placeholder="% desconto"
            className="
              bg-zinc-800
              rounded-2xl
              p-4
            "
          />

          <button
            onClick={createCoupon}
            className="
              bg-green-500
              hover:bg-green-400
              text-black
              rounded-2xl
              font-bold
            "
          >
            Criar Cupom
          </button>

        </div>

      </div>

      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          overflow-hidden
        "
      >

        <table className="w-full">

          <thead>

            <tr className="border-b border-zinc-800">

              <th className="p-4 text-left">
                Código
              </th>

              <th className="p-4 text-left">
                Desconto
              </th>

              <th className="p-4 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {coupons.map((coupon) => (

              <tr
                key={coupon.id}
                className="
                  border-b
                  border-zinc-800
                "
              >

                <td className="p-4">
                  {coupon.code}
                </td>

                <td className="p-4">
                  {coupon.discount}%
                </td>

                <td className="p-4">

                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      bg-green-500/10
                      text-green-400
                      text-xs
                      font-bold
                    "
                  >
                    Ativo
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}