"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  TriangleAlert,
  Trash2,
} from "lucide-react";

export default function DeleteAccountPage() {

  const [confirmed, setConfirmed] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-8">

      {/* Cabeçalho */}
      <div>
        <Link
          href="/dashboard/account"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar para Conta
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="rounded-xl bg-red-500/15 p-3">
            <Trash2 className="text-red-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              Excluir Conta
            </h1>

            <p className="mt-1 text-zinc-400">
              Esta ação removerá permanentemente sua conta da Uranova.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">

  <div className="flex items-center gap-3">

    <TriangleAlert className="text-red-400" />

    <div>

      <h2 className="font-bold text-white">
        Zona de Perigo
      </h2>

      <p className="mt-1 text-sm text-zinc-300">
        Depois que sua conta for excluída,
        não será possível recuperá-la.

        Faça backup dos seus produtos antes de continuar.
      </p>

    </div>

  </div>

</div>

      {/* Card */}
      <div className="rounded-2xl border border-red-500/20 bg-zinc-900 p-8">

        <div className="mb-8 flex items-center gap-3">
          <TriangleAlert className="text-red-400" />

          <div>
            <h2 className="text-xl font-semibold text-white">
              Atenção
            </h2>

            <p className="text-sm text-zinc-400">
              Antes de excluir sua conta, leia atentamente as informações abaixo.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">

          <div className="flex gap-3">
            <span className="text-red-400 font-bold">•</span>

            <p className="text-zinc-300">
              Todos os seus produtos serão removidos permanentemente.
            </p>
          </div>

          <div className="flex gap-3">
            <span className="text-red-400 font-bold">•</span>

            <p className="text-zinc-300">
              Seus links públicos deixarão de funcionar.
            </p>
          </div>

          <div className="flex gap-3">
            <span className="text-red-400 font-bold">•</span>

            <p className="text-zinc-300">
              Seus checkouts e páginas de vendas serão excluídos.
            </p>
          </div>

          <div className="flex gap-3">
            <span className="text-red-400 font-bold">•</span>

            <p className="text-zinc-300">
              Seus clientes e pedidos não poderão ser recuperados.
            </p>
          </div>

          <div className="flex gap-3">
            <span className="text-red-400 font-bold">•</span>

            <p className="text-zinc-300">
              Esta ação é permanente e não poderá ser desfeita.
            </p>
          </div>

        </div>

        {/* Confirmação */}
        <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 p-5">

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) =>
                setConfirmed(e.target.checked)
              }
              className="h-5 w-5 accent-red-500"
            />

            <span className="text-sm text-zinc-300">
              Entendo que esta ação é permanente e desejo excluir minha conta.
            </span>

          </label>

        </div>

        <div className="mt-6">

  <label className="mb-2 block text-sm font-medium text-zinc-300">

    Digite

    <span className="ml-2 font-bold text-red-400">
      EXCLUIR
    </span>

    para confirmar

  </label>

  <input
    value={confirmationText}
    onChange={(e) =>
      setConfirmationText(e.target.value)
    }
    placeholder="EXCLUIR"
    className="
      w-full
      rounded-xl
      border
      border-zinc-700
      bg-zinc-950
      px-4
      py-3
      text-white
      outline-none
      transition
      focus:border-red-500
    "
  />

</div>

        {/* Botão */}
        <button
          type="button"
          disabled={
            !confirmed ||
            confirmationText.trim().toUpperCase() !== "EXCLUIR"
          }
          onClick={() => setShowModal(true)}
          className={`
            mt-8
            w-full
            rounded-xl
            py-3
            font-semibold
            transition

            ${
              confirmed &&
              confirmationText.trim().toUpperCase() === "EXCLUIR"
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }
          `}
        >
          Excluir Minha Conta
        </button>

      </div>

      {showModal && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">

  <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-zinc-900 p-8">

    <div className="flex items-center gap-3">

      <TriangleAlert
        size={28}
        className="text-red-400"
      />

      <div>

        <h2 className="text-xl font-bold text-white">
          Excluir Conta Permanentemente
        </h2>

        <p className="text-sm text-zinc-400">
          Esta ação é permanente.
        </p>

      </div>

    </div>

    <div className="mt-6 space-y-3 text-zinc-300">

      <p>
        Sua conta será removida permanentemente.
      </p>

      <p>
        Todos os produtos,
        links,
        assinaturas
        e dados da Uranova
        serão apagados.
      </p>

      <p className="font-semibold text-red-400">
        Esta ação não poderá ser desfeita.
      </p>

    </div>

    <div className="mt-8 flex gap-3">

      <button
        onClick={() => setShowModal(false)}
        className="flex-1 rounded-xl border border-zinc-700 py-3 text-white transition hover:border-zinc-500"
      >
        Cancelar
      </button>

      <button
        onClick={async () => {

          const response = await fetch("/api/account/delete", {
            method: "POST",
          });

          const result = await response.json();

          if (!response.ok) {
            alert(result.error ?? "Erro inesperado.");
            return;
          }

          alert(result.message);

          setShowModal(false);

      }}
        className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500"
      >
        Excluir definitivamente
      </button>

    </div>

  </div>

</div>

)}

    </div>
  );
}