"use client";
import { useRef, useState } from "react";

export default function CertificateDownload({ productId }: { productId: string }) {
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    if (busy.current) return;
    busy.current = true; setLoading(true); setError("");
    try {
      const response = await fetch(`/api/course/certificate?productId=${encodeURIComponent(productId)}`);
      if (!response.ok) {
        const body = await response.json();
        throw new Error(typeof body.error === "string" ? body.error : "Não foi possível gerar o certificado.");
      }
      if (!response.headers.get("content-type")?.includes("application/pdf")) throw new Error("Resposta inválida ao baixar certificado.");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = "certificado-uranova.pdf";
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha no download. Tente novamente."); }
    finally { busy.current = false; setLoading(false); }
  }
  return <div className="mt-8"><button onClick={download} disabled={loading} className="w-full rounded-xl bg-blue-600 py-4 disabled:opacity-50">{loading ? "Gerando certificado..." : "Baixar certificado"}</button>{error && <p role="alert" className="mt-4">{error}</p>}</div>;
}
