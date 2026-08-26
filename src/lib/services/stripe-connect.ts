import { stripe } from "@/lib/stripe";
import { admin } from "@/lib/supabase/admin";

/**
 * ============================================================
 * STRIPE CONNECT — ACCOUNTS V2
 * Uranova Marketplace
 * ============================================================
 *
 * Fluxo:
 *
 * Cliente
 *    ↓
 * Uranova
 *    ↓
 * Conta conectada do produtor
 *
 * A Uranova é a plataforma/marketplace.
 *
 * O produtor possui uma conta conectada Stripe.
 *
 * Accounts v2:
 * - dashboard: express
 * - configuration.merchant
 * - configuration.recipient
 * - merchant.capabilities.card_payments
 * - recipient.capabilities.stripe_balance.stripe_transfers
 *
 * A configuração merchant + card_payments é necessária
 * para solicitar stripe_balance.stripe_transfers no
 * ambiente atual da Stripe.
 */

/**
 * ============================================================
 * CRIA CONTA STRIPE CONNECT V2
 * ============================================================
 *
 * Cria uma conta conectada para o produtor caso ele ainda
 * não possua uma.
 */
export async function createStripeConnectAccount(
  userId: string
) {
  // ==========================================================
  // 1. BUSCA O PERFIL DO PRODUTOR
  // ==========================================================

  const {
    data: profile,
    error: profileError,
  } = await admin
    .from("profiles")
    .select("id, name, stripe_account_id")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error(
      "Perfil do produtor não encontrado."
    );
  }

  // ==========================================================
  // 2. REUTILIZA CONTA EXISTENTE
  // ==========================================================

  if (profile.stripe_account_id) {
    return {
      accountId: profile.stripe_account_id,
      created: false,
    };
  }

  // ==========================================================
  // 3. BUSCA O USUÁRIO NO SUPABASE AUTH
  // ==========================================================

  const {
    data: authUser,
    error: authUserError,
  } =
    await admin.auth.admin.getUserById(userId);

  if (authUserError || !authUser?.user) {
    throw new Error(
      "Não foi possível obter os dados do produtor."
    );
  }

  const email = authUser.user.email;

  if (!email) {
    throw new Error(
      "O produtor precisa possuir um e-mail cadastrado."
    );
  }

  // ==========================================================
  // 4. CRIA A CONTA CONNECT — ACCOUNTS V2
  // ==========================================================
  //
  // A Stripe exige merchant.card_payments para permitir
  // recipient.stripe_balance.stripe_transfers nessa
  // configuração.
  //
  // merchant:
  // Permite que a conta tenha capacidade de pagamentos
  // com cartão.
  //
  // recipient:
  // Permite que a Uranova envie fundos para a conta
  // conectada.
  //

  const account =
    await stripe.v2.core.accounts.create(
      {
        contact_email: email,

        display_name:
          profile.name ||
          email,

        identity: {
          country: "BR",
        },

        dashboard: "express",

        configuration: {
          // ==================================================
          // MERCHANT
          // ==================================================
          //
          // Necessário para solicitar card_payments.
          //
          merchant: {
            capabilities: {
              card_payments: {
                requested: true,
              },
            },
          },

          // ==================================================
          // RECIPIENT
          // ==================================================
          //
          // Permite que a Uranova faça transferências para
          // o saldo Stripe da conta conectada.
          //
          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: {
                  requested: true,
                },
              },
            },
          },
        },

        defaults: {
          currency: "brl",

          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
        },

        include: [
          "configuration.merchant",
          "configuration.recipient",
          "identity",
          "requirements",
        ],
      },

      {
        idempotencyKey:
          `uranova-connect-${userId}`,
      }
    );

  // ==========================================================
  // 5. VALIDA O ID DA CONTA
  // ==========================================================

  if (!account.id) {
    throw new Error(
      "A Stripe não retornou o ID da conta conectada."
    );
  }

  console.log(
    "Stripe Connect v2 Account criada:",
    account.id
  );

  // ==========================================================
  // 6. SALVA O ID NO PERFIL
  // ==========================================================

  const {
    error: updateError,
  } = await admin
    .from("profiles")
    .update({
      stripe_account_id: account.id,
    })
    .eq("id", userId);

  if (updateError) {
    console.error(
      "Erro ao salvar Stripe Account ID:",
      updateError
    );

    throw new Error(
      "A conta Stripe foi criada, mas não foi possível salvar a conexão na Uranova."
    );
  }

  // ==========================================================
  // 7. RETORNA RESULTADO
  // ==========================================================

  return {
    accountId: account.id,
    created: true,
  };
}

/**
 * ============================================================
 * CRIA LINK DE ONBOARDING
 * ============================================================
 *
 * Cria o link hospedado pela Stripe para o produtor
 * completar o cadastro da conta conectada.
 */
export async function createStripeAccountLink(
  accountId: string
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL ou NEXT_PUBLIC_SITE_URL não configurado."
    );
  }

  // ==========================================================
  // A STRIPE EXIGE HTTPS PARA ACCOUNT LINKS
  // ==========================================================

  if (!baseUrl.startsWith("https://")) {
    throw new Error(
      "O Account Link da Stripe exige uma URL HTTPS. Configure NEXT_PUBLIC_APP_URL com uma URL HTTPS."
    );
  }

  // ==========================================================
  // ACCOUNT LINK — ACCOUNTS V2
  // ==========================================================

  const accountLink =
    await stripe.v2.core.accountLinks.create({
      account: accountId,

      use_case: {
        type: "account_onboarding",

        account_onboarding: {
          configurations: [
            "recipient",
            "merchant",
          ],

          refresh_url:
            `${baseUrl}/dashboard/finance?stripe=refresh`,

          return_url:
            `${baseUrl}/dashboard/finance?stripe=success`,
        },
      },
    });

  return accountLink.url;
}

/**
 * ============================================================
 * BUSCA DADOS DA CONTA CONNECT
 * ============================================================
 */
export async function getStripeConnectAccount(
  accountId: string
) {
  const account =
    await stripe.v2.core.accounts.retrieve(
      accountId,
      {
        include: [
          "configuration.merchant",
          "configuration.recipient",
          "identity",
          "requirements",
        ],
      }
    );

  return account;
}