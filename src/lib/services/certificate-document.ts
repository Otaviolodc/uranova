import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export function certificateName(profile: { name?: string | null } | null) {
  const name = profile?.name?.trim().normalize("NFC");
  if (!name) throw new Error("CERTIFICATE_NAME_REQUIRED");
  return name;
}

export async function certificateDocument(studentName: string, title: string, date = new Date()) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  function line(raw: string, y: number, size: number, strong = false) {
    const value = raw.trim().normalize("NFC");
    const face = strong ? bold : font;
    if (!value || /[\u0000-\u001f\u007f]/.test(value)) throw new Error("CERTIFICATE_TEXT_INVALID");
    let width: number;
    try { width = face.widthOfTextAtSize(value, size); }
    catch { throw new Error("CERTIFICATE_UNSUPPORTED_CHARACTER"); }
    const fitted = Math.min(size, size * 730 / Math.max(width, 1));
    if (fitted < 10) throw new Error("CERTIFICATE_TEXT_TOO_LONG");
    page.drawText(value, { x: (842 - face.widthOfTextAtSize(value, fitted)) / 2, y, size: fitted, font: face, color: rgb(.1, .2, .3) });
  }
  line("URANOVA", 540, 28, true);
  line("CERTIFICADO", 490, 24, true);
  line("Certificamos que", 430, 16);
  line(studentName, 385, 28, true);
  line("concluiu com sucesso o curso", 340, 16);
  line(title, 295, 24, true);
  line(`Emitido em ${date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`, 210, 15);
  line("Plataforma Uranova", 120, 16, true);
  return pdf.save();
}
