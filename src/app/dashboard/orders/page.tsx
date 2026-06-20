export default function OrdersPage() {
  return (
    <div className="p-8">

      <h1 className="text-4xl font-bold mb-8">
        Pedidos
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
          <p className="text-zinc-400">
            Pagos
          </p>

          <h2 className="text-5xl font-black text-green-400 mt-3">
            0
          </h2>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
          <p className="text-zinc-400">
            Pendentes
          </p>

          <h2 className="text-5xl font-black text-yellow-400 mt-3">
            0
          </h2>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
          <p className="text-zinc-400">
            Cancelados
          </p>

          <h2 className="text-5xl font-black text-red-400 mt-3">
            0
          </h2>
        </div>

      </div>

    </div>
  );
}