// @ts-check
/**
 * One function per backend API call (the REAL backend).
 * js/api/mock/mock-api.js exports exactly the same functions for demo mode;
 * tests.html checks that the two lists match.
 * Endpoints follow the proposed contract (README "API contract", PENDING #1).
 * Stage 1 covers auth; later stages add quizzes, questions, bank, uploads and results.
 */
import { request } from './client.js';
import { adminFromApi, loginRequestToApi } from './adapters.js';

/** @typedef {import('../types.js').Admin} Admin */

/**
 * POST /auth/login
 * @param {{ identifier: string, password: string }} credentials
 * @returns {Promise<Admin>}
 */
export async function login(credentials) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: loginRequestToApi(credentials),
    skipAuthEvent: true
  });
  return adminFromApi(data);
}

/**
 * POST /auth/logout
 * @returns {Promise<void>}
 */
export async function logout() {
  await request('/auth/logout', { method: 'POST', skipAuthEvent: true });
}

/**
 * GET /auth/me — the session check every protected page runs on load.
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Admin>}
 */
export async function getMe({ signal } = {}) {
  const data = await request('/auth/me', { signal, skipAuthEvent: true });
  return adminFromApi(data);
}
