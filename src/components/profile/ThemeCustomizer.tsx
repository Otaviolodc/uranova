"use client";

import { supabase }
from "@/lib/supabase/client";
import { useState } from "react";

interface ThemeProfile {
  background_style?: string;
  card_style?: string;
  button_style?: string;
}

interface ThemeCustomizerProps {
  profile: ThemeProfile | null;
  reloadProfile: () => Promise<void>;
}

export default function ThemeCustomizer({
  profile,
  reloadProfile,
}: ThemeCustomizerProps) {

  const [loading, setLoading] =
    useState(false);

  type ThemeField =
  | "background_style"
  | "card_style"
  | "button_style";

async function updateTheme(
  field: ThemeField,
  value: string
) {

    try {

  setLoading(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } =
    await supabase
      .from("profiles")
      .update({
        [field]: value,
      })
      .eq("id", user.id);

  if (error) {

    console.log(error);

    return;

  }

  await reloadProfile();

} catch (error) {

  console.error(error);

} finally {

  setLoading(false);

}

}

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">

      {/* HEADER */}
      <div>

        <h2 className="text-2xl font-bold text-white">
          Theme Customizer
        </h2>

        <p className="text-zinc-400 text-sm mt-1">
          Personalize sua página pública.
        </p>

      </div>

      {/* BACKGROUND */}
      <div className="space-y-3">

        <label className="text-sm text-zinc-400">
          Background
        </label>

        <div className="grid grid-cols-3 gap-3">

          <button
            onClick={() =>
              updateTheme(
                "background_style",
                "gradient"
              )
            }
            className={`
              h-20
              rounded-2xl
              bg-gradient-to-br
              from-purple-500
              to-blue-500
              transition
              hover:scale-105
              ${
                profile?.background_style ===
                "gradient"
                  ? "ring-4 ring-white"
                  : ""
              }
            `}
          />

          <button
            onClick={() =>
              updateTheme(
                "background_style",
                "dark"
              )
            }
            className={`
              h-20
              rounded-2xl
              bg-black
              border
              border-white/10
              transition
              hover:scale-105
              ${
                profile?.background_style ===
                "dark"
                  ? "ring-4 ring-white"
                  : ""
              }
            `}
          />

          <button
            onClick={() =>
              updateTheme(
                "background_style",
                "neon"
              )
            }
            className={`
              h-20
              rounded-2xl
              bg-gradient-to-br
              from-green-400
              to-cyan-500
              transition
              hover:scale-105
              ${
                profile?.background_style ===
                "neon"
                  ? "ring-4 ring-white"
                  : ""
              }
            `}
          />

        </div>

      </div>

      {/* CARD STYLE */}
      <div className="space-y-3">

        <label className="text-sm text-zinc-400">
          Cards
        </label>

        <div className="grid grid-cols-2 gap-3">

          <button
            onClick={() =>
              updateTheme(
                "card_style",
                "glass"
              )
            }
            className={`
              h-16
              rounded-2xl
              bg-white/10
              backdrop-blur-xl
              border
              text-white
              transition
              hover:scale-[1.02]
              ${
                profile?.card_style ===
                "glass"
                  ? "border-white"
                  : "border-white/20"
              }
            `}
          >
            Glass
          </button>

          <button
            onClick={() =>
              updateTheme(
                "card_style",
                "solid"
              )
            }
            className={`
              h-16
              rounded-2xl
              bg-zinc-900
              border
              text-white
              transition
              hover:scale-[1.02]
              ${
                profile?.card_style ===
                "solid"
                  ? "border-white"
                  : "border-zinc-700"
              }
            `}
          >
            Solid
          </button>

        </div>

      </div>

      {/* BUTTON STYLE */}
      <div className="space-y-3">

        <label className="text-sm text-zinc-400">
          Botões
        </label>

        <div className="grid grid-cols-2 gap-3">

          <button
            onClick={() =>
              updateTheme(
                "button_style",
                "rounded"
              )
            }
            className={`
              h-14
              text-black
              font-bold
              transition
              hover:scale-[1.02]
              ${
                profile?.button_style ===
                "rounded"
                  ? "rounded-2xl bg-green-500"
                  : "rounded-2xl bg-zinc-700 text-white"
              }
            `}
          >
            Rounded
          </button>

          <button
            onClick={() =>
              updateTheme(
                "button_style",
                "square"
              )
            }
            className={`
              h-14
              font-bold
              transition
              hover:scale-[1.02]
              ${
                profile?.button_style ===
                "square"
                  ? "rounded-md bg-blue-500 text-white"
                  : "rounded-md bg-zinc-700 text-white"
              }
            `}
          >
            Square
          </button>

        </div>

      </div>

      {/* LOADING */}
      {loading && (

        <div className="text-sm text-zinc-500">
          Salvando tema...
        </div>

      )}

    </div>

  );

}