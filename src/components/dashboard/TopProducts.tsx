"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type TopProduct = {
  id: string;
  title: string;
  type: string;
  price: number;
  sales: number;
  revenue: number;
};

export default function TopProducts() {
  const [product, setProduct] = useState<TopProduct | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchTopProduct() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      const user = session.user;

      // ======================================================
      // BUSCA AS VENDAS APROVADAS DO PRODUTOR
      // ======================================================

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          product_id,
          amount,
          status
        `)
        .eq("user_id", user.id)
        .eq("status", "PAID");

      if (ordersError) {
        console.error("TopProducts - Orders:", ordersError);
        setLoading(false);
        return;
      }

      if (!orders || orders.length === 0) {
        setProduct(null);
        setLoading(false);
        return;
      }

      // ======================================================
      // AGRUPA AS VENDAS POR PRODUTO
      // ======================================================

      const productStats: Record<
        string,
        {
          sales: number;
          revenue: number;
        }
      > = {};

      orders.forEach((order) => {
        if (!order.product_id) return;

        if (!productStats[order.product_id]) {
          productStats[order.product_id] = {
            sales: 0,
            revenue: 0,
          };
        }

        productStats[order.product_id].sales += 1;
        productStats[order.product_id].revenue +=
          Number(order.amount) || 0;
      });

      // ======================================================
      // ENCONTRA O PRODUTO COM MAIS VENDAS
      // ======================================================

      const topProductEntry = Object.entries(productStats).sort(
        (a, b) => b[1].sales - a[1].sales
      )[0];

      if (!topProductEntry) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const [productId, stats] = topProductEntry;

      // ======================================================
      // BUSCA OS DADOS DO PRODUTO
      // ======================================================

      const { data: productData, error: productError } =
        await supabase
          .from("products_checkout")
          .select(`
            id,
            title,
            type,
            price
          `)
          .eq("id", productId)
          .eq("user_id", user.id)
          .maybeSingle();

      if (productError) {
        console.error("TopProducts - Product:", productError);
        setLoading(false);
        return;
      }

      if (!productData) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct({
        id: productData.id,
        title: productData.title,
        type: productData.type || "Produto digital",
        price: Number(productData.price) || 0,
        sales: stats.sales,
        revenue: stats.revenue,
      });
    } catch (error) {
      console.error("TopProducts:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTopProduct();
  }, []);

  return (
    <div
      className="
        mt-10
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        overflow-hidden
      "
    >
      {/* HEADER */}
      <div
        className="
          p-6
          border-b
          border-zinc-800
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          🏆 Produto mais vendido
        </h2>

        <p className="text-zinc-400 mt-2">
          Produto com maior número de vendas da sua operação
        </p>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="p-10 text-center text-zinc-500">
          Carregando...
        </div>
      ) : !product ? (
        /* SEM VENDAS */
        <div className="py-16 text-center text-zinc-500">
          Nenhuma venda aprovada encontrada.
        </div>
      ) : (
        /* PRODUTO CAMPEÃO */
        <div className="p-6">
          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-6
              bg-black
              border
              border-zinc-800
              rounded-3xl
              p-6
              hover:border-green-500/30
              transition-all
            "
          >
            {/* PRODUTO */}
            <div className="flex items-center gap-5">
              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-zinc-900
                  border
                  border-zinc-800
                  flex
                  items-center
                  justify-center
                  text-2xl
                "
              >
                🏆
              </div>

              <div>
                <p className="text-green-400 text-sm font-semibold">
                  Produto campeão de vendas
                </p>

                <h3
                  className="
                    text-white
                    font-bold
                    text-xl
                    mt-1
                  "
                >
                  {product.title}
                </h3>

                <p className="text-zinc-400 mt-1">
                  {product.type}
                </p>
              </div>
            </div>

            {/* RESULTADOS */}
            <div
              className="
                flex
                flex-wrap
                md:flex-nowrap
                gap-8
                md:text-right
              "
            >
              <div>
                <p className="text-zinc-500 text-sm">
                  Vendas
                </p>

                <p
                  className="
                    text-white
                    text-2xl
                    font-black
                    mt-1
                  "
                >
                  {product.sales}
                </p>
              </div>

              <div>
                <p className="text-zinc-500 text-sm">
                  Faturamento
                </p>

                <p
                  className="
                    text-green-400
                    text-2xl
                    font-black
                    mt-1
                  "
                >
                  {product.revenue.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}