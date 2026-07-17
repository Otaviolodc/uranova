import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// LISTAR MÓDULOS
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      {
        error: "courseId é obrigatório.",
      },
      {
        status: 400,
      }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("position");

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(data);
}

// CRIAR MÓDULO
export async function POST(req: Request) {
  const body = await req.json();

  const {
    courseId,
    title,
    description,
    position,
  } = body;

  if (!courseId || !title) {
    return NextResponse.json(
      {
        error: "Dados inválidos.",
      },
      {
        status: 400,
      }
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
    .from("course_modules")
    .insert([
      {
        course_id: courseId,
        user_id: user.id,
        title,
        description,
        position,
      }
    ])
    .select()
    .single();

  if (error) {
  console.error("ERRO COURSE_MODULES:", error);

  return NextResponse.json(
    {
      error,
    },
    {
      status: 500,
    }
  );
}

  return NextResponse.json(data);
}