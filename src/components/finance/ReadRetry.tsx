"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function ReadRetry() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} className="mt-2 rounded border border-zinc-600 px-3 py-2"
    onClick={() => startTransition(() => router.refresh())}>
    {pending ? "Carregando…" : "Tentar novamente"}
  </button>;
}
