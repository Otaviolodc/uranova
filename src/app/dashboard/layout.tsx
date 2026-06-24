import { ReactNode } from "react";
import { redirect } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex bg-black min-h-screen">

      <Sidebar />

      <div className="flex flex-col flex-1 min-h-screen">

        <Topbar />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}