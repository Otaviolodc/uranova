"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProfilePage() {

  useEffect(() => {

    const timer = setTimeout(async () => {

      const session =
        await supabase.auth.getSession();

      console.log(
        "GET SESSION DELAY:",
        session
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log(
        "GET USER DELAY:",
        user
      );

    }, 3000);

    return () => clearTimeout(timer);

  }, []);

  return (
    <div className="p-8 text-white">
      TESTE PROFILE DELAY
    </div>
  );
}