import Link from "next/link";
import { admin } from "@/lib/supabase/admin";

export default async function PaymentsPage() {
  const supabase = admin;

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      amount,
      status,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    });

  return (
    <div>

      {/* HEADER */}
      <div
        className="
          flex
          items-center
          justify-between
          mb-8
        "
      >

        <div>

          <h1
            className="
              text-4xl
              font-bold
            "
          >
            Pagamentos
          </h1>

          <p
            className="
              text-zinc-400
              mt-2
            "
          >
            Gerencie todos os pagamentos da plataforma
          </p>

        </div>

        <div
          className="
            bg-zinc-900
            border
            border-zinc-800
            px-4
            py-2
            rounded-xl
          "
        >
          Total: {orders?.length || 0}
        </div>

      </div>

      {/* TABLE */}
      <div
        className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-2xl
          overflow-hidden
        "
      >

        {/* HEADER */}
        <div
          className="
            grid
            grid-cols-5
            gap-4
            p-5
            border-b
            border-zinc-800
            text-zinc-400
            text-sm
            font-medium
          "
        >

          <div>Pedido</div>
          <div>Valor</div>
          <div>Status</div>
          <div>Data</div>
          <div>Ações</div>

        </div>

        {/* ORDERS */}
        {orders?.map((order) => (

          <div
            key={order.id}
            className="
              grid
              grid-cols-5
              gap-4
              p-5
              border-b
              border-zinc-800
              items-center
              hover:bg-zinc-800/40
              transition
            "
          >

            <div className="font-medium">
              #{order.id.slice(0, 8)}
            </div>

            <div>
              R$ {Number(order.amount).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>

            <div>

              <span
                className="
                  text-white
                  text-sm
                  font-semibold
                  whitespace-nowrap
                "
              >
                {order.status === "PAID"
                  ? "APROVADA"
                  : order.status}
              </span>

            </div>

            <div className="text-zinc-400 text-sm">
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString("pt-BR")
                : "-"}
            </div>

            <div className="flex">

              <Link
                href={`/admin/payments/${order.id}`}
                className="
                  bg-blue-500
                  hover:bg-blue-400
                  transition
                  px-3
                  py-2
                  rounded-lg
                  text-sm
                  font-medium
                "
              >
                Visualizar
              </Link>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}