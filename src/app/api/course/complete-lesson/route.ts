import { sameOrigin,jsonBody,safeError } from "@/lib/security/request";
import { exactKeys,uuid } from "@/lib/security/validation";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { completeLesson } from "@/lib/services/lessonProgress";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
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

    const body=await jsonBody(request);exactKeys(body,["lessonId"]);const lessonId=uuid(body.lessonId);

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
    return safeError(error);
  }
}