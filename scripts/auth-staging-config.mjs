import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
export const STAGING_ORIGIN = 'https://unkupjzifylpredkenvj.supabase.co';
export const LOCAL_ORIGIN = 'http://localhost:3000';
export const REQUIRED = ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'AUTH_E2E_EMAIL', 'AUTH_E2E_PASSWORD', 'AUTH_E2E_OTHER_EMAIL', 'AUTH_E2E_OTHER_PASSWORD'];
export function validateConfig(env) {
  const missing = REQUIRED.filter(name => !env[name]?.trim());
  const problems = [];
  if (env.AUTH_E2E_SUPABASE_URL !== STAGING_ORIGIN || env.NEXT_PUBLIC_SUPABASE_URL !== STAGING_ORIGIN) problems.push('STAGING_URL_MISMATCH');
  if (env.AUTH_E2E_BASE_URL !== LOCAL_ORIGIN || env.AUTH_E2E_ISOLATED_PROJECT !== 'true') problems.push('LOCAL_ORIGIN_OR_FLAG_INVALID');
  if (Object.keys(env).some(k => /STRIPE|OPENAI|SERVICE_ROLE|DATABASE_URL|ACCESS_TOKEN|DB_PASSWORD/.test(k))) problems.push('FORBIDDEN_CONFIGURATION');
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (key && !key.startsWith('sb_publishable_')) {
    try {
      const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url'));
      if (claims.ref !== 'unkupjzifylpredkenvj' || claims.role !== 'anon' || !(claims.exp > Date.now() / 1000)) problems.push('PUBLIC_KEY_INVALID');
    } catch { problems.push('PUBLIC_KEY_INVALID'); }
  }
  if (env.AUTH_E2E_EMAIL && env.AUTH_E2E_OTHER_EMAIL && env.AUTH_E2E_EMAIL.trim().toLowerCase() === env.AUTH_E2E_OTHER_EMAIL.trim().toLowerCase()) problems.push('ACCOUNTS_MUST_DIFFER');
  return { ready: missing.length === 0 && problems.length === 0, missing, problems };
}
export function loadConfig() {
  // Fixed dedicated file; no dotenv, inherited credentials or .env.local fallback.
  const env = parseEnv(readFileSync('.local/auth-p01-staging.env', 'utf8'));
  return { env, report: validateConfig(env) };
}
export function authOnlyFetch(input, init) {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  const allowed = (method === 'POST' && url.pathname === '/auth/v1/token' && ['password', 'refresh_token'].includes(url.searchParams.get('grant_type'))) ||
    (method === 'POST' && url.pathname === '/auth/v1/logout' && url.searchParams.get('scope') === 'local') ||
    (method === 'GET' && url.pathname === '/auth/v1/user');
  if (url.origin !== STAGING_ORIGIN || url.username || url.password || !allowed) throw new Error('NETWORK_DESTINATION_BLOCKED');
  // Never follow a provider redirect to another origin.
  return fetch(input, { ...init, redirect: 'error', signal: AbortSignal.timeout(15000) });
}
