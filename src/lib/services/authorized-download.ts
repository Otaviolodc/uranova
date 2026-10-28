import "server-only";
import { admin } from "@/lib/supabase/admin";
import { activeAccess, storedPaths, uuid } from "@/lib/security/validation";
import type { User } from "@supabase/supabase-js";

export async function authorizedDownload(user: User, productId: unknown, index: unknown) {
  const id=uuid(productId);
  if (typeof index!=="number" || !Number.isInteger(index) || index<0 || index>99) throw new Error("INVALID_INPUT");
  const {data:product,error}=await admin.from("products").select("id,user_id,file_path").eq("id",id).single();
  if(error || !product?.user_id) throw new Error("FORBIDDEN");
  let allowed=product.user_id===user.id;
  if(!allowed){
    const {data:profile,error:pe}=await admin.from("profiles").select("role").eq("id",user.id).single();
    if(pe) throw new Error("FORBIDDEN");
    allowed=profile?.role==="admin" && !!process.env.OWNER_EMAIL && user.email===process.env.OWNER_EMAIL;
  }
  if(!allowed){
    const {data:access,error:ae}=await admin.from("customer_products").select("status,expires_at").eq("customer_id",user.id).eq("product_id",id);
    if(ae || !access?.some(a=>activeAccess(a))) throw new Error("FORBIDDEN");
  }
  const path=storedPaths(product.file_path)[index];
  if(!path) throw new Error("FORBIDDEN");
  // Ownership is checked by a restricted server-only RPC; storage schema is not exposed to PostgREST.
  const {data:owned,error:oe}=await admin.rpc("phase_a_file_owned",{p_path:path,p_owner:product.user_id});
  if(oe || owned!==true) throw new Error("FORBIDDEN");
  const {data,error:se}=await admin.storage.from("products").createSignedUrl(path,60,{download:true});
  if(se || !data?.signedUrl) throw new Error("SIGNING_FAILED");
  return data.signedUrl;
}
