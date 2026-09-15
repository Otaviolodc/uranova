"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function PayoutForm() {
  const router = useRouter();
  const key = useRef<string | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(payout: boolean) {
    setBusy(true); setMessage("");
    try {
      if (payout && !key.current) { key.current = crypto.randomUUID(); setSubmitted(true); }
      const response = await fetch(payout ? "/api/finance/payout" : "/api/finance/sync", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: payout ? JSON.stringify({ amount, requestKey: key.current }) : undefined,
      });
      const data = await response.json();
      setMessage(data.error ?? (payout ? "Solicitação registrada. Acompanhe o histórico." : "Conciliação atualizada."));
      router.refresh();
    } catch { setMessage("Resposta não confirmada. Reenvie a mesma solicitação para consultar seu resultado."); }
    finally { setBusy(false); }
  }
  return <section className="space-y-4 rounded-xl border border-zinc-800 p-6">
    <h2 className="text-xl font-bold">Saques</h2>
    <p className="text-zinc-400">A Stripe administra os depósitos bancários. Solicitações aqui exigem calendário manual e saldo conciliado. Contas com depósitos automáticos seguem o calendário Stripe.</p>
    <button disabled={busy} onClick={() => submit(false)} className="rounded-lg bg-zinc-800 px-4 py-2">Atualizar conciliação</button>
    <form onSubmit={(e) => { e.preventDefault(); void submit(true); }} className="flex flex-wrap gap-3">
      <label>Valor em reais <input required inputMode="decimal" value={amount} disabled={busy || submitted}
        onChange={(e) => setAmount(e.target.value)} className="ml-2 rounded bg-zinc-800 p-2" placeholder="100,00" /></label>
      <button disabled={busy} className="rounded-lg bg-green-700 px-4 py-2">{busy ? "Aguarde…" : "Solicitar / consultar saque"}</button>
    </form>
    <p role="status">{message}</p>
    <p className="text-xs text-zinc-500">Uma solicitação por vez. Após a conclusão, recarregue a página para iniciar outra.</p>
  </section>;
}
