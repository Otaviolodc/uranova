import { createClient } from "@/lib/supabase/server";
import { requireFinanceUser } from "@/lib/finance/access";
import { sameOrigin,jsonBody,safeError } from "@/lib/security/request";
import { exactKeys,text,safeExternalUrl } from "@/lib/security/validation";
export async function POST(req:Request){try{
 sameOrigin(req);const user=await requireFinanceUser();const b=await jsonBody(req);
 exactKeys(b,["title","price","image_url","affiliate_url","marketplace"]);
 const title=text(b.title,200);
 if(typeof b.price!=="number"||!Number.isFinite(b.price)||b.price<=0||b.price>1000000||Math.abs(b.price*100-Math.round(b.price*100))>0.00001)throw new Error("INVALID_INPUT");
 const row={user_id:user.id,title,price:b.price,image_url:b.image_url?safeExternalUrl(b.image_url):null,affiliate_url:b.affiliate_url?safeExternalUrl(b.affiliate_url):null,marketplace:b.marketplace?text(b.marketplace,100):null};
 const client=await createClient();const {data,error}=await client.from("products").insert(row).select("id,title,price");
 if(error)throw new Error("WRITE_FAILED");return Response.json({success:true,data},{status:201});
}catch(error){return safeError(error);}}
export async function GET(){try{const client=await createClient();const {data,error}=await client.from("products").select("id,title,price,image_url,affiliate_url,marketplace,created_at").order("created_at",{ascending:false});if(error)throw new Error("READ_FAILED");return Response.json({data});}catch(error){return safeError(error);}}
