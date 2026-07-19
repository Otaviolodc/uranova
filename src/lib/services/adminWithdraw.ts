import { admin } from "@/lib/supabase/admin";

export async function getWithdrawRequests() {
  // Busca os saques
  const { data: withdraws, error } = await admin
    .from("withdraw_requests")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  // Não há saques
  if (!withdraws || withdraws.length === 0) {
    return [];
  }

  // Obtém todos os user_id únicos
  const userIds = [...new Set(withdraws.map((w) => w.user_id))];

  // Busca os perfis desses usuários
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, name, username, avatar_url")
    .in("id", userIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  // Junta saque + perfil
  return withdraws.map((withdraw) => ({
    ...withdraw,
    profile:
      profiles?.find((p) => p.id === withdraw.user_id) ?? null,
  }));
}