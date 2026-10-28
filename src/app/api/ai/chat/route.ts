import { integrationUnavailable } from "@/lib/security/staging-policy";
import { rateLimit } from "@/lib/security/rate-limit";
import { requireFinanceUser } from "@/lib/finance/access";
import { sameOrigin,jsonBody,safeError } from "@/lib/security/request";
import { exactKeys } from "@/lib/security/validation";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  const unavailable = integrationUnavailable(); if (unavailable) return unavailable;


  try {
    sameOrigin(req); const user = await requireFinanceUser(); await rateLimit("ai", user.id);
    const body=await jsonBody(req,4096);exactKeys(body,["message","views","growth","viralProduct"]);

    const {
      message,
      views,
      growth,
      viralProduct,
    } = body;

    if (!message) {

  return Response.json(
    {
      message: "Mensagem obrigatória",
    },
    {
      status: 400,
    }
  );

}

if (typeof message !== "string") {

  return Response.json(
    {
      message: "Mensagem inválida",
    },
    {
      status: 400,
    }
  );

}

   if (message.length > 1000) {

  return Response.json(
    {
      message: "Mensagem muito longa",
    },
    {
      status: 400,
    }
  );

}

    const cleanMessage = message.trim();

if (!cleanMessage) {

  return Response.json(
    {
      message: "Mensagem vazia",
    },
    {
      status: 400,
    }
  );

}

    const completion =
      await openai.chat.completions.create({

        model: "gpt-4o-mini",

        max_tokens: 300,

        temperature: 0.7,

        messages: [

          {
            role: "system",

            content: `
            Você é a IA oficial do Uranova.

            Você ajuda usuários com:

            - marketing digital
            - vendas
            - conversão
            - copywriting
            - produtos virais
            - estratégias de tráfego
            - crescimento de vendas

            Responda de forma curta,
            inteligente e estratégica.
            `,
          },

          {
            role: "user",

            content: `
            Usuário do Uranova.

            Views totais:
            ${views}

            Crescimento:
            ${growth}%

            Produto viral:
            ${(viralProduct && typeof viralProduct === "object" && "title" in viralProduct && typeof viralProduct.title === "string" ? viralProduct.title.slice(0,200) : "") || "Nenhum"}

            Pergunta do usuário:
            ${cleanMessage}

            Responda como especialista em:
            marketing digital,
            conversão,
            tráfego,
            copywriting,
            vendas,
            produtos virais,
            crescimento de links.
             `,
          },

        ],

      });

    return Response.json({
  message:
    completion.choices[0]
      .message.content ||
    "Não foi possível gerar resposta.",
});

  } catch (error) {

    return safeError(error);
  }

}
