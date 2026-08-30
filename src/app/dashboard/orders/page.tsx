"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Order = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  amount: number;
  status: string;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        customer_name,
        customer_email,
        amount,
        status,
        created_at
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Orders:", error);
      setLoading(false);
      return;
    }

    setOrders((data as Order[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const paidOrders = orders.filter(
    (order) => order.status === "PAID"
  );

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "PENDING" ||
      order.status === "pending"
  );

  const cancelledOrders = orders.filter(
    (order) =>
      order.status === "CANCELLED" ||
      order.status === "CANCELED" ||
      order.status === "cancelled"
  );

  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Pedidos
        </h1>

        <p className="text-zinc-400 mt-2">
          Acompanhe todas as vendas realizadas na sua operação.
        </p>

      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div
          className="
            bg-zinc-900
            rounded-3xl
            p-7
            border
            border-zinc-800
          "
        >
          <p className="text-zinc-400">
            Aprovados
          </p>

          <h2 className="text-5xl font-black text-green-400 mt-3">
            {paidOrders.length}
          </h2>

          <p className="text-zinc-500 mt-2">
            Vendas confirmadas
          </p>
        </div>

        <div
          className="
            bg-zinc-900
            rounded-3xl
            p-7
            border
            border-zinc-800
          "
        >
          <p className="text-zinc-400">
            Pendentes
          </p>

          <h2 className="text-5xl font-black text-yellow-400 mt-3">
            {pendingOrders.length}
          </h2>

          <p className="text-zinc-500 mt-2">
            Aguardando pagamento
          </p>
        </div>

        <div
          className="
            bg-zinc-900
            rounded-3xl
            p-7
            border
            border-zinc-800
          "
        >
          <p className="text-zinc-400">
            Cancelados
          </p>

          <h2 className="text-5xl font-black text-red-400 mt-3">
            {cancelledOrders.length}
          </h2>

          <p className="text-zinc-500 mt-2">
            Pedidos cancelados
          </p>
        </div>

      </div>

      {/* TABELA */}
      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          overflow-hidden
        "
      >

        <div className="p-6 border-b border-zinc-800">

          <h2 className="text-2xl font-bold text-white">
            Últimos Pedidos
          </h2>

          <p className="text-zinc-500 mt-1">
            Histórico das vendas da sua operação.
          </p>

        </div>

        {loading ? (

          <div className="p-10 text-center text-zinc-500">
            Carregando pedidos...
          </div>

        ) : orders.length === 0 ? (

          <div className="p-12 text-center">

            <div className="text-5xl mb-4">
              📦
            </div>

            <h3 className="text-xl font-bold text-white">
              Nenhum pedido ainda
            </h3>

            <p className="text-zinc-500 mt-2">
              Quando uma venda acontecer, ela aparecerá aqui.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-950 border-b border-zinc-800">

                <tr>

                  <th className="p-5 text-left text-zinc-400 text-sm">
                    Pedido
                  </th>

                  <th className="p-5 text-left text-zinc-400 text-sm">
                    Cliente
                  </th>

                  <th className="p-5 text-left text-zinc-400 text-sm">
                    Valor
                  </th>

                  <th className="p-5 text-left text-zinc-400 text-sm">
                    Status
                  </th>

                  <th className="p-5 text-left text-zinc-400 text-sm">
                    Data
                  </th>

                </tr>

              </thead>

              <tbody>

                {orders.map((order) => {

                  const isPaid =
                    order.status === "PAID";

                  const isPending =
                    order.status === "PENDING" ||
                    order.status === "pending";

                  const isCancelled =
                    order.status === "CANCELLED" ||
                    order.status === "CANCELED" ||
                    order.status === "cancelled";

                  let statusLabel = order.status;
                  let statusClass = "text-zinc-400";

                  if (isPaid) {
                    statusLabel = "APROVADA";
                    statusClass = "text-green-400";
                  }

                  if (isPending) {
                    statusLabel = "PENDENTE";
                    statusClass = "text-yellow-400";
                  }

                  if (isCancelled) {
                    statusLabel = "CANCELADA";
                    statusClass = "text-red-400";
                  }

                  return (
                    <tr
                      key={order.id}
                      className="
                        border-b
                        border-zinc-800
                        hover:bg-zinc-950
                        transition
                      "
                    >

                      <td className="p-5">

                        <span className="font-semibold text-white">
                          #{order.id.slice(0, 8)}
                        </span>

                      </td>

                      <td className="p-5">

                        <div className="font-medium text-white">
                          {order.customer_name || "Cliente"}
                        </div>

                        <div className="text-zinc-500 text-sm mt-1">
                          {order.customer_email || "E-mail não informado"}
                        </div>

                      </td>

                      <td className="p-5 text-green-400 font-bold">

                        R$ {Number(order.amount).toLocaleString(
                          "pt-BR",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}

                      </td>

                      <td className="p-5">

                        <span
                          className={`
                            font-bold
                            text-sm
                            ${statusClass}
                          `}
                        >
                          {statusLabel}
                        </span>

                      </td>

                      <td className="p-5 text-zinc-400">

                        {new Date(
                          order.created_at
                        ).toLocaleDateString("pt-BR")}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}