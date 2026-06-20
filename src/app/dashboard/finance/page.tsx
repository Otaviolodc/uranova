export default function FinancePage() {
  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-4xl font-bold text-white">
          Financeiro
        </h1>

        <p className="text-zinc-400 mt-2">
          Resumo financeiro da sua operação
        </p>

      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <p className="text-zinc-400">
            Receita Total
          </p>

          <h2 className="text-4xl font-black text-green-400 mt-3">
            R$ 0,00
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <p className="text-zinc-400">
            Vendas
          </p>

          <h2 className="text-4xl font-black text-white mt-3">
            0
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <p className="text-zinc-400">
            Ticket Médio
          </p>

          <h2 className="text-4xl font-black text-blue-400 mt-3">
            R$ 0,00
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <p className="text-zinc-400">
            Hoje
          </p>

          <h2 className="text-4xl font-black text-yellow-400 mt-3">
            R$ 0,00
          </h2>
        </div>

      </div>

      {/* HISTÓRICO */}
      <div className="mt-10">

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

          <div className="p-6 border-b border-zinc-800">

            <h2 className="text-2xl font-bold text-white">
              Histórico Financeiro
            </h2>

          </div>

          <table className="w-full">

            <thead className="border-b border-zinc-800 text-zinc-400">

              <tr>

                <th className="p-5 text-left">
                  Produto
                </th>

                <th className="p-5 text-left">
                  Cliente
                </th>

                <th className="p-5 text-left">
                  Valor
                </th>

                <th className="p-5 text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td className="p-5">
                  Nenhuma venda
                </td>

                <td className="p-5">
                  -
                </td>

                <td className="p-5">
                  -
                </td>

                <td className="p-5 text-yellow-400">
                  Vazio
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}