import { integrationUnavailable } from "@/lib/security/staging-policy";
import { rateLimit } from "@/lib/security/rate-limit";
import { requireFinanceUser } from "@/lib/finance/access";
import { sameOrigin,jsonBody,reauthenticate,safeError } from "@/lib/security/request";
import { exactKeys } from "@/lib/security/validation";
import { createStripeConnectAccount,createStripeAccountLink } from "@/lib/services/stripe-connect";
export const runtime="nodejs";
export async function POST(req:Request){
  const unavailable = integrationUnavailable(); if (unavailable) return unavailable;
try{
 sameOrigin(req);const user=await requireFinanceUser(); await rateLimit("connect", user.id);const body=await jsonBody(req);exactKeys(body,["currentPassword"]);
 await reauthenticate(user,body.currentPassword);
 const {accountId}=await createStripeConnectAccount(user.id);
 return Response.json({success:true,url:await createStripeAccountLink(accountId)},{headers:{"Cache-Control":"no-store"}});
}catch(error){return safeError(error);}}
