import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      {
        success: false,
        message: "Usuário não autenticado.",
      },
      { status: 401 }
    );
  }

  try {
    const { data: profile, error: profileReadError } = await admin.from("profiles")
      .select("stripe_account_id").eq("id", user.id).single();
    if (profileReadError) throw profileReadError;
    const checks = await Promise.all([
      admin.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      admin.from("payments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      admin.from("customer_products").select("id", { count: "exact", head: true }).eq("customer_id", user.id),
    ]);
    if (checks.some((r) => r.error)) throw new Error("Falha ao verificar hist?rico financeiro.");
    if (profile.stripe_account_id || checks.some((r) => (r.count ?? 0) > 0)) {
      return Response.json({ error: "Esta conta possui v?nculo financeiro. Solicite o encerramento ao suporte para preservar o hist?rico." }, { status: 409 });
    }
    // Analytics
const { error: analyticsError } = await admin
  .from("analytics")
  .delete()
  .eq("user_id", user.id);

if (analyticsError) throw analyticsError;

// Produtos Checkout
const { error: checkoutError } = await admin
  .from("products_checkout")
  .delete()
  .eq("user_id", user.id);

if (checkoutError) throw checkoutError;

// Cupons
const { error: couponsError } = await admin
  .from("coupons")
  .delete()
  .eq("user_id", user.id);

if (couponsError) throw couponsError;

// Links
const { error: linksError } = await admin
  .from("links")
  .delete()
  .eq("user_id", user.id);

if (linksError) throw linksError;

// Produtos
const { error: productsError } = await admin
  .from("products")
  .delete()
  .eq("user_id", user.id);

if (productsError) throw productsError;

// Assinaturas
const { error: subscriptionsError } = await admin
  .from("subscriptions")
  .delete()
  .eq("user_id", user.id);

if (subscriptionsError) throw subscriptionsError;

// Perfil
const { error: profileError } = await admin
  .from("profiles")
  .delete()
  .eq("id", user.id);

if (profileError) throw profileError;

// Authentication
const { error: authError } =
  await admin.auth.admin.deleteUser(user.id);

if (authError) throw authError;

    return Response.json({
      success: true,
      message: "Dados removidos com sucesso.",
    });

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao excluir dados.",
      },
      {
        status: 500,
      }
    );
  }
}
