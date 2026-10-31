// @ts-check
/**
 * The ONE network wrapper. Every API call in the admin site goes through
 * request(): base URL, credentials, JSON, timeouts, cancellation and error
 * normalization all live here. Page and component code never calls fetch().
 */
import { CONFIG } from '../config.js';

/** @typedef {import('../types.js').ApiErrorShape} ApiErrorShape */

/** A normalized API failure. `status` is 0 for network failures and timeouts. */
export class ApiError extends Error {
  /** @param {Partial<ApiErrorShape>} shape */
  constructor({ status = 0, code = 'UNKNOWN', message = '', fieldErrors = {}, kind = 'http' } = {}) {
    super(message || code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    /** @type {ApiErrorShape['kind']} */
    this.kind = kind;
  }
}

/**
 * True when a request was cancelled on purpose (e.g. a newer search replaced it).
 * @param {unknown} error
 */
export function isAbortError(error) {
  return error instanceof DOMException && error.name === 'AbortError';
}

/**
 * @typedef {Object} RequestOptions
 * @property {string} [method]
 * @property {unknown} [body]                    Sent as JSON
 * @property {Record<string, string | number | boolean | null | undefined>} [query]
 * @property {AbortSignal} [signal]              Cancel from the caller
 * @property {number} [timeoutMs]
 * @property {boolean} [skipAuthEvent]           Don't broadcast 401s (login, session checks)
 */

/**
 * @param {string} path   e.g. "/admin/quizzes"
 * @param {RequestOptions} [options]
 * @returns {Promise<any>} parsed JSON, or null for empty responses
 */
export async function request(path, options = {}) {
  const { method = 'GET', body, query, signal, timeoutMs = CONFIG.REQUEST_TIMEOUT_MS, skipAuthEvent = false } = options;
  const url = buildUrl(path, query);

  /** @type {Record<string, string>} */
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const csrf = method !== 'GET' ? readCsrfToken() : null;
  if (csrf) headers[CONFIG.AUTH.csrfHeaderName] = csrf;

  // One controller for both the caller's cancel and our timeout.
  const controller = new AbortController();
  let timedOut = false;
  const timer = window.setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  const onCallerAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', onCallerAbort, { once: true });
  }

  /** @type {Response} */
  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include', // PENDING #1: cookie sessions (default)
      signal: controller.signal
    });
  } catch (error) {
    if (timedOut) throw debugLog(new ApiError({ code: 'TIMEOUT', kind: 'timeout', message: 'The request timed out' }), error);
    if (signal?.aborted) throw new DOMException('Request cancelled', 'AbortError');
    throw debugLog(new ApiError({ code: 'NETWORK_ERROR', kind: 'network', message: 'Network request failed' }), error);
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', onCallerAbort);
  }

  const data = await readBody(response);
  if (response.ok) return data;

  const error = errorFromResponse(response.status, data);
  if (response.status === 401 && !skipAuthEvent) {
    window.dispatchEvent(new CustomEvent('api:unauthorized', { detail: { path } }));
  }
  throw debugLog(error, data);
}

/**
 * Build an ApiError from a status code and the contract's error body:
 * { "error": { "code", "message", "fieldErrors" } }
 * @param {number} status
 * @param {any} data
 */
export function errorFromResponse(status, data) {
  const body = data && typeof data === 'object' && data.error && typeof data.error === 'object' ? data.error : {};
  return new ApiError({
    status,
    code: typeof body.code === 'string' ? body.code : defaultCode(status),
    message: typeof body.message === 'string' ? body.message : '',
    fieldErrors: body.fieldErrors && typeof body.fieldErrors === 'object' ? body.fieldErrors : {},
    kind: 'http'
  });
}

/** @param {number} status */
function defaultCode(status) {
  if (status === 400 || status === 422) return 'VALIDATION_ERROR';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 413) return 'PAYLOAD_TOO_LARGE';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'SERVER_ERROR';
  return 'HTTP_ERROR';
}

/**
 * A short, plain-language message that tells the admin what to do next.
 * Raw technical details never reach the screen (see DEBUG for the console).
 * @param {unknown} error
 * @returns {string}
 */
export function userMessage(error) {
  if (!(error instanceof ApiError)) return 'Something went wrong. Please try again.';
  if (error.kind === 'network') return "Can't reach the server. Check your connection and try again.";
  if (error.kind === 'timeout') return 'The server took too long to respond. Please try again.';
  const { status } = error;
  if (status === 400 || status === 422) return error.message || 'Some details need fixing. Check the highlighted fields.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find that. It may have been moved or deleted.";
  if (status === 409) return 'This was changed somewhere else while you were working. Reload to see the latest version.';
  if (status === 413) return 'This file is too large.';
  if (status === 429) return 'Too many attempts. Please wait a moment.';
  if (status >= 500) return 'Something went wrong on our side. Please try again.';
  return 'Something went wrong. Please try again.';
}

/**
 * @param {string} path
 * @param {RequestOptions['query']} [query]
 */
export function buildUrl(path, query) {
  const base = CONFIG.API_BASE_URL.replace(/\/+$/, '');
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (value === null || value === undefined || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return `${base}${path.startsWith('/') ? path : `/${path}`}${qs ? `?${qs}` : ''}`;
}

/** @param {Response} response */
async function readBody(response) {
  if (response.status === 204) return null;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('json')) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function readCsrfToken() {
  const name = CONFIG.AUTH.csrfCookieName;
  if (!name) return null;
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/**
 * @param {ApiError} error
 * @param {unknown} detail
 */
function debugLog(error, detail) {
  if (CONFIG.DEBUG) console.warn('[api]', error.status, error.code, detail);
  return error;
}
