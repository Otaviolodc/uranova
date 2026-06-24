"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProfilePage() {

  useEffect(() => {

    async function test() {

      const session =
        await supabase.auth.getSession();

      console.log(
        "GET SESSION:",
        session
      );

      const user =
        await supabase.auth.getUser();

      console.log(
        "GET USER:",
        user
      );

    }

    test();

  }, []);

  return (
    <div className="p-8 text-white">
      TESTE PROFILE
    </div>
  );
}