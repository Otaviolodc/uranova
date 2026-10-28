import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireFinanceOwner } from "@/lib/finance/access";
import { uuid,activeAccess } from "./validation";
export async function requireCourseAccess(userId:string,productId:string){
 await requireFinanceOwner(userId);uuid(productId);
 const client=await createClient();
 const {data:product,error}=await client.from("products").select("user_id").eq("id",productId).single();
 if(error||!product)throw new Error("FORBIDDEN");
 if(product.user_id===userId)return;
 const {data:access,error:ae}=await client.from("customer_products").select("status,expires_at").eq("customer_id",userId).eq("product_id",productId);
 if(ae||!access?.some(a=>activeAccess(a)))throw new Error("FORBIDDEN");
}
