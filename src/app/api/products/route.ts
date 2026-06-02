import { NextRequest, NextResponse } from "next/server";
import { createClient }
from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {

    const supabase =
      await createClient();
      
    const body = await req.json();

    const {
      title,
      price,
      image_url,
      affiliate_url,
      marketplace,
    } = body;

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          title,
          price,
          image_url,
          affiliate_url,
          marketplace,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({
        error,
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json({
      error,
    });
  }
}

export async function GET() {

  const supabase =
    await createClient();

  const { data, error } =
    await supabase

      .from("products")

      .select("*")

      .order("created_at", {
        ascending: false,
      });

  return NextResponse.json({
    data,
    error,
  });

}