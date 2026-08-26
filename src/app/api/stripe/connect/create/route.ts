import { NextResponse } from "next/server";

import {
  createStripeConnectAccount,
  createStripeAccountLink,
} from "@/lib/services/stripe-connect";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    // ======================================================
    // 1. IDENTIFICA O USUÁRIO AUTENTICADO
    // ======================================================

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Usuário não autenticado.",
        },
        {
          status: 401,
        }
      );
    }

    // ======================================================
    // 2. CRIA OU RECUPERA A CONTA CONNECT
    // ======================================================

    const { accountId } =
      await createStripeConnectAccount(user.id);

    console.log(
      "Stripe Connect Account:",
      accountId
    );

    // ======================================================
    // 3. CRIA O LINK DE ONBOARDING
    // ======================================================

    const accountLink =
      await createStripeAccountLink(accountId);

    // ======================================================
    // 4. RETORNA O LINK
    // ======================================================

    return NextResponse.json({
      success: true,
      url: accountLink,
    });
  } catch (error) {
    console.error(
      "STRIPE CONNECT CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao conectar conta Stripe.",
      },
      {
        status: 500,
      }
    );
  }
}