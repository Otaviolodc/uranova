import { ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import SidebarFinance from "@/components/finance/SidebarFinance";

import SupportButton from "@/components/support/SupportButton";
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
      <Sidebar
        userId={user.id}
        financialSummary={<Suspense fallback={<p role="status">Carregando resumo financeiro…</p>}>
          <SidebarFinance userId={user.id} />
        </Suspense>}
      />

      <div className="dashboard-content flex min-w-0 flex-col flex-1 min-h-screen">
        <Topbar />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      <SupportButton />
    </div>
  );
}
