"use client";
export default function DashboardError({ reset }: { reset: () => void }) {
  return <section role="alert" className="p-6 space-y-4">
    <h1 className="text-2xl font-bold">Não foi possível carregar esta página</h1>
    <p>Os dados não estão disponíveis no momento. Tente novamente.</p>
    <button onClick={reset} className="rounded-xl bg-green-600 px-5 py-3">Tentar novamente</button>
  </section>;
}
