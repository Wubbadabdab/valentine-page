// @ts-check
/**
 * Session check and sign-out.
 * Every protected page asks the backend (GET /auth/me) on load. Hiding a page
 * in the browser is not protection — the backend enforces access on every call.
 */
import { api } from '../api/index.js';
import { ApiError } from '../api/client.js';
import { skipNextPageTransition } from './motion.js';

/** @typedef {import('../types.js').Admin} Admin */

/** Pages a "return to" link may point at after signing in. */
const RETURNABLE_PAGES = new Set([
  'dashboard.html', 'quizzes.html', 'quiz-edit.html', 'quiz-preview.html',
  'question-bank.html', 'question-edit.html', 'results.html', 'attempt.html', 'settings.html'
]);

/**
 * Only allow returning to one of our own pages (blocks redirects to other sites).
 * Accepts values like "quizzes.html?status=draft#x".
 * @param {string | null | undefined} value
 * @returns {string | null}
 */
export function safeReturnTo(value) {
  if (!value || typeof value !== 'string' || value.length > 2000) return null;
  const match = /^([a-z0-9-]+\.html)([?#].*)?$/i.exec(value);
  if (!match) return null;
  return RETURNABLE_PAGES.has(match[1].toLowerCase()) ? value : null;
}

/** The current page as a relative "page.html?query#hash" string. */
export function currentLocation() {
  const page = window.location.pathname.split('/').pop() || 'dashboard.html';
  return `${page}${window.location.search}${window.location.hash}`;
}

/** @param {string} [returnTo] */
export function loginUrl(returnTo) {
  const safe = safeReturnTo(returnTo);
  return safe ? `login.html?returnTo=${encodeURIComponent(safe)}` : 'login.html';
}

/**
 * Confirm the admin is signed in.
 * - Signed in: resolves with the admin.
 * - Not signed in (401): goes to the login page and resolves with null.
 * - No permission (403): goes to no-access.html and resolves with null.
 * - Network/server problems: rejects, so the page can show an error with Retry.
 * @returns {Promise<Admin | null>}
 */
export async function requireSession() {
  try {
    return await api.getMe();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin();
      return null;
    }
    if (error instanceof ApiError && error.status === 403) {
      skipNextPageTransition();
      window.location.replace('no-access.html');
      return null;
    }
    throw error;
  }
}

/**
 * The session ended while the admin was on a page with nothing unsaved:
 * go to the login page, then come back here after signing in.
 * (Pages with unsaved work open a sign-in dialog instead — Stage 3.)
 */
export function redirectToLogin() {
  skipNextPageTransition();
  window.location.replace(loginUrl(currentLocation()));
}

/**
 * Sign out on the server, then go to the login page.
 * Rejects if the server can't be reached, so the caller can tell the admin.
 */
export async function signOut() {
  await api.logout();
  window.location.replace('login.html');
}
