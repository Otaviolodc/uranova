import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const completion =
      await openai.chat.completions.create({

        model: "gpt-4o-mini",

        messages: [

          {
            role: "system",

            content: `
            Você é a IA oficial do PromoLink.

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
            content: body.message,
          },

        ],

      });

    return Response.json({
      message:
        completion.choices[0]
          .message.content,
    });

  } catch (error) {

    console.log(error);

    return Response.json({
      message:
        "Erro ao conectar IA",
    });

  }

}