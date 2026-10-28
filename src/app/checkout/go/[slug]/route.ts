import { integrationUnavailable } from "@/lib/security/staging-policy";
import { rateLimit, trackingPrincipal } from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { text,safeExternalUrl } from "@/lib/security/validation";
import { safeError } from "@/lib/security/request";
export async function GET(req:Request,context:{params:Promise<{slug:string}>}){
  const unavailable = integrationUnavailable(); if (unavailable) return unavailable;
try{
 await rateLimit("tracking", trackingPrincipal(req));
 const slug=text((await context.params).slug,200);
 const {data:link,error}=await admin.from("links").select("id,affiliate_url").eq("slug",slug).single();
 if(error||!link)return new Response("Link indisponivel",{status:404});
 const destination=safeExternalUrl(link.affiliate_url);
 const {error:tracking}=await admin.rpc("track_click_with_date",{link_slug:slug});
 if(tracking)throw new Error("TRACKING_FAILED");
 return NextResponse.redirect(destination);
}catch(error){return safeError(error);}}
