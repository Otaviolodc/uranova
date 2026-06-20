import { NextResponse } 
from "next/server";

import { createClient }
from "@/lib/supabase/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {

    const supabase =
      await createClient();

    const { slug } = await context.params;

    if (!slug) {
      return new Response("Slug inválido", {
        status: 400,
      });
    }

    // 🔎 buscar link
    const { data: link } = await supabase
      .from("links")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!link) {
      return new Response("Link não encontrado", {
        status: 404,
      });
    }

    // 🔥 atualizar total de clicks
    await supabase
      .from("links")
      .update({
        clicks: (link.clicks || 0) + 1,
      })
      .eq("id", link.id);

    // 📅 data atual
    const today = new Date()
      .toISOString()
      .split("T")[0];

    // 🔎 verifica se já existe registro hoje
    const { data: existing } = await supabase
      .from("link_clicks_daily")
      .select("*")
      .eq("link_id", link.id)
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      // ➕ soma click
      await supabase
        .from("link_clicks_daily")
        .update({
          clicks: existing.clicks + 1,
        })
        .eq("id", existing.id);
    } else {
      // 🆕 cria registro
      await supabase
        .from("link_clicks_daily")
        .insert([
          {
            link_id: link.id,
            date: today,
            clicks: 1,
          },
        ]);
    }

    // 🤖 analytics IA

await supabase
  .from("analytics")
  .insert({

    user_id: link.user_id,

    product_id: link.id,

    event_type: "link_click",

    page: "go",

  });

    // 🚀 redirecionar
    return NextResponse.redirect(link.affiliate_url);

  } catch (err) {
    console.log("ERRO:", err);

    return new Response("Erro interno", {
      status: 500,
    });
  }
}