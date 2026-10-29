import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier, context, next) {
  return next(specifier === 'next/headers' ? 'next/headers.js' : specifier, context);
} });

// Exercise the real server cookie adapter and installed Supabase Auth/SSR SDKs.
// Only Next's request cookie store and the Auth HTTP endpoint are substituted.
let jar = [], writes = [], calls = [], providerFailure = false;
mock.module('next/headers', { namedExports: {
  cookies: async () => ({
    getAll: () => jar,
    set(name, value, options) { writes.push({ name, value, options }); },
  }),
} });
mock.module(pathToFileURL(`${process.cwd()}/src/lib/security/staging-policy.ts`).href, {
  namedExports: { authStagingEnabled() {} },
});
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://logout-test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'synthetic-anon-key';
mock.method(globalThis, 'fetch', async (url, options) => {
  calls.push({ url: String(url), options });
  assert.equal(String(url), 'https://logout-test.supabase.co/auth/v1/logout?scope=global');
  assert.equal(options.method, 'POST');
  return providerFailure
    ? Response.json({ message: 'PRIVATE_PROVIDER_DETAIL' }, { status: 500 })
    : new Response(null, { status: 204 });
});
const { GET, POST } = await import('../src/app/auth/logout/route.ts');
const origins = ['https://uranova.com.br', 'https://www.uranova.com.br'];
const request = (target, source = target, extra = {}) => new Request(`${target}/auth/logout`, {
  method: 'POST', headers: { ...(source === null ? {} : { origin: source }), ...extra },
});
function reset(session = true) {
  calls = []; writes = []; providerFailure = false;
  const encoded = 'base64-' + Buffer.from(JSON.stringify({
    access_token: 'synthetic-access-token', refresh_token: 'synthetic-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: 'synthetic-user' }, token_type: 'bearer',
  })).toString('base64url');
  const middle = Math.floor(encoded.length / 2);
  jar = [{ name: 'unrelated-preference', value: 'preserve' }, ...(session ? [
    { name: 'sb-logout-test-auth-token.0', value: encoded.slice(0, middle) },
    { name: 'sb-logout-test-auth-token.1', value: encoded.slice(middle) },
    { name: 'sb-logout-test-auth-token-code-verifier', value: 'synthetic-verifier' },
  ] : [])];
}

test('GET preserves session and supplies branded native POST with compatible referrer policy and hashed CSS', async () => {
  reset();
  const response = await GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('referrer-policy'), 'same-origin');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const html = await response.text();
  assert.match(html, /method="post" action="\/auth\/logout"/);
  assert.match(html, /src="\/uranova-logo.svg"/);
  const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  const csp = response.headers.get('content-security-policy');
  assert.ok(csp.includes(`style-src 'sha256-${createHash('sha256').update(css).digest('base64')}'`));
  for (const directive of ["default-src 'none'", "form-action 'self'", "frame-ancestors 'none'", "base-uri 'none'"]) assert.ok(csp.includes(directive));
  assert.doesNotMatch(html, /<script/);
  assert.deepEqual(calls, []);
  assert.deepEqual(writes, []);
});

test('official same-origin POST revokes Supabase session, expires auth chunks/PKCE and redirects 303', async () => {
  for (const origin of origins) {
    reset();
    const response = await POST(request(origin));
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), `${origin}/auth/login`);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(calls.length, 1);
    assert.deepEqual(writes.map(c => c.name).sort(), jar.filter(c => c.name.startsWith('sb-')).map(c => c.name).sort());
    for (const cookie of writes) {
      assert.equal(cookie.value, '');
      assert.equal(cookie.options.maxAge, 0);
      assert.equal(cookie.options.path, '/');
    }
  }
});

test('invalid, missing, null, sibling-domain and spoofed forwarded origins fail before Auth/cookie mutations', async () => {
  for (const target of origins) {
    for (const source of [null, 'null', 'https://attacker.invalid', origins.find(o => o !== target), 'http://uranova.com.br', `${target}:444`, `${target}.attacker.invalid`]) {
      reset();
      const response = await POST(request(target, source, {
        referer: `${target}/auth/logout`, 'x-forwarded-host': new URL(target).host,
      }));
      assert.equal(response.status, 403);
      assert.deepEqual(await response.json(), { error: 'Ação não autorizada. Confirme sua identidade.' });
      assert.deepEqual(calls, []);
      assert.deepEqual(writes, []);
    }
  }
});

test('absent session is an idempotent same-origin logout to login without provider calls', async () => {
  reset(false);
  const response = await POST(request(origins[0]));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), `${origins[0]}/auth/login`);
  assert.deepEqual(calls, []);
  assert.deepEqual(writes, []);
});

test('Auth failure does not claim success, clear session or leak provider details', async () => {
  reset(); providerFailure = true;
  const response = await POST(request(origins[0]));
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('location'), null);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.doesNotMatch(await response.text(), /PRIVATE_PROVIDER_DETAIL|synthetic/);
  assert.deepEqual(writes, []);
});
