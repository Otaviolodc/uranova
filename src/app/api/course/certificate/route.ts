import { NextResponse } from "next/server";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { createClient } from "@/lib/supabase/server";
import { getCourseCompletion } from "@/lib/services/certificate";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);

    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Produto não informado." },
        { status: 400 }
      );
    }

    const completion = await getCourseCompletion(
      user.id,
      productId
    );

    if (!completion.completed) {
      return NextResponse.json(
        {
          error: "Curso ainda não concluído.",
        },
        {
          status: 403,
        }
      );
    }

    const { data: product } = await supabase
      .from("products")
      .select("title")
      .eq("id", productId)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,name")
      .eq("id", user.id)
      .maybeSingle();

    const studentName =
      profile?.full_name ||
      profile?.name ||
      user.email ||
      "Aluno";

    const pdf = await PDFDocument.create();

    const page = pdf.addPage([842, 595]);

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(
      StandardFonts.HelveticaBold
    );

    page.drawText("URANOVA", {
      x: 340,
      y: 540,
      size: 28,
      font: bold,
      color: rgb(0.1, 0.6, 0.3),
    });

    page.drawText("CERTIFICADO", {
      x: 305,
      y: 490,
      size: 24,
      font: bold,
    });

    page.drawText(
      "Certificamos que",
      {
        x: 320,
        y: 430,
        size: 16,
        font,
      }
    );

    page.drawText(studentName, {
      x: 220,
      y: 385,
      size: 28,
      font: bold,
    });

    page.drawText(
      "concluiu com sucesso o curso",
      {
        x: 255,
        y: 340,
        size: 16,
        font,
      }
    );

    page.drawText(product?.title ?? "", {
      x: 180,
      y: 295,
      size: 24,
      font: bold,
      color: rgb(0.1, 0.3, 0.8),
    });

    page.drawText(
      `Emitido em ${new Date().toLocaleDateString("pt-BR")}`,
      {
        x: 290,
        y: 210,
        size: 15,
        font,
      }
    );

    page.drawText("Plataforma Uranova", {
      x: 315,
      y: 120,
      size: 16,
      font: bold,
    });

    const pdfBytes = await pdf.save();

    return new NextResponse(pdfBytes.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="certificado-uranova.pdf"',
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro ao gerar certificado.",
      },
      {
        status: 500,
      }
    );
  }
}