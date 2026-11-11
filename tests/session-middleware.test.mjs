import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';
let identity = null, error = null;
mock.module('@supabase/ssr', { namedExports: { createServerClient(_url, _key, options) {
  return { auth: {
    async getUser() {
      options.cookies.setAll([{ name: 'sb-test-auth-token', value: '', options: { path: '/', maxAge: 0 } }]);
      return { data: { user: identity }, error };
    },
    async getClaims() { return { data: null, error: null }; },
  } };
} } });
mock.module(pathToFileURL(`${process.cwd()}/src/lib/security/staging-policy.ts`).href, { namedExports: { authStagingEnabled() {} } });
const { updateSession } = await import('../src/lib/supabase/middleware.ts');
test('every protected namespace rejects missing/invalid users and preserves SDK cookie deletions on redirect', async () => {
  for (const path of ['/dashboard', '/dashboard/profile', '/dashboard/finance', '/dashboard/customer/products', '/admin/users', '/checkout/success']) {
    identity = null;
    const response = await updateSession(new NextRequest('https://example.invalid' + path));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('location'), 'https://example.invalid/auth/login');
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.cookies.get('sb-test-auth-token').value, '');
    assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
  }
  identity = { id: 'account-a' }; error = {};
  assert.equal((await updateSession(new NextRequest('https://example.invalid/dashboard'))).status, 307);
  error = null;
  assert.equal((await updateSession(new NextRequest('https://example.invalid/dashboard'))).status, 200);
});
