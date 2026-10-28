async function upload(bucket: string, file: File) {
  if (file.size > 4 * 1024 * 1024 - 8192) throw new Error("Arquivo excede o limite de upload de 4 MB.");
  const body = new FormData(); body.append("bucket",bucket); body.append("file",file);
  const response = await fetch("/api/files/upload",{method:"POST",body});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Upload indisponível.");
  return result;
}
export async function uploadFile(bucket: string, file: File): Promise<string> { return (await upload(bucket,file)).url; }
export async function uploadPrivateFile(bucket: string, file: File, fileName?: string): Promise<string | null> {
  // Legacy callers supply a filename; only the server chooses the actual namespace.
  void fileName;
  try { return (await upload(bucket,file)).path; } catch { return null; }
}
