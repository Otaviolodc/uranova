import { createClient } from "@/lib/supabase/server";
import { requireFinanceUser } from "@/lib/finance/access";
import { sameOrigin,jsonBody,safeError } from "@/lib/security/request";
import { exactKeys,uuid,text } from "@/lib/security/validation";
import { courseFields } from "@/lib/security/course-input";
export async function GET(req:Request){try{
 const user=await requireFinanceUser();const id=uuid(new URL(req.url).searchParams.get("moduleId"));const client=await createClient();
 const {data,error}=await client.from("course_lessons").select("*").eq("module_id",id).eq("user_id",user.id).order("position").order("id");
 if(error)throw new Error("READ_FAILED");return Response.json(data);
}catch(error){return safeError(error);}}
export async function POST(req:Request){try{
 sameOrigin(req);const user=await requireFinanceUser();const b=await jsonBody(req,16384);exactKeys(b,["moduleId","title","description","videoUrl","position"]);
 const module_id=uuid(b.moduleId);text(b.title,200);const client=await createClient();
 const {data:parent,error:pe}=await client.from("course_modules").select("id").eq("id",module_id).eq("user_id",user.id).single();if(pe||!parent)throw new Error("FORBIDDEN");
 const {data,error}=await client.from("course_lessons").insert({module_id,user_id:user.id,...courseFields(b,{title:"title",description:"description",videoUrl:"video_url",position:"position"})}).select().single();
 if(error)throw new Error("WRITE_FAILED");return Response.json(data,{status:201});
}catch(error){return safeError(error);}}
export async function PATCH(req:Request){try{
 sameOrigin(req);const user=await requireFinanceUser();const b=await jsonBody(req,32768);
 const mapping={title:"title",description:"description",video_provider:"video_provider",video_url:"video_url",content:"content",duration_minutes:"duration_minutes",is_free:"is_free"};
 exactKeys(b,["id",...Object.keys(mapping)]);const id=uuid(b.id);const fields=courseFields(b,mapping);if(!Object.keys(fields).length)throw new Error("INVALID_INPUT");
 const client=await createClient();const {data,error}=await client.from("course_lessons").update(fields).eq("id",id).eq("user_id",user.id).select().single();
 if(error||!data)throw new Error("FORBIDDEN");return Response.json(data);
}catch(error){return safeError(error);}}
export async function DELETE(req:Request){try{
 sameOrigin(req);const user=await requireFinanceUser();const id=uuid(new URL(req.url).searchParams.get("id"));const client=await createClient();
 const {data,error}=await client.from("course_lessons").delete().eq("id",id).eq("user_id",user.id).select("id");
 if(error||!data?.length)throw new Error("FORBIDDEN");return Response.json({success:true});
}catch(error){return safeError(error);}}
