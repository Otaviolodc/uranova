import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const url = p => pathToFileURL(`${process.cwd()}/src/${p}.ts`).href;
const user = { id: '10000000-0000-4000-8000-000000000001' };
let authenticated = true, uploads = [], signouts = 0, clients = 0;
let logoutError = null, uploadError = null;
let verdict = { allowed: true, retry_after: 0 }, rpcError = null;
const ownerFilters = [];
mock.module(url('lib/supabase/server'), { namedExports: {
  async createClient() {
    clients++;
    return {
      auth: { async signOut() { signouts++; return { error: logoutError }; } },
      from(table) {
        assert.ok(['products', 'course_modules'].includes(table));
        return {
          select() { return this; },
          eq(key, value) { ownerFilters.push([table, key, value]); return this; },
          async single() { return { data: null, error: null }; },
          insert() { assert.fail('No write is allowed when the parent is not owned'); },
        };
      },
    };
  },
} });
mock.module(url('lib/finance/access'), { namedExports: {
  async requireFinanceUser() { if (!authenticated) throw Error('UNAUTHENTICATED'); return user; },
} });
mock.module(url('lib/security/staging-policy'), { namedExports: {
  integrationUnavailable() { return null; }, authStagingEnabled() {},
} });
mock.module(url('lib/supabase/admin'), { namedExports: { admin: {
  async rpc(name, args) {
    assert.equal(name, 'phase_a1_consume_rate_limit');
    assert.equal(args.p_scope, 'upload');
    return { data: verdict, error: rpcError };
  },
  storage: { from(bucket) { return {
    async upload(path, bytes, options) { uploads.push({ bucket, path, bytes, options }); return { error: uploadError }; },
    getPublicUrl(path) { return { data: { publicUrl: `https://media.invalid/${path}` } }; },
  }; } },
} } });
const { GET: logoutPage, POST: logout } = await import('../src/app/auth/logout/route.ts');
const { POST: upload } = await import('../src/app/api/files/upload/route.ts');
const { POST: createModule } = await import('../src/app/api/course-modules/route.ts');
const { POST: createLesson } = await import('../src/app/api/course-lessons/route.ts');
const origin = 'https://example.invalid';
const logoutRequest = (source = origin) => new Request(`${origin}/auth/logout`, {
  method: 'POST', headers: source === null ? {} : { origin: source },
});
async function uploadRequest({ bucket = 'products', filename = '../other/secret.html', extra, length, bytes = '%PDF-1.7', source = origin } = {}) {
  const form = new FormData();
  form.append('bucket', bucket);
  form.append('file', new Blob([bytes], { type: 'text/html' }), filename);
  extra?.(form);
  const encoded = new Response(form);
  const body = await encoded.arrayBuffer();
  return new Request(`${origin}/api/files/upload`, { method: 'POST', body, headers: {
    origin: source, 'content-type': encoded.headers.get('content-type'),
    'content-length': length ?? String(body.byteLength),
  } });
}

test('P6: logout GET is a no-store confirmation with no session mutation', async () => {
  const before = clients;
  const response = await logoutPage();
  assert.equal(response.status, 200);
  assert.equal(clients, before);
  assert.equal(signouts, 0);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-security-policy'), /form-action 'self'/);
  assert.match(await response.text(), /method="post" action="\/auth\/logout"/);
});
test('P6: logout rejects cross-origin and absent Origin before touching session', async () => {
  const before = clients;
  for (const source of ['https://attacker.invalid', null, 'null']) assert.equal((await logout(logoutRequest(source))).status, 403);
  assert.equal(clients, before);
});
test('P6: same-origin logout redirects with 303; failures hide provider details', async () => {
  const response = await logout(logoutRequest());
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), `${origin}/auth/login`);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(signouts, 1);
  logoutError = { message: 'SYNTHETIC_PRIVATE_PROVIDER_DETAIL' };
  const failed = await logout(logoutRequest());
  assert.equal(failed.status, 503);
  assert.doesNotMatch(await failed.text(), /SYNTHETIC_PRIVATE|stack/i);
  logoutError = null;
});
test('P6: upload requires authenticated user and same origin', async () => {
  uploads = [];
  authenticated = false;
  assert.equal((await upload(await uploadRequest())).status, 401);
  authenticated = true;
  assert.equal((await upload(await uploadRequest({ source: 'https://attacker.invalid' }))).status, 403);
  assert.equal(uploads.length, 0);
});
test('P6: upload rejects ambiguous fields, caller paths, invalid lengths and buckets before Storage', async () => {
  uploads = [];
  for (const extra of [f => f.append('bucket', 'avatars'), f => f.append('file', new Blob(['%PDF-1.7']), 'two.pdf'), f => f.append('path', '../other/file.pdf')]) {
    assert.equal((await upload(await uploadRequest({ extra }))).status, 400);
  }
  for (const length of ['-1', '1.5', '0', 'NaN', String(4 * 1024 * 1024 + 1)]) assert.equal((await upload(await uploadRequest({ length }))).status, 400);
  assert.equal((await upload(await uploadRequest({ bucket: 'unknown' }))).status, 400);
  assert.equal(uploads.length, 0);
});
test('P6: actual stream limit defeats a false small Content-Length', async () => {
  uploads = [];
  const response = await upload(await uploadRequest({ bytes: 'x'.repeat(4 * 1024 * 1024 + 1), length: '1' }));
  assert.equal(response.status, 400);
  assert.equal(uploads.length, 0);
});
test('P6: upload ignores client filename/MIME, uses owner UUID paths and never overwrites', async () => {
  uploads = [];
  const responses = [await upload(await uploadRequest()), await upload(await uploadRequest())];
  for (const response of responses) {
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal((await response.json()).url, null);
  }
  assert.equal(uploads.length, 2);
  assert.notEqual(uploads[0].path, uploads[1].path);
  for (const record of uploads) {
    assert.match(record.path, new RegExp(`^${user.id}/[a-f0-9-]{36}\\.pdf$`));
    assert.deepEqual(record.options, { upsert: false, contentType: 'application/pdf', metadata: { uploaded_by: user.id } });
  }
});
test('P6: public buckets reject active HTML/SVG content and private upload errors stay generic', async () => {
  uploads = [];
  for (const bytes of ['<html>script</html>', '<svg></svg>', '%PDF-1.7']) assert.equal((await upload(await uploadRequest({ bucket: 'avatars', bytes }))).status, 400);
  assert.equal(uploads.length, 0);
  uploadError = { message: 'SYNTHETIC_PRIVATE_STORAGE_DETAIL' };
  const response = await upload(await uploadRequest());
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /SYNTHETIC_PRIVATE|stack/i);
  uploadError = null;
});
test('P6: repeated uploads honor shared quota; malformed or unavailable limiter fails closed', async () => {
  uploads = [];
  verdict = { allowed: false, retry_after: 45 };
  for (let i = 0; i < 2; i++) {
    const response = await upload(await uploadRequest());
    assert.equal(response.status, 429);
    assert.equal(response.headers.get('retry-after'), '45');
  }
  for (const value of [null, {}, { allowed: 'true', retry_after: 0 }]) {
    verdict = value;
    assert.equal((await upload(await uploadRequest())).status, 503);
  }
  verdict = { allowed: true, retry_after: 0 }; rpcError = { message: 'SYNTHETIC_PRIVATE_RPC_DETAIL' };
  assert.equal((await upload(await uploadRequest())).status, 503);
  rpcError = null;
  assert.equal(uploads.length, 0);
});
test('P6: cross-producer module and lesson creation filters parent by authenticated owner before any write', async () => {
  const otherId = '20000000-0000-4000-8000-000000000002';
  for (const [handler, field, table] of [[createModule, 'courseId', 'products'], [createLesson, 'moduleId', 'course_modules']]) {
    ownerFilters.length = 0;
    const request = body => new Request(`${origin}/api/course-modules`, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const response = await handler(request({ [field]: otherId, title: 'Synthetic lesson' }));
    assert.equal(response.status, 403);
    assert.deepEqual(ownerFilters, [[table, 'id', otherId], [table, 'user_id', user.id]]);
    assert.equal((await handler(request({ [field]: '../invalid', title: 'Synthetic lesson' }))).status, 400);
    assert.equal((await handler(request({ [field]: otherId, title: 'Synthetic lesson', user_id: otherId }))).status, 400);
    authenticated = false;
    assert.equal((await handler(request({ [field]: otherId, title: 'Synthetic lesson' }))).status, 401);
    authenticated = true;
  }
});
