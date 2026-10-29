// @ts-check
/**
 * DEMO MODE ONLY — a stand-in for the backend while it is being built.
 * Exports exactly the same functions as js/api/endpoints.js.
 *
 * This is NOT security and NOT real saving:
 * - Mock login accepts any email with any password of 8+ characters.
 * - The demo "session" is a flag in this browser's localStorage.
 * The real backend enforces sign-in, permissions and storage.
 */
import { CONFIG } from '../../config.js';
import { ApiError } from '../client.js';
import { adminFromApi } from '../adapters.js';
import { DEMO_ADMIN, DEMO_ERROR_PASSWORDS } from './mock-data.js';

/** @typedef {import('../../types.js').Admin} Admin */

const SESSION_KEY = 'jci-mock:session';

/** Simulated network delay so loading states are visible. */
function delay(min = CONFIG.MOCK.minDelayMs, max = CONFIG.MOCK.maxDelayMs) {
  return new Promise((resolve) => window.setTimeout(resolve, min + Math.random() * (max - min)));
}

function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** @param {unknown} value */
function writeSession(value) {
  try {
    if (value === null) window.localStorage.removeItem(SESSION_KEY);
    else window.localStorage.setItem(SESSION_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable: the demo session simply won't persist */
  }
}

/**
 * Same error format as the real backend's responses.
 * @param {number} status
 * @param {string} code
 * @param {string} message
 * @param {Record<string, string>} [fieldErrors]
 */
function fail(status, code, message, fieldErrors = {}) {
  return new ApiError({ status, code, message, fieldErrors, kind: 'http' });
}

/**
 * @param {{ identifier: string, password: string }} credentials
 * @returns {Promise<Admin>}
 */
export async function login({ identifier, password }) {
  await delay();
  if (password === DEMO_ERROR_PASSWORDS.networkFailure) {
    throw new ApiError({ code: 'NETWORK_ERROR', kind: 'network', message: 'Simulated network failure' });
  }
  if (password === DEMO_ERROR_PASSWORDS.tooManyAttempts) throw fail(429, 'RATE_LIMITED', 'Too many attempts');
  if (password === DEMO_ERROR_PASSWORDS.serverError) throw fail(500, 'SERVER_ERROR', 'Simulated server error');
  if (password === DEMO_ERROR_PASSWORDS.wrongCredentials || password.length < 8) {
    throw fail(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }
  const admin = { ...DEMO_ADMIN, email: identifier.includes('@') ? identifier.trim() : DEMO_ADMIN.email };
  writeSession({ admin });
  return adminFromApi({ admin });
}

/** @returns {Promise<void>} */
export async function logout() {
  await delay(150, 350);
  writeSession(null);
}

/**
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Admin>}
 */
export async function getMe({ signal } = {}) {
  await delay(120, 320);
  if (signal?.aborted) throw new DOMException('Request cancelled', 'AbortError');
  const session = readSession();
  if (!session) throw fail(401, 'UNAUTHORIZED', 'Not signed in');
  return adminFromApi(session);
}
