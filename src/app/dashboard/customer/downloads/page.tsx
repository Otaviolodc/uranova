import Link from "next/link";
export default function DownloadsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-black">
        ⬇️ Downloads
      </h1>

      <p className="text-zinc-400">
        Os downloads estão nos detalhes de cada produto da sua biblioteca e dependem de acesso válido.
      </p>
      <Link className="inline-block rounded-xl bg-green-600 px-5 py-3" href="/dashboard/customer/products">Abrir biblioteca de produtos</Link>
    </div>
  );
}
