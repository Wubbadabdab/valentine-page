// @ts-check
/**
 * Quiz status rules shared by the quiz list, the editor and the dashboard:
 * which actions are allowed, badge labels, and availability wording.
 * These rules are GUIDANCE for the admin — the backend enforces the same rules.
 * Pure functions (no DOM), tested in tests.html.
 */
import { formatDate, formatDateTime, formatRelative, hoursUntil } from '../core/format.js';

/** @typedef {import('../types.js').QuizSummary} QuizSummary */
/** @typedef {import('../types.js').QuizStatus} QuizStatus */
/** @typedef {import('../types.js').Availability} Availability */

export const QUIZ_STATUSES = /** @type {const} */ (['draft', 'published', 'archived']);
export const AVAILABILITIES = /** @type {const} */ (['scheduled', 'open', 'closed']);

/** @type {Record<QuizStatus, { label: string, icon: string }>} */
export const STATUS_META = {
  draft: { label: 'Draft', icon: 'edit' },
  published: { label: 'Published', icon: 'checkCircle' },
  archived: { label: 'Archived', icon: 'archive' }
};

/** @type {Record<Availability, { label: string, icon: string }>} */
export const AVAILABILITY_META = {
  scheduled: { label: 'Scheduled', icon: 'clock' },
  open: { label: 'Open', icon: 'play' },
  closed: { label: 'Closed', icon: 'lock' }
};

/** Sort options for the quiz list ("field:direction"), in menu order. */
export const QUIZ_SORTS = Object.freeze([
  { value: 'updatedAt:desc', label: 'Last updated (newest)' },
  { value: 'updatedAt:asc', label: 'Last updated (oldest)' },
  { value: 'title:asc', label: 'Title A–Z' },
  { value: 'title:desc', label: 'Title Z–A' },
  { value: 'createdAt:desc', label: 'Date created (newest)' },
  { value: 'createdAt:asc', label: 'Date created (oldest)' },
  { value: 'attemptCount:desc', label: 'Most attempts' },
  { value: 'attemptCount:asc', label: 'Fewest attempts' }
]);

/** URL state schema for quizzes.html (see js/core/list-state.js). */
export const QUIZ_LIST_SCHEMA = Object.freeze({
  filters: { status: QUIZ_STATUSES, availability: AVAILABILITIES },
  sorts: QUIZ_SORTS.map((option) => option.value),
  defaultSort: 'updatedAt:desc'
});

/** Quizzes closing within this many hours are flagged "closing soon". */
export const CLOSING_SOON_HOURS = 72;

export const TITLE_MAX_LENGTH = 120;

/**
 * A quiz is locked once any student has started it: its questions can't
 * change, so completed attempts stay valid (section 19).
 * @param {Pick<QuizSummary, 'attemptCount'>} quiz
 */
export function isLocked(quiz) {
  return quiz.attemptCount > 0;
}

/**
 * @typedef {'edit' | 'view' | 'preview' | 'duplicate' | 'publish' | 'unpublish' | 'archive' | 'restore' | 'delete'} QuizActionId
 */

/**
 * The row-menu actions allowed for a quiz in its current state, in menu order.
 * Delete is offered for every draft; for drafts with attempts its dialog
 * explains why it isn't possible and offers Archive instead (section 12).
 * @param {Pick<QuizSummary, 'status'>} quiz
 * @returns {QuizActionId[]}
 */
export function quizActions(quiz) {
  if (quiz.status === 'archived') return ['view', 'preview', 'duplicate', 'restore'];
  if (quiz.status === 'published') return ['edit', 'preview', 'duplicate', 'unpublish', 'archive'];
  return ['edit', 'preview', 'duplicate', 'publish', 'archive', 'delete'];
}

/**
 * Why a quiz can't be deleted, or null if it can.
 * @param {Pick<QuizSummary, 'status' | 'attemptCount'>} quiz
 */
export function deleteBlockReason(quiz) {
  if (quiz.status !== 'draft') return 'Only drafts can be deleted.';
  if (quiz.attemptCount > 0) {
    const who = quiz.attemptCount === 1 ? '1 student has' : `${quiz.attemptCount} students have`;
    return `${who} already taken this quiz, so deleting it would also delete their results.`;
  }
  return null;
}

/**
 * Problems the list can see without loading the whole quiz. The full checks
 * (every question, option and setting) run in Review & Publish and on the server.
 * @param {Pick<QuizSummary, 'title' | 'questionCount' | 'totalMarks'>} quiz
 * @returns {string[]}
 */
export function quickPublishBlockers(quiz) {
  /** @type {string[]} */
  const problems = [];
  if (!quiz.title.trim()) problems.push('Add a title.');
  if (quiz.questionCount === 0) problems.push('Add at least one question.');
  else if (quiz.totalMarks <= 0) problems.push('Give the questions marks above 0.');
  return problems;
}

/**
 * How a quiz's availability reads in lists.
 * @param {Pick<QuizSummary, 'status' | 'availability' | 'settings'>} quiz
 * @param {{ now?: Date }} [options]
 * @returns {{ availability: Availability | null, detail: string, title: string, soon: boolean }}
 *   detail: the short line under the badge; title: the full date for a tooltip;
 *   soon: closing within CLOSING_SOON_HOURS.
 */
export function availabilityInfo(quiz, { now = new Date() } = {}) {
  const { opensAt, closesAt } = quiz.settings;
  if (quiz.status === 'draft') return { availability: null, detail: 'Not published', title: '', soon: false };
  if (quiz.status === 'archived') return { availability: null, detail: 'Hidden from students', title: '', soon: false };

  if (quiz.availability === 'scheduled') {
    return { availability: 'scheduled', detail: opensAt ? `Opens ${formatDateTime(opensAt, { now })}` : 'Opens soon', title: '', soon: false };
  }
  if (quiz.availability === 'closed') {
    return {
      availability: 'closed',
      detail: closesAt ? `Closed ${formatDate(closesAt, { now })}` : 'Closed',
      title: closesAt ? formatDateTime(closesAt, { now }) : '',
      soon: false
    };
  }
  if (!closesAt) return { availability: quiz.availability, detail: 'No close date', title: '', soon: false };
  const hours = hoursUntil(closesAt, { now });
  const soon = hours > 0 && hours <= CLOSING_SOON_HOURS;
  return {
    availability: quiz.availability,
    detail: soon ? `Closes ${formatRelative(closesAt, { now })}` : `Closes ${formatDateTime(closesAt, { now })}`,
    title: soon ? formatDateTime(closesAt, { now }) : '',
    soon
  };
}

/** @type {Record<import('../types.js').QuestionType, string>} */
export const QUESTION_TYPE_LABELS = {
  multiple_choice: 'Multiple choice',
  checkboxes: 'Checkboxes',
  short_answer: 'Short answer',
  paragraph: 'Paragraph'
};
