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
import {
  adminFromApi, quizFromApi, quizPageFromApi, quizListQueryToApi, quizCreateToApi,
  DEFAULT_SETTINGS, DEFAULT_APPEARANCE
} from '../adapters.js';
import { DEMO_ADMIN, DEMO_ERROR_PASSWORDS, DEMO_LIST_ERRORS } from './mock-data.js';
import { loadQuizzes, saveQuizzes } from './mock-store.js';

/** @typedef {import('../../types.js').Admin} Admin */
/** @typedef {import('../../types.js').Quiz} Quiz */
/** @typedef {import('../../types.js').QuizSummary} QuizSummary */

const SESSION_KEY = 'jci-mock:session';

/**
 * Simulated network delay so loading states are visible. Cancelling (e.g. a
 * newer search) rejects straight away, like an aborted fetch.
 * @param {number} [min]
 * @param {number} [max]
 * @param {AbortSignal} [signal]
 * @returns {Promise<void>}
 */
function delay(min = CONFIG.MOCK.minDelayMs, max = CONFIG.MOCK.maxDelayMs, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('Request cancelled', 'AbortError'));
    };
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, min + Math.random() * (max - min));
    if (signal?.aborted) abort();
    else signal?.addEventListener('abort', abort, { once: true });
  });
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

// Quizzes (Stage 2) ----------------------------------------------------------------

function networkError() {
  return new ApiError({ code: 'NETWORK_ERROR', kind: 'network', message: 'Simulated network failure' });
}

/**
 * What the real backend would do before any admin call: no connection means
 * no answer, and no session means 401 (broadcast like client.js does).
 */
function guard() {
  if (!navigator.onLine) throw networkError();
  if (!readSession()) {
    window.dispatchEvent(new CustomEvent('api:unauthorized', { detail: { path: 'mock' } }));
    throw fail(401, 'UNAUTHORIZED', 'Not signed in');
  }
}

/** @param {any} quiz @param {number} [now] */
function availabilityOf(quiz, now = Date.now()) {
  if (quiz.status !== 'published') return null;
  const opens = quiz.settings.opensAt ? Date.parse(quiz.settings.opensAt) : null;
  const closes = quiz.settings.closesAt ? Date.parse(quiz.settings.closesAt) : null;
  if (opens !== null && opens > now) return 'scheduled';
  if (closes !== null && closes <= now) return 'closed';
  return 'open';
}

/** @param {any} quiz */
const totalMarksOf = (quiz) => quiz.questions.reduce((/** @type {number} */ sum, /** @type {any} */ q) => sum + (Number(q.marks) || 0), 0);

/** Server response for one quiz (API shape). @param {any} quiz */
function toApiQuiz(quiz) {
  return { ...quiz, availability: availabilityOf(quiz), totalMarks: totalMarksOf(quiz), questionCount: quiz.questions.length };
}

/** Server response for a list row (API shape, no questions). @param {any} quiz */
function toApiSummary(quiz) {
  const { questions, appearance, instructions, ...rest } = toApiQuiz(quiz);
  return rest;
}

/** @param {string} id */
function findQuiz(id) {
  const quiz = loadQuizzes().find((item) => item.id === id);
  if (!quiz) throw fail(404, 'NOT_FOUND', 'Quiz not found');
  return quiz;
}

/** @param {any} quiz */
function touch(quiz) {
  quiz.updatedAt = new Date().toISOString();
  quiz.version += 1;
  saveQuizzes();
}

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
}

/** @param {string} text */
const normalize = (text) => text.toLocaleLowerCase('en').replace(/\s+/g, ' ').trim();

/**
 * @param {any} a
 * @param {any} b
 * @param {string} sort  "field:asc|desc"
 */
function compareQuizzes(a, b, sort) {
  const [field, direction] = sort.split(':');
  const sign = direction === 'asc' ? 1 : -1;
  let result = 0;
  if (field === 'title') result = a.title.localeCompare(b.title, 'en', { sensitivity: 'base', numeric: true });
  else if (field === 'attemptCount') result = a.attemptCount - b.attemptCount;
  else result = Date.parse(a[field]) - Date.parse(b[field]);
  return result * sign || Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || a.id.localeCompare(b.id);
}

/**
 * GET /admin/quizzes — search, filters, sorting and paging happen "on the server".
 * @param {{ q?: string, status?: string, availability?: string, sort?: string, page?: number, pageSize?: number }} [query]
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<import('../../types.js').Page<QuizSummary>>}
 */
export async function listQuizzes(query = {}, { signal } = {}) {
  const params = quizListQueryToApi(query);
  await delay(undefined, undefined, signal);
  guard();
  const q = normalize(params.q || '');
  if (q === DEMO_LIST_ERRORS.serverError) throw fail(500, 'SERVER_ERROR', 'Simulated server error');
  if (q === DEMO_LIST_ERRORS.networkFailure) throw networkError();

  let items = loadQuizzes().map(toApiQuiz);
  items = params.status ? items.filter((quiz) => quiz.status === params.status) : items.filter((quiz) => quiz.status !== 'archived');
  if (params.availability) items = items.filter((quiz) => quiz.status === 'published' && quiz.availability === params.availability);
  if (q) items = items.filter((quiz) => normalize(`${quiz.title} ${quiz.description}`).includes(q));
  items.sort((a, b) => compareQuizzes(a, b, params.sort || 'updatedAt:desc'));

  const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || CONFIG.PAGE_SIZE_DEFAULT));
  const page = Math.max(1, Number(params.page) || 1);
  const start = (page - 1) * pageSize;
  return quizPageFromApi({
    items: items.slice(start, start + pageSize).map(toApiSummary),
    page,
    pageSize,
    total: items.length
  });
}

/**
 * GET /admin/quizzes/{id}
 * @param {string} id
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Quiz>}
 */
export async function getQuiz(id, { signal } = {}) {
  await delay(undefined, undefined, signal);
  guard();
  return quizFromApi(toApiQuiz(findQuiz(id)));
}

/**
 * POST /admin/quizzes — creates a draft.
 * @param {{ title: string }} input
 * @returns {Promise<Quiz>}
 */
export async function createQuiz(input) {
  const body = quizCreateToApi(input);
  await delay();
  guard();
  if (!body.title) throw fail(422, 'VALIDATION_ERROR', 'Check the quiz title.', { title: 'Enter a title for the quiz' });
  if (body.title.length > 120) {
    throw fail(422, 'VALIDATION_ERROR', 'Check the quiz title.', { title: `Title must be 120 characters or fewer (currently ${body.title.length})` });
  }
  const now = new Date().toISOString();
  const quiz = {
    id: newId(),
    title: body.title,
    description: '',
    instructions: '',
    status: 'draft',
    settings: { ...DEFAULT_SETTINGS },
    appearance: { ...DEFAULT_APPEARANCE },
    questions: [],
    attemptCount: 0,
    version: 1,
    createdAt: now,
    updatedAt: now,
    publishedAt: null
  };
  loadQuizzes().unshift(quiz);
  saveQuizzes();
  return quizFromApi(toApiQuiz(quiz));
}

/**
 * The server's publish checks (a subset of what Review & Publish shows).
 * @param {any} quiz
 * @returns {Record<string, string>}
 */
function publishProblems(quiz) {
  /** @type {Record<string, string>} */
  const problems = {};
  if (!String(quiz.title).trim()) problems.title = 'Add a title.';
  if (!quiz.questions.length) problems.questions = 'Add at least one question.';
  quiz.questions.forEach((/** @type {any} */ question, /** @type {number} */ index) => {
    const n = index + 1;
    if (!String(question.text).trim()) problems[`questions.${n}.text`] = `Question ${n} has no question text.`;
    if (!(Number(question.marks) > 0)) problems[`questions.${n}.marks`] = `Question ${n} needs marks above 0.`;
    if (question.type === 'multiple_choice' || question.type === 'checkboxes') {
      const options = question.options || [];
      if (options.length < 2 || options.some((/** @type {any} */ o) => !String(o.text).trim())) {
        problems[`questions.${n}.options`] = `Question ${n} needs at least 2 options, and none can be empty.`;
      }
      const correct = options.filter((/** @type {any} */ o) => o.isCorrect).length;
      if (question.type === 'multiple_choice' && correct !== 1) problems[`questions.${n}.correct`] = `Question ${n} needs exactly one correct answer.`;
      if (question.type === 'checkboxes' && correct === 0) problems[`questions.${n}.correct`] = `Question ${n} needs at least one correct answer.`;
    }
  });
  const { opensAt, closesAt } = quiz.settings;
  if (opensAt && closesAt && Date.parse(closesAt) <= Date.parse(opensAt)) problems['settings.closesAt'] = 'The close time must be after the open time.';
  else if (closesAt && Date.parse(closesAt) <= Date.now()) problems['settings.closesAt'] = 'The close time has already passed. Choose a new one in Settings.';
  return problems;
}

/**
 * POST /admin/quizzes/{id}/publish
 * @param {string} id
 * @returns {Promise<Quiz>}
 */
export async function publishQuiz(id) {
  await delay();
  guard();
  const quiz = findQuiz(id);
  if (quiz.status !== 'draft') throw fail(422, 'INVALID_STATE', 'Only drafts can be published.');
  const problems = publishProblems(quiz);
  if (Object.keys(problems).length) throw fail(422, 'PUBLISH_BLOCKED', "This quiz isn't ready to publish yet.", problems);
  quiz.status = 'published';
  quiz.publishedAt = new Date().toISOString();
  touch(quiz);
  return quizFromApi(toApiQuiz(quiz));
}

/**
 * POST /admin/quizzes/{id}/unpublish — back to Draft; attempts in progress may finish.
 * @param {string} id
 * @returns {Promise<Quiz>}
 */
export async function unpublishQuiz(id) {
  await delay();
  guard();
  const quiz = findQuiz(id);
  if (quiz.status !== 'published') throw fail(422, 'INVALID_STATE', 'Only published quizzes can be unpublished.');
  quiz.status = 'draft';
  quiz.publishedAt = null;
  touch(quiz);
  return quizFromApi(toApiQuiz(quiz));
}

/**
 * POST /admin/quizzes/{id}/archive — hidden from active lists and read-only.
 * @param {string} id
 * @returns {Promise<Quiz>}
 */
export async function archiveQuiz(id) {
  await delay();
  guard();
  const quiz = findQuiz(id);
  if (quiz.status === 'archived') throw fail(422, 'INVALID_STATE', 'This quiz is already archived.');
  quiz.status = 'archived';
  touch(quiz);
  return quizFromApi(toApiQuiz(quiz));
}

/**
 * POST /admin/quizzes/{id}/restore — returns the quiz to Draft.
 * @param {string} id
 * @returns {Promise<Quiz>}
 */
export async function restoreQuiz(id) {
  await delay();
  guard();
  const quiz = findQuiz(id);
  if (quiz.status !== 'archived') throw fail(422, 'INVALID_STATE', 'Only archived quizzes can be restored.');
  quiz.status = 'draft';
  quiz.publishedAt = null;
  touch(quiz);
  return quizFromApi(toApiQuiz(quiz));
}

/**
 * DELETE /admin/quizzes/{id} — drafts with no attempts only.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteQuiz(id) {
  await delay();
  guard();
  const quiz = findQuiz(id);
  if (quiz.status !== 'draft') throw fail(422, 'INVALID_STATE', 'Only drafts can be deleted.');
  if (quiz.attemptCount > 0) throw fail(422, 'HAS_ATTEMPTS', 'Students have already taken this quiz, so it can’t be deleted. Archive it instead.');
  const list = loadQuizzes();
  list.splice(list.indexOf(quiz), 1);
  saveQuizzes();
}

/**
 * POST /admin/quizzes/{id}/duplicate — a NEW unpublished draft (section 23):
 * questions, options, answers, marks, images, appearance and reusable settings
 * are copied; attempts, results, status and open/close dates are not.
 * @param {string} id
 * @returns {Promise<Quiz>}
 */
export async function duplicateQuiz(id) {
  await delay();
  guard();
  const original = findQuiz(id);
  const titles = new Set(loadQuizzes().map((quiz) => quiz.title));
  const base = `Copy of ${original.title}`.slice(0, 120);
  let title = base;
  for (let n = 2; titles.has(title); n += 1) title = `${base} (${n})`;

  const now = new Date().toISOString();
  const copy = JSON.parse(JSON.stringify(original));
  Object.assign(copy, {
    id: newId(),
    title,
    status: 'draft',
    attemptCount: 0,
    version: 1,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    settings: { ...copy.settings, opensAt: null, closesAt: null }
  });
  copy.questions.forEach((/** @type {any} */ question) => {
    question.id = newId();
    (question.options || []).forEach((/** @type {any} */ option) => { option.id = newId(); });
  });
  loadQuizzes().unshift(copy);
  saveQuizzes();
  return quizFromApi(toApiQuiz(copy));
}
