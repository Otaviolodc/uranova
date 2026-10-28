import { createClient } from "@/lib/supabase/server";
import { getCourseCompletion } from "@/lib/services/certificate";
import { certificateDocument, certificateName } from "@/lib/services/certificate-document";
import { isCourse } from "@/lib/courses";
import { uuid } from "@/lib/security/validation";

export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return Response.json({ error: "Não autenticado." }, { status: 401, headers });
    const productId = uuid(new URL(request.url).searchParams.get("productId"));
    const completion = await getCourseCompletion(user.id, productId);
    if (!completion.completed) return Response.json({ error: "Curso ainda não concluído." }, { status: 403, headers });
    const { data: product, error: productError } = await supabase.from("products").select("title,type").eq("id", productId).single();
    if (productError) throw new Error("READ_FAILED");
    if (!product || !isCourse(product.type)) return Response.json({ error: "Curso não encontrado." }, { status: 404, headers });
    const { data: profile, error: profileError } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();
    if (profileError) throw new Error("READ_FAILED");
    const bytes = await certificateDocument(certificateName(profile), product.title);
    return new Response(new Uint8Array(bytes).buffer, { headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="certificado-uranova.pdf"' } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const messages: Record<string, string> = {
      CERTIFICATE_NAME_REQUIRED: "Preencha seu nome no perfil antes de emitir o certificado.",
      CERTIFICATE_UNSUPPORTED_CHARACTER: "O certificado ainda não suporta um dos caracteres do nome ou título. Nenhum caractere foi substituído; entre em contato com o suporte.",
      CERTIFICATE_TEXT_INVALID: "Nome ou título inválido para o certificado.",
      CERTIFICATE_TEXT_TOO_LONG: "Nome ou título excede o espaço disponível no certificado.",
      FORBIDDEN: "Acesso não autorizado.", INVALID_INPUT: "Identificador inválido.",
    };
    return Response.json({ error: messages[code] || "Não foi possível gerar o certificado. Tente novamente." }, {
      status: code === "FORBIDDEN" ? 403 : code === "INVALID_INPUT" ? 400 : code.startsWith("CERTIFICATE_") ? 422 : 500, headers,
    });
  }
}
