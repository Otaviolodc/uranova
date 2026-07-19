"use client";

import { useState } from "react";
import { submitWithdrawRequest } from "@/app/dashboard/finance/actions";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export default function WithdrawModal({
  open,
  onClose,
  userId,
}: WithdrawModalProps) {
  if (!open) return null;

  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState("");
  const [loading, setLoading] = useState(false);

async function handleSubmit() {
  try {
    setLoading(true);

    if (!amount) {
      throw new Error("Informe o valor do saque.");
    }

    if (!pixKeyType) {
      throw new Error("Selecione o tipo da chave PIX.");
    }

    if (!pixKey.trim()) {
      throw new Error("Informe a chave PIX.");
    }

    await submitWithdrawRequest({
      amount: Number(amount),
      pixKey,
      pixKeyType,
    });

    alert("Solicitação enviada com sucesso!");

    setAmount("");
    setPixKey("");
    setPixKeyType("");

    onClose();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-2xl font-bold text-white">
          Solicitar saque
        </h2>

        <p className="text-zinc-400 mt-2">
          Informe os dados para solicitar seu saque.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Valor
            </label>

            <input
              type="number"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Tipo da chave PIX
            </label>

            <select
              value={pixKeyType}
              onChange={(e) => setPixKeyType(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-green-500"
            >
              <option value="">
                Selecione
              </option>

              <option value="cpf">
                CPF
              </option>

              <option value="cnpj">
                CNPJ
              </option>

              <option value="email">
                E-mail
              </option>

              <option value="phone">
                Celular
              </option>

              <option value="random">
                Chave Aleatória
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Chave PIX
            </label>

            <input
              type="text"
              placeholder="Digite sua chave PIX"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-green-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 px-5 py-3 text-white hover:bg-zinc-800"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-500 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Solicitar saque"}
          </button>
        </div>
      </div>
    </div>
  );
}