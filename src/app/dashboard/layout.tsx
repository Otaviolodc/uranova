import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUserBalance } from "@/lib/services/balance";

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

  const balance = await getUserBalance(user.id);

  return (
    <div className="flex bg-black min-h-screen">
      <Sidebar
        userId={user.id}
        totalEarned={balance?.total_earned ?? 0}
      />

      <div className="flex flex-col flex-1 min-h-screen">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <SupportButton />
    </div>
  );
}