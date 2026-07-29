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
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// EDITAR AULA
export async function PATCH(req: Request) {
  const body = await req.json();

  const {
    id,
    title,
    description,
    video_provider,
    video_url,
    content,
    duration_minutes,
    is_free,
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

  const updates: Record<string, unknown> = {};

  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (video_provider !== undefined)
    updates.video_provider = video_provider;
  if (video_url !== undefined)
    updates.video_url = video_url;
  if (content !== undefined)
    updates.content = content;
  if (duration_minutes !== undefined)
    updates.duration_minutes = duration_minutes;
  if (is_free !== undefined)
    updates.is_free = is_free;

  const { data, error } = await supabase
    .from("course_lessons")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// EXCLUIR AULA
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "id é obrigatório." },
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

  const { error } = await supabase
    .from("course_lessons")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}