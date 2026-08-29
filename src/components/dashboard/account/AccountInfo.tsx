"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import SectionCard from "@/components/dashboard/shared/SectionCard";
import type { Profile } from "@/types/profile";

type AccountInfoProps = {
  profile: Profile;
  email: string;
};

export default function AccountInfo({
  profile,
  email,
}: AccountInfoProps) {
  const router = useRouter();

  const [name, setName] = useState(profile.name ?? "");
  const [username, setUsername] = useState(
    profile.username ?? ""
  );
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [state, setState] = useState(profile.state ?? "");

  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      alert("Digite seu nome.");
      return;
    }

    if (!username.trim()) {
      alert("Digite um username.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          username: username.trim(),
          phone: phone.trim(),
          city: city.trim(),
          state: state.trim(),
        })
        .eq("id", profile.id);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Dados atualizados com sucesso!");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ==================================================
          INFORMAÇÕES PESSOAIS
      ================================================== */}

      <SectionCard
        title="Informações pessoais"
        description="Atualize seus dados pessoais."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Nome *"
            value={name}
            onChange={setName}
          />

          <Input
            label="Username *"
            value={username}
            onChange={setUsername}
          />

          <Input
            label="Telefone"
            value={phone}
            onChange={setPhone}
          />
        </div>
      </SectionCard>

      {/* ==================================================
          LOCALIZAÇÃO
      ================================================== */}

      <SectionCard
        title="Localização"
        description="Informações sobre sua localização."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Cidade"
            value={city}
            onChange={setCity}
          />

          <Input
            label="Estado"
            value={state}
            onChange={setState}
          />
        </div>
      </SectionCard>

      {/* ==================================================
          INFORMAÇÕES DA CONTA
      ================================================== */}

      <SectionCard
        title="Informações da conta"
        description="Dados vinculados à sua conta Uranova."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <ReadOnlyField
            label="E-mail"
            value={email}
          />

          <ReadOnlyField
            label="Plano"
            value={profile.is_pro ? "PRO" : "FREE"}
          />

          <ReadOnlyField
            label="Cadastro"
            value={new Date(
              profile.created_at
            ).toLocaleDateString("pt-BR")}
          />
        </div>
      </SectionCard>

      {/* ==================================================
          SALVAR
      ================================================== */}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="
            rounded-xl
            bg-green-500
            px-8
            py-3
            font-bold
            text-black
            transition
            hover:bg-green-400
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}

/* ======================================================
   INPUT
====================================================== */

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function Input({
  label,
  value,
  onChange,
}: InputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-400">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          w-full
          rounded-xl
          border
          border-zinc-800
          bg-zinc-950
          px-4
          py-3
          text-white
          outline-none
          transition
          placeholder:text-zinc-600
          focus:border-green-500
          focus:ring-1
          focus:ring-green-500/20
        "
      />
    </div>
  );
}

/* ======================================================
   READ ONLY
====================================================== */

type ReadOnlyFieldProps = {
  label: string;
  value: string;
};

function ReadOnlyField({
  label,
  value,
}: ReadOnlyFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-400">
        {label}
      </label>

      <div
        className="
          flex
          min-h-[48px]
          items-center
          rounded-xl
          border
          border-zinc-800
          bg-zinc-950
          px-4
          py-3
          text-zinc-300
        "
      >
        {value}
      </div>
    </div>
  );
}