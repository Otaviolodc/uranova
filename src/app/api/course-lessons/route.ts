import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// LISTAR AULAS
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const moduleId = searchParams.get("moduleId");

  if (!moduleId) {
    return NextResponse.json(
      { error: "moduleId é obrigatório." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("course_lessons")
    .select("*")
    .eq("module_id", moduleId)
    .eq("user_id", user.id)
    .order("position");

  if (error) {
    console.log(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// CRIAR AULA
export async function POST(req: Request) {
  const body = await req.json();

  const {
    moduleId,
    title,
    description,
    videoUrl,
    position,
  } = body;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("course_lessons")
    .insert([
      {
        module_id: moduleId,
        user_id: user.id,
        title,
        description,
        video_url: videoUrl,
        position,
      },
    ])
    .select()
    .single();

  if (error) {
    console.log(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}