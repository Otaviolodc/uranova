import { NextResponse } from "next/server"
import { ASAAS_URL, getAsaasHeaders } from "@/lib/asaas"

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const { subscriptionId } = body

    if (!subscriptionId) {

  return NextResponse.json(
    {
      error: "Subscription ID obrigatório",
    },
    {
      status: 400,
    }
  )

}

  if (typeof subscriptionId !== "string") {

  return NextResponse.json(
    {
      error: "Subscription ID inválido",
    },
    {
      status: 400,
    }
  )

}

    const response = await fetch(
      `${ASAAS_URL}/subscriptions/${subscriptionId}`,
      {
        method: "DELETE",
        headers: getAsaasHeaders(),
      }
    )

    if (!response.ok) {

  return NextResponse.json(
    {
      error: "Erro ao cancelar assinatura",
    },
    {
      status: response.status,
    }
  )

}

    const data = await response.json()

    return NextResponse.json(data)

      } catch (error) {

    console.error(
      "ASAAS CANCEL ERROR:",
      error
    )

    return NextResponse.json(
      {
        error: "Erro ao cancelar assinatura",
      },
      {
        status: 500,
      }
    )

  }

}