import { createClient } from "@/lib/supabase/server";
import { requireFinanceUser } from "@/lib/finance/access";
import { sameOrigin,jsonBody,safeError } from "@/lib/security/request";
import { exactKeys,uuid,text } from "@/lib/security/validation";
import { courseFields } from "@/lib/security/course-input";
export async function GET(req:Request){try{
 await requireFinanceUser();const id=uuid(new URL(req.url).searchParams.get("courseId"));const client=await createClient();
 const {data,error}=await client.from("course_modules").select("*").eq("course_id",id).order("position").order("id");
 if(error)throw new Error("READ_FAILED");return Response.json(data);
}catch(error){return safeError(error);}}
export async function POST(req:Request){try{
 sameOrigin(req);const user=await requireFinanceUser();const b=await jsonBody(req);exactKeys(b,["courseId","title","description","position"]);
 const course_id=uuid(b.courseId);text(b.title,200);const client=await createClient();
 const {data:parent,error:pe}=await client.from("products").select("id").eq("id",course_id).eq("user_id",user.id).single();if(pe||!parent)throw new Error("FORBIDDEN");
 const {data,error}=await client.from("course_modules").insert({course_id,user_id:user.id,...courseFields(b,{title:"title",description:"description",position:"position"})}).select().single();
 if(error)throw new Error("WRITE_FAILED");return Response.json(data,{status:201});
}catch(error){return safeError(error);}}
