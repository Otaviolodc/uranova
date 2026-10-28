import { stagingRegistration } from "./staging-registration";
import { assertFunctionalStagingPreparation } from "./functional-staging-policy";

type Environment = Readonly<Record<string, string | undefined>>;
type Registration = Readonly<{supabaseProjectRef: string; vercelProjectId: string}>;
const productionProject = "prj_mDBer36P7vACcz1oUWV4QobYNHI8";
const productionSupabase = "opdjpdjettgfndctjcnj";

function fail(): never { throw new Error("AUTH_STAGING_ISOLATION_UNVERIFIED"); }

/** Deployment-specific host only: no Git branch is required and no production fallback. */
export function stagingPreviewOrigin(env: Environment): string {
  const host = env.VERCEL_URL;
  if (!host || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.vercel\.app$/.test(host) ||
      host === env.VERCEL_PROJECT_PRODUCTION_URL || host === "uranova-staging.vercel.app") fail();
  return "https://" + host;
}

function credentialMatches(value: string | undefined, ref: string, role: string) {
  // Inspect linkage only, not authentication: Supabase still verifies the signature.
  // Opaque keys cannot prove linkage offline and are deliberately rejected here.
  try {
    const parts = value?.split(".");
    if (!parts || parts.length !== 3 || !parts[2]) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")));
    return payload.ref === ref && payload.role === role &&
      Number.isFinite(payload.exp) && payload.exp > Date.now()/1000;
  } catch { return false; }
}

/** Pure validation; production entry points always use the checked-in registration. */
export function validateStagingEnvironment(env: Environment, registration: Registration = stagingRegistration): boolean {
  assertFunctionalStagingPreparation(env);
  const mode = env.AUTH_STAGING_MODE;
  if (mode !== undefined && mode !== "" && mode !== "true" && mode !== "false") fail();
  const stagingUrl = "https://" + registration.supabaseProjectRef + ".supabase.co";
  const identifiesStaging = env.NEXT_PUBLIC_SUPABASE_URL === stagingUrl ||
    (!!registration.vercelProjectId && env.VERCEL_PROJECT_ID === registration.vercelProjectId);
  if (mode !== "true") {
    // Omission of the flag in the registered staging project must not enable integrations.
    if (identifiesStaging) fail();
    return false;
  }
  if (env.VERCEL_PROJECT_ID === productionProject ||
      env.NEXT_PUBLIC_SUPABASE_URL?.includes(productionSupabase) ||
      env.VERCEL_ENV === "production" || env.VERCEL_TARGET_ENV === "production") fail();
  if (!/^prj_[A-Za-z0-9]+$/.test(registration.vercelProjectId) ||
      registration.vercelProjectId === productionProject ||
      !/^[a-z]{20}$/.test(registration.supabaseProjectRef) ||
      registration.supabaseProjectRef === productionSupabase) fail();
  if (env.VERCEL !== "1" || env.VERCEL_ENV !== "preview" ||
      env.VERCEL_TARGET_ENV !== "preview" ||
      env.VERCEL_PROJECT_ID !== registration.vercelProjectId) fail();
  if (env.NEXT_PUBLIC_SUPABASE_URL !== stagingUrl) fail();
  if (!credentialMatches(env.NEXT_PUBLIC_SUPABASE_ANON_KEY, registration.supabaseProjectRef, "anon") ||
      !credentialMatches(env.SUPABASE_SERVICE_ROLE_KEY, registration.supabaseProjectRef, "service_role")) fail();
  // No financial/AI/management credentials may be inherited by an Auth-only deployment.
  for (const [name,value] of Object.entries(env)) {
    if (value && (/STRIPE|OPENAI/.test(name) ||
        /^(DATABASE_URL|DIRECT_URL|POSTGRES_.*|SUPABASE_ACCESS_TOKEN|SUPABASE_DB_PASSWORD|SUPABASE_JWT_SECRET)$/.test(name))) fail();
  }
  // Static APP/SITE values are overridden at build time by the verified deployment origin.
  stagingPreviewOrigin(env);
  return true;
}

export function authStagingEnabled() { return validateStagingEnvironment(process.env); }

export function assertIntegrationsEnabled() {
  if (authStagingEnabled()) throw new Error("AUTH_STAGING_INTEGRATION_BLOCKED");
}

export function integrationUnavailable(): Response | null {
  try { assertIntegrationsEnabled(); return null; }
  catch { return Response.json({error:"Integration unavailable."},{status:503,headers:{"Cache-Control":"no-store"}}); }
}

export function stagingPathAllowed(pathname: string) {
  return ["/auth/login","/auth/signup","/auth/forgot-password","/auth/reset-password",
    "/auth/callback","/auth/logout","/auth/staging-status","/api/account/password","/uranova-logo.svg","/favicon.ico"].includes(pathname);
}
