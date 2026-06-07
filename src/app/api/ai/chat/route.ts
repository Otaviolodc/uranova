import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {

  try {

    const {
      message,
      views,
      growth,
      viralProduct,
    } = await req.json();

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
            ${viralProduct?.title || "Nenhum"}

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
          .message.content,
    });

  } catch (error) {

    console.error("OPENAI ERROR:", error);

    return Response.json(
      {
        message: "Erro ao conectar IA",
      },
      {
        status: 500,
      }
    );

  }

}