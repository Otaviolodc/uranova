export const MAX_PRODUCT_UPLOAD_BYTES = 4 * 1024 * 1024 - 8192;
export type UploadKind = "cover" | "pdf" | "ebook" | "bundle";

async function validateFiles(files: File[], kind: UploadKind, signal: AbortSignal) {
  if (!files.length || files.length > (kind === "bundle" ? 100 : 1)) throw new Error("Selecione a quantidade correta de arquivos (máximo de 100 por pack).");
  for (const file of files) {
    signal.throwIfAborted();
    if (!file.size || file.size > MAX_PRODUCT_UPLOAD_BYTES) throw new Error(`${file.name}: arquivo vazio ou acima do limite de 4 MB, incluindo a margem de envio.`);
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
    const image = [137,80,78,71,13,10,26,10].every((value, index) => bytes[index] === value)
      || (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
      || (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP");
    const pdf = ascii(0, 5) === "%PDF-";
    const zip = bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4;
    const video = ascii(4, 8) === "ftyp";
    const accepted = kind === "cover" ? image : kind === "pdf" ? pdf : kind === "ebook" ? pdf || zip : image || pdf || zip || video;
    if (!accepted) throw new Error(`${file.name}: formato não aceito para este campo.`);
  }
}

// Existing server endpoint still owns authorization, namespace and upsert:false.
// Cache is local to this editor and retains confirmed responses for explicit retry.
export async function uploadProductFiles(files: File[], kind: UploadKind, signal: AbortSignal,
  cache: Map<File, string>, progress: (completed: number, total: number) => void): Promise<string> {
  await validateFiles(files, kind, signal);
  signal.throwIfAborted();
  progress(0, files.length);
  const references: string[] = [];
  for (const file of files) {
    signal.throwIfAborted();
    let reference = cache.get(file);
    if (!reference) {
      const body = new FormData();
      body.append("bucket", kind === "cover" ? "products-images" : "products");
      body.append("file", file);
      const response = await fetch("/api/files/upload", { method: "POST", body, signal });
      if (!response.ok) throw new Error("O servidor não confirmou o upload. Confira sua conexão e sessão antes de tentar novamente.");
      const result = await response.json();
      reference = kind === "cover" ? result.url : result.path;
      if (typeof reference !== "string" || !reference) throw new Error("O upload retornou uma referência inválida.");
      cache.set(file, reference);
    }
    signal.throwIfAborted();
    references.push(reference);
    progress(references.length, files.length);
  }
  return kind === "bundle" ? JSON.stringify(references) : references[0];
}
