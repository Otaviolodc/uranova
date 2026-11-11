import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { protectPrivateSession } from '../src/lib/security/private-session.ts';

let user = { id: 'account-a' }, authError = null;
mock.module(pathToFileURL(`${process.cwd()}/src/lib/supabase/server.ts`).href, { namedExports: {
  async createClient() { return { auth: { async getUser() { return { data: { user }, error: authError }; } } }; },
} });
const { GET } = await import('../src/app/auth/session/route.ts');
test('session endpoint validates identity, denies anonymous/errors and never caches', async () => {
  for (const [identity, error, status] of [[{ id: 'account-a' }, null, 200], [null, null, 401], [{ id: 'account-a' }, {}, 401]]) {
    user = identity; authError = error;
    const response = await GET();
    assert.equal(response.status, status);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.deepEqual(await response.json(), { userId: status === 200 ? 'account-a' : null });
  }
});

test('private UI hides before snapshot; BFCache reloads without revealing old data; cross-tab and identity isolation', async () => {
  const win = new EventTarget(), doc = new EventTarget();
  const redirects = []; let reloads = 0, reply = 'account-a', pending;
  win.location = { replace: path => redirects.push(path), reload: () => reloads++ };
  win.setInterval = () => 1; win.clearInterval = () => {};
  doc.visibilityState = 'visible';
  globalThis.window = win;
  globalThis.document = doc;
  mock.method(globalThis, 'fetch', async () => pending ? await pending : Response.json({ userId: reply }));
  const flush = () => new Promise(resolve => setImmediate(resolve));
  const root = { style: { display: 'none' }, inert: true };
  let dispose = protectPrivateSession(root, 'account-a');
  await flush(); assert.equal(root.style.display, 'contents');
  win.dispatchEvent(new Event('pagehide'));
  assert.equal(root.style.display, 'none'); assert.equal(root.inert, true);
  const restored = new Event('pageshow'); restored.persisted = true;
  win.dispatchEvent(restored);
  assert.equal(reloads, 1); assert.equal(root.style.display, 'none');
  dispose();
  reply = 'account-b'; dispose = protectPrivateSession(root, 'account-a');
  await flush(); assert.equal(root.style.display, 'none'); assert.equal(redirects.at(-1), '/auth/login'); dispose();
  let resolve;
  pending = new Promise(r => { resolve = r; });
  dispose = protectPrivateSession(root, 'account-a');
  const logout = new Event('storage'); logout.key = 'uranova:logout'; win.dispatchEvent(logout);
  resolve(Response.json({ userId: 'account-a' })); await flush();
  assert.equal(root.style.display, 'none', 'in-flight validation must not reopen UI after logout'); dispose();
});
