"use client";

import { useState } from "react";

import type { Profile } from "@/types/profile";

export function useProfile(initialProfile: Profile) {
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] =
    useState<Profile>(initialProfile);

  function updateField<K extends keyof Profile>(
    field: K,
    value: Profile[K]
  ) {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return {
    profile,

    loading,
    setLoading,

    setProfile,

    updateField,
  };
}