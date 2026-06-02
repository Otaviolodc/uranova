import { NextResponse } from "next/server";
import { createClient }
from "@/lib/supabase/server";

export async function GET() {

  const supabase =
    await createClient();

  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        title: "Iphone 15 Pro Max",
        price: "5999",
        image_url: "https://placehold.co/300",
        affiliate_url: "https://google.com",
        marketplace: "Mercado Livre"
      }
    ])
    .select();

  return NextResponse.json({
    data,
    error
  });

}