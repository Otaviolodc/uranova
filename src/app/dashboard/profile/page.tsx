"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProfilePage() {
  useEffect(() => {
    async function test() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("PROFILE SESSION:", session);
    }

    test();
  }, []);

  return (
    <div className="p-10 text-white">
      TESTE PROFILE CLIENT
    </div>
  );
}