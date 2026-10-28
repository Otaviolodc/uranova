import { integrationUnavailable } from "@/lib/security/staging-policy";
import { rateLimit } from "@/lib/security/rate-limit";
import { requireFinanceUser } from "@/lib/finance/access";
import { authorizedDownload } from "@/lib/services/authorized-download";
import { exactKeys } from "@/lib/security/validation";
import { jsonBody,sameOrigin,safeError } from "@/lib/security/request";
export async function POST(req: Request) {
  const unavailable = integrationUnavailable(); if (unavailable) return unavailable;

  try { sameOrigin(req); const user=await requireFinanceUser(); await rateLimit("download", user.id); const body=await jsonBody(req);
    exactKeys(body,["productId","index"]);
    const url=await authorizedDownload(user,body.productId,body.index);
    return Response.json({url},{headers:{"Cache-Control":"no-store"}});
  } catch(error){return safeError(error);}
}
