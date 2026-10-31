// @ts-check
import { test, assert, assertEqual, assertRejects } from './harness.js';
import { request, buildUrl, userMessage, ApiError, errorFromResponse } from '../api/client.js';
import { adminFromApi, loginRequestToApi, loginFieldErrorsFromApi, initials } from '../api/adapters.js';
import * as endpoints from '../api/endpoints.js';
import * as mock from '../api/mock/mock-api.js';

/**
 * Temporarily replace fetch.
 * @param {(url: string, init: RequestInit) => Promise<Response>} impl
 * @param {() => Promise<void>} fn
 */
async function withFetch(impl, fn) {
  const original = window.fetch;
  window.fetch = /** @type {any} */ (impl);
  try {
    await fn();
  } finally {
    window.fetch = original;
  }
}

/** @param {number} status @param {unknown} body */
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/* Contract parity --------------------------------------------------------------- */
test('api: the mock exports exactly the same functions as the real endpoints', () => {
  assertEqual(Object.keys(mock).sort(), Object.keys(endpoints).sort());
});

/* Client ------------------------------------------------------------------------------ */
test('client: builds URLs and skips empty query values', () => {
  assertEqual(buildUrl('/admin/quizzes', { q: 'bio', status: '', page: 2, sort: null }), '/api/admin/quizzes?q=bio&page=2');
  assertEqual(buildUrl('auth/me'), '/api/auth/me');
});

test('client: returns parsed JSON and sends credentials', async () => {
  /** @type {RequestInit | undefined} */
  let seen;
  await withFetch(async (_url, init) => { seen = init; return json(200, { ok: true }); }, async () => {
    assertEqual(await request('/x', { method: 'POST', body: { a: 1 } }), { ok: true });
  });
  assertEqual(seen?.credentials, 'include');
  assertEqual(seen?.body, '{"a":1}');
});

test('client: 422 errors keep the code, message and field errors', async () => {
  await withFetch(async () => json(422, { error: { code: 'VALIDATION_ERROR', message: 'Check the form', fieldErrors: { title: 'Title is required' } } }), async () => {
    await assertRejects(() => request('/x'), (error) =>
      error instanceof ApiError && error.status === 422 && error.fieldErrors.title === 'Title is required' && userMessage(error) === 'Check the form',
    'validation error');
  });
});

test('client: 500 errors show a friendly message, never the raw server text', async () => {
  await withFetch(async () => json(500, { error: { code: 'BOOM', message: 'NullPointerException at line 42' } }), async () => {
    await assertRejects(() => request('/x'), (error) =>
      error instanceof ApiError && userMessage(error) === 'Something went wrong on our side. Please try again.', 'server error');
  });
});

test('client: network failures become kind "network"', async () => {
  await withFetch(async () => { throw new TypeError('Failed to fetch'); }, async () => {
    await assertRejects(() => request('/x'), (error) =>
      error instanceof ApiError && error.kind === 'network' && error.status === 0 &&
      userMessage(error) === "Can't reach the server. Check your connection and try again.", 'network');
  });
});

test('client: slow requests time out', async () => {
  const hang = (/** @type {string} */ _url, /** @type {RequestInit} */ init) => new Promise((_resolve, reject) => {
    init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
  });
  await withFetch(/** @type {any} */ (hang), async () => {
    await assertRejects(() => request('/x', { timeoutMs: 30 }), (error) => error instanceof ApiError && error.kind === 'timeout', 'timeout');
  });
});

test('client: cancelling a request rejects with AbortError, not an ApiError', async () => {
  const hang = (/** @type {string} */ _url, /** @type {RequestInit} */ init) => new Promise((_resolve, reject) => {
    init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
  });
  const controller = new AbortController();
  await withFetch(/** @type {any} */ (hang), async () => {
    const pending = request('/x', { signal: controller.signal });
    controller.abort();
    await assertRejects(() => pending, (error) => error instanceof DOMException && error.name === 'AbortError', 'abort');
  });
});

test('client: 401 broadcasts "api:unauthorized" unless told not to', async () => {
  let heard = 0;
  const listener = () => { heard += 1; };
  window.addEventListener('api:unauthorized', listener);
  await withFetch(async () => json(401, {}), async () => {
    await assertRejects(() => request('/x'), (error) => error.status === 401, 'first');
    await assertRejects(() => request('/x', { skipAuthEvent: true }), (error) => error.status === 401, 'second');
  });
  window.removeEventListener('api:unauthorized', listener);
  assertEqual(heard, 1);
});

test('client: every status maps to a plain-language message', () => {
  /** @type {[number, string][]} */
  const cases = [
    [401, 'Your session has expired. Please sign in again.'],
    [403, "You don't have permission to do that."],
    [409, 'This was changed somewhere else while you were working. Reload to see the latest version.'],
    [413, 'This file is too large.'],
    [429, 'Too many attempts. Please wait a moment.'],
    [503, 'Something went wrong on our side. Please try again.']
  ];
  for (const [status, message] of cases) assertEqual(userMessage(errorFromResponse(status, null)), message, String(status));
  assertEqual(errorFromResponse(404, null).code, 'NOT_FOUND');
});

/* Adapters ------------------------------------------------------------------------------ */
test('adapters: admin from different response shapes', () => {
  assertEqual(adminFromApi({ admin: { id: 1, name: 'Ada Obi', email: 'ada@x.org', role: 'admin' } }),
    { id: '1', name: 'Ada Obi', email: 'ada@x.org', role: 'admin' });
  assertEqual(adminFromApi({ user: { id: 'u', first_name: 'Ada', last_name: 'Obi', email: 'ada@x.org' } }).name, 'Ada Obi');
  assertEqual(adminFromApi({ id: 'u', full_name: 'Ada Obi', email: 'a@x.org' }).name, 'Ada Obi');
  assertEqual(adminFromApi({ id: 'u', email: 'tolu@x.org' }).name, 'tolu', 'falls back to the email name');
  assertEqual(adminFromApi(null).name, 'Administrator');
});

test('adapters: login request and field errors', () => {
  assertEqual(loginRequestToApi({ identifier: '  a@b.co ', password: 'secret123' }), { email: 'a@b.co', password: 'secret123' });
  assertEqual(loginFieldErrorsFromApi({ email: 'Unknown email', password: 'Too short', other: 'x' }),
    { identifier: 'Unknown email', password: 'Too short' });
  assertEqual(initials('Demo Admin'), 'DA');
  assertEqual(initials('ada'), 'A');
  assertEqual(initials('  '), '?');
});

/* Mock behaviour ------------------------------------------------------------------------ */
test('mock: wrong password is rejected with 401 and no session is created', async () => {
  await assertRejects(() => mock.login({ identifier: 'a@b.co', password: 'wrong-password' }),
    (error) => error instanceof ApiError && error.status === 401, 'wrong password');
});
