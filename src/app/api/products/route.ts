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

    if (!title || !price) {

  return NextResponse.json(
    {
      error: "Título e preço são obrigatórios",
    },
    {
      status: 400,
    }
  );

}

if (
  typeof title !== "string" ||
  typeof price !== "number"
) {

  return NextResponse.json(
    {
      error: "Dados inválidos",
    },
    {
      status: 400,
    }
  );

}

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

  return NextResponse.json(
    {
      error,
    },
    {
      status: 500,
    }
  );

}

    return NextResponse.json(
  {
    success: true,
    data,
  },
  {
    status: 201,
  }
);

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

export async function GET() {

  const supabase =
    await createClient();

  const { data, error } =
    await supabase

      .from("products")
      .select(`
        id,
        title,
        price,
        image_url,
        affiliate_url,
        marketplace,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      });

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
  data,
});

}