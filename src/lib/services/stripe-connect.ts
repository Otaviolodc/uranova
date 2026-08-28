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
 * Produtor
 *    ↓
 * Conecta sua conta Stripe
 *    ↓
 * Uranova cria/reutiliza uma conta Connect
 *    ↓
 * Cliente realiza a compra
 *    ↓
 * Checkout Stripe
 *    ↓
 * Uranova recebe a application fee de 10%
 *    ↓
 * Produtor recebe sua parte no saldo Stripe Connect
 *    ↓
 * Stripe controla a disponibilidade do payout
 *
 * IMPORTANTE:
 *
 * Este serviço NÃO realiza o pagamento de vendas.
 *
 * A divisão financeira da venda é definida no Checkout
 * através de:
 *
 * application_fee_amount
 * transfer_data.destination
 *
 * O payment-processor também NÃO deve criar Transfer
 * manualmente para essa venda.
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
    .select(
      "id, name, stripe_account_id"
    )
    .eq(
      "id",
      userId
    )
    .single();

  if (
    profileError ||
    !profile
  ) {
    throw new Error(
      "Perfil do produtor não encontrado."
    );
  }

  // ==========================================================
  // 2. REUTILIZA CONTA EXISTENTE
  // ==========================================================

  if (
    profile.stripe_account_id
  ) {
    console.log(
      "Conta Stripe Connect já existente:",
      profile.stripe_account_id
    );

    return {
      accountId:
        profile.stripe_account_id,

      created:
        false,
    };
  }

  // ==========================================================
  // 3. BUSCA O USUÁRIO NO SUPABASE AUTH
  // ==========================================================

  const {
    data: authUser,
    error: authUserError,
  } =
    await admin.auth.admin.getUserById(
      userId
    );

  if (
    authUserError ||
    !authUser?.user
  ) {
    throw new Error(
      "Não foi possível obter os dados do produtor."
    );
  }

  const email =
    authUser.user.email;

  if (!email) {
    throw new Error(
      "O produtor precisa possuir um e-mail cadastrado."
    );
  }

  // ==========================================================
  // 4. CRIA A CONTA CONNECT — ACCOUNTS V2
  // ==========================================================
  //
  // MERCHANT
  //
  // Solicita a capacidade de pagamentos com cartão.
  //
  // RECIPIENT
  //
  // Solicita a capacidade necessária para receber
  // transferências no saldo Stripe da conta conectada.
  //
  // IMPORTANTE:
  //
  // NÃO existe um "configuration" dentro de outro
  // "configuration".
  //

  const account =
    await stripe.v2.core.accounts.create(
      {
        contact_email:
          email,

        display_name:
          profile.name ||
          email,

        identity: {
          country:
            "BR",
        },

        dashboard:
          "express",

        configuration: {
          // ==================================================
          // MERCHANT
          // ==================================================

          merchant: {
            capabilities: {
              card_payments: {
                requested:
                  true,
              },
            },
          },

          // ==================================================
          // RECIPIENT
          // ==================================================

          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: {
                  requested:
                    true,
                },
              },
            },
          },
        },

        // ====================================================
        // RESPONSABILIDADES
        // ====================================================

        defaults: {
          currency:
            "brl",

          responsibilities: {
            fees_collector:
              "application",

            losses_collector:
              "application",
          },
        },

        // ====================================================
        // DADOS RETORNADOS PELA API
        // ====================================================

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
    "===================================="
  );

  console.log(
    "STRIPE CONNECT ACCOUNT CRIADA"
  );

  console.log(
    "Account ID:",
    account.id
  );

  console.log(
    "===================================="
  );

  // ==========================================================
  // 6. SALVA O ID NO PERFIL
  // ==========================================================

  const {
    error: updateError,
  } = await admin
    .from("profiles")
    .update({
      stripe_account_id:
        account.id,
    })
    .eq(
      "id",
      userId
    );

  if (
    updateError
  ) {
    console.error(
      "Erro ao salvar Stripe Account ID:",
      updateError
    );

    throw new Error(
      "A conta Stripe foi criada, mas não foi possível salvar a conexão na Uranova."
    );
  }

  console.log(
    "Stripe Account ID salvo no perfil."
  );

  // ==========================================================
  // 7. RETORNA RESULTADO
  // ==========================================================

  return {
    accountId:
      account.id,

    created:
      true,
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
  // ==========================================================
  // 1. URL BASE
  // ==========================================================

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL ou NEXT_PUBLIC_SITE_URL não configurado."
    );
  }

  // ==========================================================
  // 2. VALIDA HTTPS
  // ==========================================================

  if (
    !baseUrl.startsWith(
      "https://"
    )
  ) {
    throw new Error(
      "O Account Link da Stripe exige uma URL HTTPS. Configure NEXT_PUBLIC_APP_URL com uma URL HTTPS."
    );
  }

  // ==========================================================
  // 3. ACCOUNT LINK — ACCOUNTS V2
  // ==========================================================

  const accountLink =
    await stripe.v2.core.accountLinks.create(
      {
        account:
          accountId,

        use_case: {
          type:
            "account_onboarding",

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
      }
    );

  // ==========================================================
  // 4. VALIDA URL
  // ==========================================================

  if (
    !accountLink.url
  ) {
    throw new Error(
      "A Stripe não retornou a URL de onboarding."
    );
  }

  console.log(
    "Stripe Account Link criado."
  );

  return accountLink.url;
}

/**
 * ============================================================
 * BUSCA DADOS DA CONTA CONNECT
 * ============================================================
 *
 * Usado para consultar o estado atual da conta conectada.
 *
 * Pode ser utilizado futuramente no dashboard financeiro
 * para mostrar ao produtor informações sobre sua conexão
 * Stripe e requisitos pendentes.
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