"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function CouponsPage() {

  type Coupon = {
  id: string;
  code: string;
  discount: number;
  active: boolean;
};

const [coupons, setCoupons] =
  useState<Coupon[]>([]);

  const [code, setCode] =
    useState("");

  const [discount, setDiscount] =
    useState("");

  async function fetchCoupons() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const {
      data,
      error,
    } = await supabase
      .from("coupons")
      .select(`
       id,
       code,
       discount,
       active
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {

  console.error(error);

  return;

}
    setCoupons(data || []);
  }

  async function deleteCoupon(id: string) {

  const confirmDelete = window.confirm(
    "Tem certeza que deseja excluir este cupom?\n\nEssa ação não poderá ser desfeita."
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  fetchCoupons();
}

  async function createCoupon() {

    if (!code || !discount) {

  return;

}

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } =
  await supabase
    .from("coupons")
    .insert([
      {
        user_id: user.id,
        code,
        discount: Number(discount),
      },
    ]);

if (error) {

  console.error(error);

  return;

}

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

              <th className="p-4 text-center">
                Ações
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
                  className={`
                    inline-flex
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-bold

                    ${
                      coupon.active
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }
                  `}
                > 
                  {coupon.active ? "Ativo" : "Inativo"}
                </span>

              </td>

              <td className="p-4 text-center">

                <button
                  onClick={() => deleteCoupon(coupon.id)}
                  title="Excluir cupom"
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-red-500/10
                    text-red-400
                    hover:bg-red-500
                    hover:text-white
                    transition
                    text-lg
                  "
                >
                  🗑️
                </button>

              </td>

            </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}