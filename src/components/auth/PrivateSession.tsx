"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { protectPrivateSession } from "@/lib/security/private-session";
import { supabase } from "@/lib/supabase/client";

export default function PrivateSession({ userId, children }: { userId: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const element = root.current!;
    const cleanup = protectPrivateSession(element, userId);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        element.style.display = "none";
        element.inert = true;
        window.location.replace("/auth/login");
      }
    });
    return () => { cleanup(); subscription.unsubscribe(); };
  }, [userId, pathname]);
  return <div ref={root} style={{ display: "none" }} inert>{children}</div>;
}
