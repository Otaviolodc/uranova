"use client";

import { useState } from "react";

type StripeConnectButtonProps = {
  accountId: string | null;
  stripeConnected: boolean;
};

export default function StripeConnectButton({
  accountId,
  stripeConnected,
}: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // STATUS DA CONTA
  // ==========================================================

  const isConnected = stripeConnected;

  // ==========================================================
  // CONECTAR / CONTINUAR CONFIGURAÇÃO
  // ==========================================================

  async function handleConnectStripe() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/stripe/connect/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível conectar sua conta Stripe."
        );
      }

      if (!data?.url) {
        throw new Error(
          "Link de conexão da Stripe não foi gerado."
        );
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(
        "Erro ao conectar Stripe:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erro ao conectar sua conta Stripe."
      );

      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            💳 Conta Stripe
          </h2>

          {/* ==================================================
              CONTA CONECTADA
          ================================================== */}

          {isConnected && (
            <>
              <p className="mt-1 text-sm text-emerald-400">
                ✓ Sua conta Stripe está conectada.
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Sua conta está configurada para receber
                suas vendas pela Uranova.
              </p>
            </>
          )}

          {/* ==================================================
              AINDA NÃO CONECTADA
          ================================================== */}

          {!accountId && (
            <p className="mt-1 text-sm text-zinc-400">
              Conecte sua conta Stripe para receber
              suas vendas pela Uranova.
            </p>
          )}
        </div>

        {/* ====================================================
            BOTÃO
        ==================================================== */}

        {!isConnected && (
          <button
            type="button"
            onClick={handleConnectStripe}
            disabled={loading}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Conectando..."
              : accountId
                ? "Continuar configuração"
                : "Conectar minha conta Stripe"}
          </button>
        )}
      </div>

      {/* ======================================================
          ID DA CONTA
      ====================================================== */}

      {isConnected && accountId && (
        <div className="mt-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3">
          <p className="text-xs text-zinc-500">
            Conta conectada
          </p>

          <p className="mt-1 break-all font-mono text-xs text-zinc-400">
            {accountId}
          </p>
        </div>
      )}

      {/* ======================================================
          ERRO
      ====================================================== */}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}