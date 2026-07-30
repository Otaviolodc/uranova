import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { completeLesson } from "@/lib/services/lessonProgress";

export async function POST(request: Request) {
  try {
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

    const { lessonId } = await request.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId é obrigatório." },
        { status: 400 }
      );
    }

    await completeLesson(user.id, lessonId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro ao concluir aula.",
      },
      {
        status: 500,
      }
    );
  }
}