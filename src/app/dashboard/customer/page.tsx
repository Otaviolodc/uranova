import Link from "next/link";
export default function CustomerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-black">
        Área do Cliente
      </h1>

      <p className="text-zinc-400">
        Bem-vindo à sua área de acesso aos produtos.
      </p>
      <nav aria-label="Área do cliente" className="flex flex-wrap gap-4">
        <Link className="rounded-xl bg-zinc-900 p-4" href="/dashboard/customer/products">Meus produtos</Link>
        <Link className="rounded-xl bg-zinc-900 p-4" href="/dashboard/my-courses">Meus cursos</Link>
        <Link className="rounded-xl bg-zinc-900 p-4" href="/dashboard/customer/downloads">Downloads</Link>
      </nav>
    </div>
  );
}
