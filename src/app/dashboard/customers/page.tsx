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

type Customer = {
  name: string;
  email: string;
  purchases: number;
  total: number;
  lastPurchase: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCustomers() {
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
      .eq("status", "PAID")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Customers:", error);
      setLoading(false);
      return;
    }

    const orders = (data as Order[]) || [];

    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      const email =
        order.customer_email?.trim().toLowerCase() ||
        "sem-email";

      const name =
        order.customer_name?.trim() ||
        "Cliente";

      const existing = customerMap.get(email);

      if (existing) {
        existing.purchases += 1;
        existing.total += Number(order.amount);
      } else {
        customerMap.set(email, {
          name,
          email:
            order.customer_email?.trim() ||
            "E-mail não informado",
          purchases: 1,
          total: Number(order.amount),
          lastPurchase: order.created_at,
        });
      }
    });

    setCustomers(Array.from(customerMap.values()));
    setLoading(false);
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const totalCustomers = customers.length;

  const totalRevenue = customers.reduce(
    (total, customer) => total + customer.total,
    0
  );

  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-3xl font-bold text-white">
          Clientes
        </h1>

        <p className="text-zinc-400 mt-2">
          Gerencie os clientes que compraram seus produtos.
        </p>

      </div>

      {/* RESUMO */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">

        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-7
          "
        >
          <p className="text-zinc-400">
            Clientes
          </p>

          <h2 className="text-4xl font-black text-white mt-3">
            {totalCustomers}
          </h2>

          <p className="text-zinc-500 mt-2">
            Compradores cadastrados através das vendas
          </p>
        </div>

        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-7
          "
        >
          <p className="text-zinc-400">
            Total comprado
          </p>

          <h2 className="text-4xl font-black text-green-400 mt-3">
            R$ {totalRevenue.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </h2>

          <p className="text-zinc-500 mt-2">
            Valor gerado pelos clientes
          </p>
        </div>

      </div>

      {/* CLIENTES */}
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
            Seus Clientes
          </h2>

          <p className="text-zinc-500 mt-1">
            Clientes com pelo menos uma compra aprovada.
          </p>

        </div>

        {loading ? (

          <div className="p-10 text-center text-zinc-500">
            Carregando clientes...
          </div>

        ) : customers.length === 0 ? (

          <div className="p-12 text-center">

            <div className="text-5xl mb-4">
              👥
            </div>

            <h3 className="text-xl font-bold text-white">
              Nenhum cliente ainda
            </h3>

            <p className="text-zinc-500 mt-2">
              Quando uma venda for aprovada, o comprador aparecerá aqui.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-950 border-b border-zinc-800">

                <tr>

                  <th className="p-5 text-left text-zinc-400 text-sm">
                    Cliente
                  </th>

                  <th className="p-5 text-left text-zinc-400 text-sm">
                    E-mail
                  </th>

                  <th className="p-5 text-left text-zinc-400 text-sm">
                    Compras
                  </th>

                  <th className="p-5 text-left text-zinc-400 text-sm">
                    Total
                  </th>

                  <th className="p-5 text-left text-zinc-400 text-sm">
                    Última compra
                  </th>

                  <th className="p-5 text-left text-zinc-400 text-sm">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {customers.map((customer) => (

                  <tr
                    key={customer.email}
                    className="
                      border-b
                      border-zinc-800
                      hover:bg-zinc-950
                      transition
                    "
                  >

                    <td className="p-5">

                      <div className="font-semibold text-white">
                        {customer.name}
                      </div>

                    </td>

                    <td className="p-5 text-zinc-400">
                      {customer.email}
                    </td>

                    <td className="p-5 text-white font-semibold">
                      {customer.purchases}
                    </td>

                    <td className="p-5 text-green-400 font-bold">
                      R$ {customer.total.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="p-5 text-zinc-400">

                      {new Date(
                        customer.lastPurchase
                      ).toLocaleDateString("pt-BR")}

                    </td>

                    <td className="p-5">

                      <span
                        className="
                          text-green-400
                          font-bold
                          text-sm
                        "
                      >
                        ATIVO
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}