import "server-only";
import { redirect } from "next/navigation";
import { requireFinanceAdmin } from "@/lib/finance/access";
import { rateLimit, RateLimitError } from "@/lib/security/rate-limit";
export async function requireAdminPage() {
  const user = await requireFinanceAdmin();
  try { await rateLimit("admin", user.id); }
  catch (error) {
    if (error instanceof RateLimitError) redirect(`/rate-limited?retry=${error.retryAfter}`);
    redirect("/rate-limited?unavailable=1");
  }
  return user;
}
