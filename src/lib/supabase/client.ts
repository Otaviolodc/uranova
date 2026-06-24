"use client";

import { createBrowserClient } from "@supabase/ssr";

console.log(
  "SUPABASE URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

console.log(
  "SUPABASE KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20)
);

export const supabase =
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );