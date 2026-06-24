"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [result, setResult] = useState("Carregando...");

  useEffect(() => {
    async function test() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setResult(
          `USUARIO: ${session.user.email}`
        );
        return;
      }

      setResult("SEM SESSAO");
    }

    test();
  }, []);

  return (
    <div className="p-8 text-white">
      {result}
    </div>
  );
}