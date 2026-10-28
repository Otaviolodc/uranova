import { rateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { requireFinanceUser } from "@/lib/finance/access";
import { jsonBody, sameOrigin, reauthenticate, safeError } from "@/lib/security/request";
import { exactKeys } from "@/lib/security/validation";
export async function POST(req: Request) {
  try {
    sameOrigin(req); const user = await requireFinanceUser(); await rateLimit("password", user.id);
    const body = await jsonBody(req); exactKeys(body,["currentPassword","newPassword"]);
    const password = body.newPassword;
    if (typeof password !== "string" || password.length > 128) throw new Error("INVALID_INPUT");
    if (password.length < 12) throw new Error("INVALID_INPUT");
    await reauthenticate(user,body.currentPassword);
    const client = await createClient();
    const {error} = await client.auth.updateUser({password});
    if (error) throw new Error("PASSWORD_CHANGE_FAILED");
    return Response.json({success:true}, {headers:{"Cache-Control":"no-store"}});
  } catch(error) { return safeError(error); }
}
