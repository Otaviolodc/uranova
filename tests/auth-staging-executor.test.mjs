import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig, authOnlyFetch, STAGING_ORIGIN, LOCAL_ORIGIN } from '../scripts/auth-staging-config.mjs';
const fixture = () => ({ AUTH_E2E_SUPABASE_URL: STAGING_ORIGIN, NEXT_PUBLIC_SUPABASE_URL: STAGING_ORIGIN, AUTH_E2E_BASE_URL: LOCAL_ORIGIN,
  AUTH_E2E_ISOLATED_PROJECT: 'true', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_synthetic', AUTH_E2E_EMAIL: 'a@example.invalid', AUTH_E2E_PASSWORD: 'synthetic-a', AUTH_E2E_OTHER_EMAIL: 'b@example.invalid', AUTH_E2E_OTHER_PASSWORD: 'synthetic-b' });
test('isolated configuration requires all fields and rejects production, privileged credentials and reused identities', () => {
  assert.equal(validateConfig(fixture()).ready, true);
  for (const patch of [{ NEXT_PUBLIC_SUPABASE_URL: 'https://opdjpdjettgfndctjcnj.supabase.co' }, { AUTH_E2E_BASE_URL: 'https://production.invalid' }, { SUPABASE_SERVICE_ROLE_KEY: 'synthetic' }, { STRIPE_SECRET_KEY: '' }, { AUTH_E2E_PASSWORD: '' }, { AUTH_E2E_OTHER_EMAIL: 'a@example.invalid' }]) assert.equal(validateConfig({ ...fixture(), ...patch }).ready, false);
});
test('egress denies production, REST, signup, admin, global signout and financial destinations before fetch', () => {
  let calls = 0; const spy = mock.method(globalThis, 'fetch', () => { calls++; throw new Error('should not fetch'); });
  for (const [url, method] of [['https://opdjpdjettgfndctjcnj.supabase.co/auth/v1/user', 'GET'], [STAGING_ORIGIN + '/rest/v1/payments', 'GET'], [STAGING_ORIGIN + '/auth/v1/signup', 'POST'], [STAGING_ORIGIN + '/auth/v1/admin/users', 'POST'], [STAGING_ORIGIN + '/auth/v1/logout?scope=global', 'POST'], ['https://api.stripe.com/v1/accounts', 'POST']]) assert.throws(() => authOnlyFetch(url, { method }), /NETWORK_DESTINATION_BLOCKED/);
  assert.equal(calls, 0); spy.mock.restore();
});
test('allowed Auth call cannot follow redirects and has a timeout', async () => {
  const spy = mock.method(globalThis, 'fetch', async (_url, options) => { assert.equal(options.redirect, 'error'); assert.ok(options.signal); return new Response(null, { status: 204 }); });
  assert.equal((await authOnlyFetch(STAGING_ORIGIN + '/auth/v1/logout?scope=local', { method: 'POST' })).status, 204);
  spy.mock.restore();
});
