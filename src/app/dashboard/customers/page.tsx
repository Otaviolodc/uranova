export default function CustomersPage() {
  return (
    <div className="p-8">

      <h1 className="text-4xl font-bold mb-8">
        Clientes
      </h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

        <table className="w-full">

          <thead className="border-b border-zinc-800">

            <tr className="text-zinc-400">

              <th className="p-5 text-left">
                Cliente
              </th>

              <th className="p-5 text-left">
                Email
              </th>

              <th className="p-5 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td className="p-5">
                Nenhum cliente
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
  );
}