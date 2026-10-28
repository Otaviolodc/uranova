import { integrationUnavailable } from "@/lib/security/staging-policy";
import { rateLimit } from "@/lib/security/rate-limit";
import { randomUUID } from "node:crypto";
import { admin } from "@/lib/supabase/admin";
import { requireFinanceUser } from "@/lib/finance/access";
import { fileType } from "@/lib/security/files";
import { sameOrigin,safeError } from "@/lib/security/request";
export async function POST(req: Request) {
  const unavailable = integrationUnavailable(); if (unavailable) return unavailable;

  try {
    sameOrigin(req); const user=await requireFinanceUser(); await rateLimit("upload", user.id);
    const length=Number(req.headers.get("content-length"));
    if(!Number.isSafeInteger(length) || length<=0 || length>4*1024*1024) throw new Error("INVALID_INPUT");
    let received=0;
    const limited = new TransformStream<Uint8Array,Uint8Array>({transform(chunk,controller){
      received+=chunk.byteLength; if(received>4*1024*1024) throw new Error("INVALID_INPUT"); controller.enqueue(chunk);
    }});
    if(!req.body) throw new Error("INVALID_INPUT");
    const form=await new Response(req.body.pipeThrough(limited),{headers:{"Content-Type":req.headers.get("content-type")||""}}).formData();
    if([...form.keys()].some(k=>!["bucket","file"].includes(k))) throw new Error("INVALID_INPUT");
    if(form.getAll("bucket").length!==1 || form.getAll("file").length!==1) throw new Error("INVALID_INPUT");
    const bucket=form.get("bucket"),file=form.get("file");
    if(typeof bucket!=="string" || !["avatars","products-images","products"].includes(bucket) || !(file instanceof File) || !file.size) throw new Error("INVALID_INPUT");
    const bytes=new Uint8Array(await file.arrayBuffer()); const type=fileType(bytes,bucket!=="products");
    const path=user.id+"/"+randomUUID()+"."+type.ext;
    const {error}=await admin.storage.from(bucket).upload(path,bytes,{upsert:false,contentType:type.mime,metadata:{uploaded_by:user.id}});
    if(error) throw new Error("UPLOAD_FAILED");
    return Response.json({path,url:bucket==="products"?null:admin.storage.from(bucket).getPublicUrl(path).data.publicUrl},{headers:{"Cache-Control":"no-store"}});
  } catch(error){return safeError(error);}
}
