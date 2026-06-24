import { ReactNode } from "react";

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

  console.log(
    "DASHBOARD LAYOUT USER:",
    user?.email
  );

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