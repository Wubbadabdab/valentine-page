// @ts-check
/**
 * DEMO MODE ONLY — the mock backend's "database": demo quizzes kept in this
 * browser's localStorage so changes survive a reload while you try the site.
 * This is clearly labelled mock storage (the demo banner says so on every
 * page). The real backend stores everything; the admin site itself never
 * keeps quiz content in localStorage.
 */
import { createDemoQuizzes } from './mock-data.js';

const QUIZZES_KEY = 'jci-mock:quizzes';
const SEED_KEY = 'jci-mock:seed';
/** Bump when the demo data changes, so browsers pick up the new set. */
const SEED_VERSION = '3';

/** @type {any[] | null} */
let quizzes = null;

/** All demo quizzes in the backend's JSON shape (loaded once per page). */
export function loadQuizzes() {
  if (quizzes) return quizzes;
  try {
    if (window.localStorage.getItem(SEED_KEY) === SEED_VERSION) {
      const parsed = JSON.parse(window.localStorage.getItem(QUIZZES_KEY) || 'null');
      if (Array.isArray(parsed)) quizzes = parsed;
    }
  } catch {
    /* unreadable: start again from the demo set */
  }
  if (!quizzes) {
    quizzes = createDemoQuizzes();
    saveQuizzes();
  }
  return quizzes;
}

export function saveQuizzes() {
  try {
    window.localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes || []));
    window.localStorage.setItem(SEED_KEY, SEED_VERSION);
  } catch {
    /* storage full or blocked: changes last until the page reloads */
  }
}

/** Put the twelve demo quizzes back (Settings → Demo data). */
export function resetDemoData() {
  quizzes = createDemoQuizzes();
  saveQuizzes();
}
