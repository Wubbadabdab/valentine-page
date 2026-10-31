// @ts-check
/**
 * One function per backend API call (the REAL backend).
 * js/api/mock/mock-api.js exports exactly the same functions for demo mode;
 * tests.html checks that the two lists match.
 * Endpoints follow the proposed contract (README "API contract", PENDING #1).
 * Auth (Stage 1) and quizzes (Stage 2) so far; later stages add questions,
 * bank, uploads and results.
 */
import { request } from './client.js';
import {
  adminFromApi, loginRequestToApi, quizFromApi, quizPageFromApi, quizListQueryToApi, quizCreateToApi
} from './adapters.js';

/** @typedef {import('../types.js').Admin} Admin */
/** @typedef {import('../types.js').Quiz} Quiz */
/** @typedef {import('../types.js').QuizSummary} QuizSummary */

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

// Quizzes (Stage 2) ----------------------------------------------------------------

/** @param {string} id */
const quizPath = (id) => `/admin/quizzes/${encodeURIComponent(id)}`;

/**
 * GET /admin/quizzes?q=&status=&availability=&sort=&page=&pageSize=
 * Filtering, sorting and paging happen on the server.
 * @param {{ q?: string, status?: string, availability?: string, sort?: string, page?: number, pageSize?: number }} [query]
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<import('../types.js').Page<QuizSummary>>}
 */
export async function listQuizzes(query = {}, { signal } = {}) {
  const data = await request('/admin/quizzes', { query: quizListQueryToApi(query), signal });
  return quizPageFromApi(data);
}

/**
 * GET /admin/quizzes/{id}
 * @param {string} id
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Quiz>}
 */
export async function getQuiz(id, { signal } = {}) {
  return quizFromApi(await request(quizPath(id), { signal }));
}

/**
 * POST /admin/quizzes — creates a draft and returns it.
 * @param {{ title: string }} input
 * @returns {Promise<Quiz>}
 */
export async function createQuiz(input) {
  return quizFromApi(await request('/admin/quizzes', { method: 'POST', body: quizCreateToApi(input) }));
}

/**
 * POST /admin/quizzes/{id}/publish — the server re-runs every publish check.
 * @param {string} id
 * @returns {Promise<Quiz>}
 */
export async function publishQuiz(id) {
  return quizFromApi(await request(`${quizPath(id)}/publish`, { method: 'POST' }));
}

/**
 * POST /admin/quizzes/{id}/unpublish
 * @param {string} id
 * @returns {Promise<Quiz>}
 */
export async function unpublishQuiz(id) {
  return quizFromApi(await request(`${quizPath(id)}/unpublish`, { method: 'POST' }));
}

/**
 * POST /admin/quizzes/{id}/archive
 * @param {string} id
 * @returns {Promise<Quiz>}
 */
export async function archiveQuiz(id) {
  return quizFromApi(await request(`${quizPath(id)}/archive`, { method: 'POST' }));
}

/**
 * POST /admin/quizzes/{id}/restore
 * @param {string} id
 * @returns {Promise<Quiz>}
 */
export async function restoreQuiz(id) {
  return quizFromApi(await request(`${quizPath(id)}/restore`, { method: 'POST' }));
}

/**
 * DELETE /admin/quizzes/{id}
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteQuiz(id) {
  await request(quizPath(id), { method: 'DELETE' });
}

/**
 * POST /admin/quizzes/{id}/duplicate — returns the new draft.
 * @param {string} id
 * @returns {Promise<Quiz>}
 */
export async function duplicateQuiz(id) {
  return quizFromApi(await request(`${quizPath(id)}/duplicate`, { method: 'POST' }));
}
