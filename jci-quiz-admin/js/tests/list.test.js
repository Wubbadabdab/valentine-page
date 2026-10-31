// @ts-check
/**
 * Stage 2: list URL state, pagination maths, quiz rules, date wording,
 * quiz adapters and the demo backend's list behaviour.
 */
import { test, assert, assertEqual, assertRejects } from './harness.js';
import {
  parseListState, listStateToSearch, isFiltered, clearFilters, pageRange, pageList
} from '../core/list-state.js';
import { formatRelative, formatDate, plural } from '../core/format.js';
import {
  QUIZ_LIST_SCHEMA, QUIZ_SORTS, quizActions, deleteBlockReason, quickPublishBlockers, availabilityInfo, isLocked
} from '../quiz/quiz-rules.js';
import { quizSummaryFromApi, quizFromApi, quizPageFromApi, quizListQueryToApi, settingsFromApi } from '../api/adapters.js';
import { ApiError } from '../api/client.js';
import { createDemoQuizzes } from '../api/mock/mock-data.js';

/* URL state ---------------------------------------------------------------------- */
test('list state: reads search, filters, sort and page from the URL', () => {
  const state = parseListState('?q=%20bio%20&status=published&availability=open&sort=title:asc&page=3', QUIZ_LIST_SCHEMA);
  assertEqual(state, { q: 'bio', filters: { status: 'published', availability: 'open' }, sort: 'title:asc', page: 3 });
});

test('list state: invalid or hand-edited values fall back to defaults', () => {
  const state = parseListState('?status=deleted&availability=soon&sort=password:asc&page=-4', QUIZ_LIST_SCHEMA);
  assertEqual(state, { q: '', filters: { status: '', availability: '' }, sort: 'updatedAt:desc', page: 1 });
  assertEqual(parseListState('?page=abc', QUIZ_LIST_SCHEMA).page, 1);
  assertEqual(parseListState(`?q=${'x'.repeat(500)}`, QUIZ_LIST_SCHEMA).q.length, 200, 'very long searches are trimmed');
});

test('list state: writes short links and survives a round trip', () => {
  const defaults = parseListState('', QUIZ_LIST_SCHEMA);
  assertEqual(listStateToSearch(defaults, QUIZ_LIST_SCHEMA), '', 'defaults give an empty query string');
  const state = { q: 'bio & chem', filters: { status: 'draft', availability: '' }, sort: 'attemptCount:desc', page: 2 };
  const search = listStateToSearch(state, QUIZ_LIST_SCHEMA);
  assertEqual(search, '?q=bio+%26+chem&status=draft&sort=attemptCount%3Adesc&page=2');
  assertEqual(parseListState(search, QUIZ_LIST_SCHEMA), state);
});

test('list state: filtered vs not, and Clear filters keeps the sort', () => {
  const state = parseListState('?q=x&status=draft&sort=title:asc&page=4', QUIZ_LIST_SCHEMA);
  assert(isFiltered(state), 'search + status is filtered');
  assert(!isFiltered(parseListState('?sort=title:asc&page=2', QUIZ_LIST_SCHEMA)), 'sort and page alone are not filters');
  assertEqual(clearFilters(state), { q: '', filters: { status: '', availability: '' }, sort: 'title:asc', page: 1 });
});

test('pagination: "Showing 21–40 of 134" maths', () => {
  assertEqual(pageRange({ page: 2, pageSize: 20, total: 134 }), { from: 21, to: 40, total: 134, pageCount: 7 });
  assertEqual(pageRange({ page: 7, pageSize: 20, total: 134 }), { from: 121, to: 134, total: 134, pageCount: 7 });
  assertEqual(pageRange({ page: 9, pageSize: 20, total: 134 }).from, 121, 'a page past the end is clamped');
  assertEqual(pageRange({ page: 1, pageSize: 20, total: 0 }), { from: 0, to: 0, total: 0, pageCount: 1 });
});

test('pagination: page numbers with gaps', () => {
  assertEqual(pageList(1, 5), [1, 2, 3, 4, 5]);
  assertEqual(pageList(1, 12), [1, 2, 3, 4, null, 12]);
  assertEqual(pageList(6, 12), [1, null, 5, 6, 7, null, 12]);
  assertEqual(pageList(12, 12), [1, null, 9, 10, 11, 12]);
});

test('sort options in quizzes.html match QUIZ_SORTS', async () => {
  const html = await (await fetch('quizzes.html')).text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const values = [...doc.querySelectorAll('#quiz-sort option')].map((option) => /** @type {HTMLOptionElement} */ (option).value);
  assertEqual(values, QUIZ_SORTS.map((option) => option.value));
});

/* Quiz rules ------------------------------------------------------------------------ */
test('quiz rules: menu actions depend on status', () => {
  assertEqual(quizActions({ status: 'draft' }), ['edit', 'preview', 'duplicate', 'publish', 'archive', 'delete']);
  assertEqual(quizActions({ status: 'published' }), ['edit', 'preview', 'duplicate', 'unpublish', 'archive']);
  assertEqual(quizActions({ status: 'archived' }), ['view', 'preview', 'duplicate', 'restore']);
});

test('quiz rules: delete only for drafts with no attempts; locking follows attempts', () => {
  assertEqual(deleteBlockReason({ status: 'draft', attemptCount: 0 }), null);
  assert(String(deleteBlockReason({ status: 'draft', attemptCount: 1 })).startsWith('1 student has'), 'singular wording');
  assert(String(deleteBlockReason({ status: 'draft', attemptCount: 15 })).startsWith('15 students have'), 'plural wording');
  assertEqual(deleteBlockReason({ status: 'published', attemptCount: 0 }), 'Only drafts can be deleted.');
  assert(isLocked({ attemptCount: 1 }) && !isLocked({ attemptCount: 0 }), 'locked once anyone has started');
});

test('quiz rules: quick publish blockers', () => {
  assertEqual(quickPublishBlockers({ title: ' ', questionCount: 0, totalMarks: 0 }), ['Add a title.', 'Add at least one question.']);
  assertEqual(quickPublishBlockers({ title: 'Quiz', questionCount: 3, totalMarks: 0 }), ['Give the questions marks above 0.']);
  assertEqual(quickPublishBlockers({ title: 'Quiz', questionCount: 3, totalMarks: 6 }), []);
});

test('quiz rules: availability wording, including "closing soon"', () => {
  const now = new Date('2026-10-29T12:00:00Z');
  const base = { durationMinutes: null, maxAttempts: 1, attemptScoring: 'highest', checkboxScoring: 'all_or_nothing', resultVisibility: 'after_close', showCorrectAnswers: false };
  /** @param {any} quiz */
  const info = (quiz) => availabilityInfo(quiz, { now });
  assertEqual(info({ status: 'draft', availability: null, settings: { ...base, opensAt: null, closesAt: null } }).detail, 'Not published');
  assertEqual(info({ status: 'archived', availability: null, settings: { ...base, opensAt: null, closesAt: null } }).detail, 'Hidden from students');
  assertEqual(info({ status: 'published', availability: 'open', settings: { ...base, opensAt: null, closesAt: null } }).detail, 'No close date');
  const soon = info({ status: 'published', availability: 'open', settings: { ...base, opensAt: null, closesAt: '2026-10-31T12:00:00Z' } });
  assert(soon.soon && soon.detail === 'Closes in 2 days', `closing soon: ${soon.detail}`);
  const later = info({ status: 'published', availability: 'open', settings: { ...base, opensAt: null, closesAt: '2026-11-20T16:00:00Z' } });
  assert(!later.soon && later.detail.startsWith('Closes 20 Nov'), `later: ${later.detail}`);
  const scheduled = info({ status: 'published', availability: 'scheduled', settings: { ...base, opensAt: '2026-11-05T08:00:00Z', closesAt: null } });
  assert(scheduled.detail.startsWith('Opens 5 Nov'), `scheduled: ${scheduled.detail}`);
});

/* Formatting --------------------------------------------------------------------------- */
test('format: relative times and plurals', () => {
  const now = new Date('2026-10-29T12:00:00Z');
  assertEqual(formatRelative('2026-10-29T11:59:40Z', { now }), 'just now');
  assertEqual(formatRelative('2026-10-29T11:55:00Z', { now }), '5 minutes ago');
  assertEqual(formatRelative('2026-10-28T12:00:00Z', { now }), 'yesterday');
  assertEqual(formatRelative('2026-10-31T12:00:00Z', { now }), 'in 2 days');
  assertEqual(formatDate('2025-03-01T12:00:00Z', { now }), '1 Mar 2025', 'other years include the year');
  assertEqual(plural(1, 'quiz', 'quizzes'), '1 quiz');
  assertEqual(plural(1200, 'mark'), '1,200 marks');
});

/* Adapters ------------------------------------------------------------------------------- */
test('adapters: quiz summary from camelCase or snake_case, with safe defaults', () => {
  const camel = quizSummaryFromApi({ id: 'q1', title: 'Bio', status: 'published', availability: 'open', questionCount: 4, totalMarks: 10, attemptCount: 2, version: 3, settings: { maxAttempts: null } });
  assertEqual([camel.status, camel.availability, camel.questionCount, camel.totalMarks, camel.settings.maxAttempts], ['published', 'open', 4, 10, null]);
  const snake = quizSummaryFromApi({ id: 'q2', title: 'Chem', status: 'draft', availability: 'open', question_count: 2, total_marks: 5, attempt_count: 0, updated_at: '2026-01-01T00:00:00Z' });
  assertEqual([snake.availability, snake.questionCount, snake.updatedAt], [null, 2, '2026-01-01T00:00:00Z'], 'drafts never have availability');
  const odd = quizSummaryFromApi({ status: 'weird' });
  assertEqual([odd.status, odd.title, odd.settings.maxAttempts, odd.settings.resultVisibility], ['draft', '', 1, 'after_close']);
});

test('adapters: full quiz sorts questions by order and keeps admin-only fields', () => {
  const quiz = quizFromApi({ quiz: { id: 'q', title: 'T', status: 'draft', questions: [
    { id: 'b', type: 'short_answer', order: 2, text: 'Two', marks: 1, accepted_answers: ['x'] },
    { id: 'a', type: 'multiple_choice', order: 1, text: 'One', marks: 2, options: [{ id: 'o1', text: 'Yes', is_correct: true }] }
  ] } });
  assertEqual(quiz.questions.map((q) => q.id), ['a', 'b']);
  assertEqual(quiz.questionCount, 2);
  assertEqual(quiz.questions[0].options?.[0].isCorrect, true);
  assertEqual(quiz.questions[1].acceptedAnswers, ['x']);
});

test('adapters: list page and query parameters', () => {
  const page = quizPageFromApi({ items: [{ id: '1', title: 'A' }], page: 2, page_size: 10, total: 11 });
  assertEqual([page.items.length, page.page, page.pageSize, page.total], [1, 2, 10, 11]);
  assertEqual(quizListQueryToApi({ q: '  bio ', status: '', sort: 'title:asc', page: 1, pageSize: 20 }),
    { q: 'bio', status: undefined, availability: undefined, sort: 'title:asc', page: 1, pageSize: 20 });
  assertEqual(settingsFromApi({ max_attempts: 3, result_visibility: 'manual' }).maxAttempts, 3);
});

/* Demo data ------------------------------------------------------------------------------- */
test('demo data: 12 quizzes covering every state, with unique ids', () => {
  const quizzes = createDemoQuizzes(Date.parse('2026-10-29T12:00:00Z'));
  assertEqual(quizzes.length, 12);
  const statuses = new Set(quizzes.map((quiz) => quiz.status));
  assert(statuses.has('draft') && statuses.has('published') && statuses.has('archived'), 'all statuses present');
  assert(quizzes.some((quiz) => quiz.status === 'draft' && quiz.attemptCount > 0), 'a locked draft exists');
  const ids = quizzes.flatMap((quiz) => [quiz.id, ...quiz.questions.flatMap((q) => [q.id, ...(q.options || []).map((/** @type {any} */ o) => o.id)])]);
  assertEqual(new Set(ids).size, ids.length, 'every quiz, question and option id is unique');
});

test('demo backend: answers in the same error format as the real API', async () => {
  // tests.html usually runs signed out, so the demo backend answers 401 (or 404 if signed in).
  const { getQuiz } = await import('../api/mock/mock-api.js');
  await assertRejects(() => getQuiz('does-not-exist'),
    (error) => error instanceof ApiError && (error.status === 404 || error.status === 401) && typeof error.code === 'string',
    'unknown quiz');
});
