// Signature checks are a minimum validation, not malware scanning.
export function fileType(bytes: Uint8Array, imagesOnly: boolean) {
  const b = Buffer.from(bytes);
  if (b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return {ext:"png",mime:"image/png"};
  if (b[0]===255 && b[1]===216 && b[2]===255) return {ext:"jpg",mime:"image/jpeg"};
  if (b.subarray(0,4).toString()==="RIFF" && b.subarray(8,12).toString()==="WEBP") return {ext:"webp",mime:"image/webp"};
  if (!imagesOnly && b.subarray(0,5).toString()==="%PDF-") return {ext:"pdf",mime:"application/pdf"};
  if (!imagesOnly && b[0]===80 && b[1]===75 && b[2]===3 && b[3]===4) return {ext:"zip",mime:"application/zip"};
  if (!imagesOnly && b.subarray(4,8).toString()==="ftyp") return {ext:"mp4",mime:"video/mp4"};
  throw new Error("INVALID_INPUT");
}
