import { NextRequest, NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest
) {
  try {

    const supabase = admin;

    const body = await req.json();

    const {
      link_id,
      product_id,
      device,
      country,
    } = body;

    if (!link_id || !product_id) {

  return NextResponse.json(
    {
      error: "link_id e product_id são obrigatórios",
    },
    {
      status: 400,
    }
  );

}

    const { error } = await supabase
      .from("clicks")
      .insert([
        {
          link_id,
          product_id,
          device,
          country,
        },
      ]);

    if (error) {

  return NextResponse.json(
    {
      error,
    },
    {
      status: 500,
    }
  );

}

return NextResponse.json({
  success: true,
});

} catch (error) {

  console.error(error);

  return NextResponse.json(
    {
      error: "Erro interno",
    },
    {
      status: 500,
    }
  );

}

}