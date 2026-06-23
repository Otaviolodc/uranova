import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {

    const supabase = await createClient();

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

    console.log("LINK COMPLETO:");
    console.log(link);

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

    const { data: existing } = await supabase
      .from("link_clicks_daily")
      .select("*")
      .eq("link_id", link.id)
      .eq("date", today)
      .maybeSingle();

    if (existing) {

      await supabase
        .from("link_clicks_daily")
        .update({
          clicks: existing.clicks + 1,
        })
        .eq("id", existing.id);

    } else {

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

    console.log("LINK:", link);
    console.log("URL:", link.affiliate_url);

    return NextResponse.redirect(
      new URL(link.affiliate_url)
    );

    } catch (err: any) {

      console.log("ERRO COMPLETO:");
      console.log(err);

    return new Response(
      err?.message || "Erro interno",
      {
        status: 500,
      }
    );

  }

}