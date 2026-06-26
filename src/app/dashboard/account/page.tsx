import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/services/profile.service";

import AccountHeader from "@/components/dashboard/account/AccountHeader";
import AccountInfo from "@/components/dashboard/account/AccountInfo";
import AccountStats from "@/components/dashboard/account/AccountStats";
import AccountActions from "@/components/dashboard/account/AccountActions";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getProfile(user.id);

  if (!profile) {
    throw new Error("Perfil não encontrado.");
  }

  return (
    <div className="space-y-8 p-8">
      <AccountHeader />

      <AccountInfo
        profile={profile}
        email={user.email ?? "-"}
      />

      <AccountStats
        products={0}
        customers={0}
        sales={0}
        isPro={profile.is_pro}
      />

      <AccountActions />
    </div>
  );
}