import "server-only";
import { createClient } from "@supabase/supabase-js";
import { authStagingEnabled } from "@/lib/security/staging-policy";
import { lazyClient } from "@/lib/security/lazy-client";

export const admin = lazyClient(() => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
), authStagingEnabled);
