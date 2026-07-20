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
  const [name, setName] = useState(profile.name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [state, setState] = useState(profile.state ?? "");
  const router = useRouter();
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
    <SectionCard
      title="Informações da Conta"
      description="Gerencie seus dados cadastrais da Uranova."
    >
      <div className="space-y-6">

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

        <ReadOnlyField
          label="Email"
          value={email}
        />

        <ReadOnlyField
          label="Plano"
          value={profile.is_pro ? "PRO" : "FREE"}
        />

        <ReadOnlyField
          label="Cadastro"
          value={new Date(profile.created_at).toLocaleDateString(
            "pt-BR"
          )}
        />

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="
              w-full
              md:w-auto
              px-8
              py-3
              rounded-xl
              bg-green-500
              hover:bg-green-600
              disabled:opacity-50
              text-black
              font-bold
              transition
            "
        >
            {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
       </div>

      </div>
    </SectionCard>
  );
}

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
      <label className="block mb-2 text-sm text-zinc-400">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900
          px-4
          py-3
          text-white
          outline-none
          transition
          focus:border-green-500
        "
      />
    </div>
  );
}

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
      <label className="block mb-2 text-sm text-zinc-400">
        {label}
      </label>

      <div
        className="
          w-full
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