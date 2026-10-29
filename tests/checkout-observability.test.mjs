import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const url = p => pathToFileURL(`${process.cwd()}/src/${p}.ts`).href;
let fail, product, profile, session, entries, calls, dbError;
const trip = stage => { if (fail?.stage === stage) throw fail.error; };
mock.module(url('lib/security/staging-policy'), { namedExports: {
  integrationUnavailable: () => null, authStagingEnabled() {},
} });
mock.module(url('lib/finance/access'), { namedExports: {
  async requireFinanceUser() { trip('AUTH'); return { id: 'customer-private', email: 'private@example.invalid' }; },
} });
mock.module(url('lib/supabase/admin'), { namedExports: { admin: {
  async rpc() { trip('RATE_LIMIT'); return { data: { allowed: true, retry_after: 0 }, error: null }; },
  from(table) { return {
    select() { return this; }, eq() { return this; },
    async single() { trip(table === 'products_checkout' ? 'CHECKOUT_READ' : 'PRODUCER_READ');
      return { data: table === 'products_checkout' ? product : profile, error: dbError }; },
  }; },
} } });
mock.module(url('lib/services/payment-processor'), { namedExports: {
  async assertDirectChargeAccount() { trip('CONNECT_VALIDATION'); },
} });
mock.module(url('lib/stripe'), { namedExports: {
  assertStripeLive() { trip('STRIPE_CONFIG'); },
  stripe: { checkout: { sessions: { async create(payload, options) {
    calls.push({ payload, options }); trip('SESSION_CREATE'); return session;
  } } } },
} });
const { POST } = await import('../src/app/api/stripe/checkout/route.ts');
const { logCheckoutFailure } = await import('../src/lib/security/checkout-observability.ts');
const { RateLimitError } = await import('../src/lib/security/rate-limit.ts');
mock.method(console, 'error', entry => entries.push({ level: 'error', ...entry }));
mock.method(console, 'warn', entry => entries.push({ level: 'warn', ...entry }));
const request = (origin = 'https://uranova.com.br', body = { checkoutSlug: 'private-slug' }) => new Request('https://uranova.com.br/api/stripe/checkout', {
  method: 'POST', headers: { origin, 'content-type': 'application/json', cookie: 'secret-cookie' }, body: JSON.stringify(body),
});
beforeEach(() => {
  fail = null; dbError = null; entries = []; calls = [];
  product = { id: 'checkout-private', product_id: 'product-private', user_id: 'seller-private', title: 'private-title', checkout_slug: 'private-slug', price: '50', is_active: true, status: 'active' };
  profile = { stripe_account_id: 'acct_private' };
  session = { livemode: true, url: 'https://checkout.stripe.com/private-session', lastResponse: { requestId: 'req_12345678' } };
  process.env.NEXT_PUBLIC_SITE_URL = 'https://uranova.com.br';
});

test('each throwing dependency identifies its stage and keeps generic 503 response', async () => {
  for (const stage of ['AUTH', 'RATE_LIMIT', 'STRIPE_CONFIG', 'CHECKOUT_READ', 'PRODUCER_READ', 'CONNECT_VALIDATION', 'SESSION_CREATE']) {
    entries = []; fail = { stage, error: Error('private-provider-detail') };
    const response = await POST(request());
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'Operação indisponível. Tente novamente ou procure o suporte.' });
    assert.equal(entries.length, 1); assert.equal(entries[0].stage, stage);
    assert.doesNotMatch(JSON.stringify(entries), /private/);
  }
});

test('Connect and session Stripe errors expose only allowed code and validated request ID', async () => {
  for (const stage of ['CONNECT_VALIDATION', 'SESSION_CREATE']) {
    entries = []; fail = { stage, error: Object.assign(Error('sk_live_SECRET private@example.invalid'), {
      type: 'StripeInvalidRequestError', code: 'resource_missing', requestId: 'req_ABCDEFGH1234',
      raw: { account: 'acct_private', token: 'secret-token' }, url: session.url,
    }) };
    assert.equal((await POST(request())).status, 503);
    assert.deepEqual(entries, [{ level: 'error', stage, category: 'STRIPE_ERROR', status: 503, stripeCode: 'resource_missing', stripeRequestId: 'req_ABCDEFGH1234' }]);
  }
});

test('missing session URL or non-live session keeps 503 and identifies response validation', async () => {
  for (const invalid of [{ ...session, url: null }, { ...session, livemode: false }]) {
    entries = []; session = invalid;
    assert.equal((await POST(request())).status, 503);
    assert.equal(entries[0].stage, 'SESSION_URL_VALIDATION');
    assert.equal(entries[0].stripeRequestId, 'req_12345678');
  }
});

test('expected Origin, auth, input, unavailable product, missing Connect and rate rejections retain status', async () => {
  const cases = [
    { stage: 'ORIGIN', status: 403, req: () => request('https://evil.invalid') },
    { stage: 'AUTH', status: 401, error: Error('UNAUTHENTICATED') },
    { stage: 'RATE_LIMIT', status: 429, error: new RateLimitError(10) },
    { stage: 'REQUEST_VALIDATION', status: 400, req: () => request(undefined, { checkoutSlug: '' }) },
    { stage: 'CHECKOUT_READ', status: 404, setup: () => { product.is_active = false; } },
    { stage: 'PRODUCER_READ', status: 409, setup: () => { profile.stripe_account_id = null; } },
  ];
  for (const c of cases) {
    entries = []; fail = c.error ? { stage: c.stage, error: c.error } : null;
    product.is_active = true; profile.stripe_account_id = 'acct_private'; c.setup?.();
    const response = await POST(c.req ? c.req() : request());
    assert.equal(response.status, c.status);
    assert.equal(entries[0].stage, c.stage);
    assert.equal(entries[0].category, 'EXPECTED_REJECTION');
    assert.equal(entries[0].level, 'warn');
    if (c.status === 429) assert.equal(response.headers.get('retry-after'), '10');
  }
  assert.equal(calls.length, 0);
});

test('price and Connect business validation are warnings while preserving existing 503', async () => {
  product.price = '-1';
  assert.equal((await POST(request())).status, 503);
  assert.equal(entries[0].stage, 'PRICE_VALIDATION'); assert.equal(entries[0].level, 'warn');
  entries = []; product.price = '50';
  fail = { stage: 'CONNECT_VALIDATION', error: Error('Conta Connect incompatível: taxas precisam ser cobradas do produtor.') };
  assert.equal((await POST(request())).status, 503);
  assert.equal(entries[0].level, 'warn');
});

test('invalid base URL and database errors remain distinguishable without changing responses', async () => {
  process.env.NEXT_PUBLIC_SITE_URL = 'http://invalid.example';
  assert.equal((await POST(request())).status, 503);
  assert.equal(entries[0].stage, 'URL_VALIDATION');
  entries = []; dbError = { code: 'database_private', message: 'secret' };
  assert.equal((await POST(request())).status, 404);
  assert.equal(entries[0].category, 'DEPENDENCY_ERROR');
});

test('unknown codes, malformed IDs, messages, cookies, URLs and raw payloads never reach logs', () => {
  logCheckoutFailure('SESSION_CREATE', 503, { type: 'StripeAPIError', code: 'sk_live_SECRET', requestId: 'req_valid123\nsecret', message: 'private', raw: { token: 'secret' } });
  assert.deepEqual(entries, [{ level: 'error', stage: 'SESSION_CREATE', category: 'STRIPE_ERROR', status: 503 }]);
  entries = [];
  logCheckoutFailure('SESSION_CREATE', 503, { get type() { throw Error('secret'); }, toJSON() { throw Error('secret'); } });
  assert.doesNotMatch(JSON.stringify(entries), /secret|private/);
});

test('successful checkout keeps payload, fee, Connect context and redirect URL with no failure logs', async () => {
  const response = await POST(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, url: session.url });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].payload.line_items[0].price_data.unit_amount, 5000);
  assert.equal(calls[0].payload.line_items[0].price_data.currency, 'brl');
  assert.equal(calls[0].payload.payment_intent_data.application_fee_amount, 500);
  assert.equal(calls[0].options.stripeAccount, 'acct_private');
  assert.deepEqual(entries, []);
});

test('logging infrastructure failure cannot change the public checkout response', async () => {
  fail = { stage: 'SESSION_CREATE', error: Error('private-provider-error') };
  const brokenLogger = mock.method(console, 'error', () => { throw Error('logger unavailable'); });
  try {
    const response = await POST(request());
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'Operação indisponível. Tente novamente ou procure o suporte.' });
  } finally { brokenLogger.mock.restore(); }
});
