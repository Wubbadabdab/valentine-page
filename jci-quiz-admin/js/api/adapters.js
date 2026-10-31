// @ts-check
/**
 * The ONE place where backend field names are mapped to the admin site's
 * model (js/types.js) and back. If the backend's final contract renames a
 * field, change it here — not across the site.
 * Auth (Stage 1) and quizzes (Stage 2) so far; bank and attempt mappers are
 * added in the stages that first use them.
 */
import { CONFIG } from '../config.js';

/** @typedef {import('../types.js').Admin} Admin */
/** @typedef {import('../types.js').Quiz} Quiz */
/** @typedef {import('../types.js').QuizSummary} QuizSummary */
/** @typedef {import('../types.js').QuizSettings} QuizSettings */
/** @typedef {import('../types.js').Appearance} Appearance */
/** @typedef {import('../types.js').Question} Question */
/** @typedef {import('../types.js').Option} Option */
/** @typedef {import('../types.js').QuizImage} QuizImage */

/**
 * Admin account from /auth/me or /auth/login.
 * Accepts { admin: {...} }, { user: {...} } or the object itself, and either
 * camelCase or snake_case names (PENDING #1: the exact response shape).
 * @param {any} raw
 * @returns {Admin}
 */
export function adminFromApi(raw) {
  const source = raw && typeof raw === 'object' ? (raw.admin || raw.user || raw) : {};
  const email = String(source.email ?? '');
  const joined = [source.firstName ?? source.first_name, source.lastName ?? source.last_name].filter(Boolean).join(' ');
  const name = String(source.name ?? source.fullName ?? source.full_name ?? (joined || '')).trim();
  return {
    id: String(source.id ?? ''),
    name: name || email.split('@')[0] || 'Administrator',
    email,
    role: String(source.role ?? 'admin')
  };
}

/**
 * Login request body. PENDING #1: email (default) or username.
 * @param {{ identifier: string, password: string }} credentials
 */
export function loginRequestToApi({ identifier, password }) {
  const key = CONFIG.AUTH.identifier === 'username' ? 'username' : 'email';
  return { [key]: identifier.trim(), password };
}

/**
 * Map server field-error names to the login form's field names.
 * @param {Record<string, string>} fieldErrors
 * @returns {Record<string, string>}
 */
export function loginFieldErrorsFromApi(fieldErrors) {
  /** @type {Record<string, string>} */
  const mapped = {};
  for (const [key, message] of Object.entries(fieldErrors || {})) {
    if (key === 'email' || key === 'username') mapped.identifier = message;
    else if (key === 'password') mapped.password = message;
  }
  return mapped;
}

/**
 * Initials for the account avatar, e.g. "Demo Admin" -> "DA".
 * @param {string} name
 */
export function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

// Quizzes (Stage 2) --------------------------------------------------------------

const QUIZ_STATUSES = ['draft', 'published', 'archived'];
const AVAILABILITIES = ['scheduled', 'open', 'closed'];

/** Defaults for settings the backend leaves out (section 32 defaults). */
export const DEFAULT_SETTINGS = Object.freeze({
  durationMinutes: null,
  opensAt: null,
  closesAt: null,
  maxAttempts: 1,
  attemptScoring: 'highest',
  checkboxScoring: 'all_or_nothing',
  resultVisibility: 'after_close',
  showCorrectAnswers: false
});

/** The quiz-wide appearance a new quiz starts with (section 30 example). */
export const DEFAULT_APPEARANCE = Object.freeze({
  fontFamily: 'Inter',
  fontSize: 18,
  textColor: '#130F2D',
  pageBackground: '#EEF6FB',
  cardBackground: '#FFFFFF',
  bold: false,
  italic: false,
  underline: false,
  align: 'left'
});

/** @param {any} value */
const str = (value) => (value === null || value === undefined ? '' : String(value));
/** @param {any} value */
const isoOrNull = (value) => (value ? String(value) : null);
/** @param {any} value @param {number} fallback */
const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
/** @param {any} value */
const numOrNull = (value) => (value === null || value === undefined || value === '' ? null : num(value, 0));

/**
 * @param {any} raw
 * @returns {QuizSettings}
 */
export function settingsFromApi(raw) {
  const s = raw && typeof raw === 'object' ? raw : {};
  return {
    durationMinutes: numOrNull(s.durationMinutes ?? s.duration_minutes),
    opensAt: isoOrNull(s.opensAt ?? s.opens_at),
    closesAt: isoOrNull(s.closesAt ?? s.closes_at),
    maxAttempts: 'maxAttempts' in s || 'max_attempts' in s ? numOrNull(s.maxAttempts ?? s.max_attempts) : DEFAULT_SETTINGS.maxAttempts,
    attemptScoring: (s.attemptScoring ?? s.attempt_scoring) === 'latest' ? 'latest' : 'highest',
    checkboxScoring: (s.checkboxScoring ?? s.checkbox_scoring) === 'partial' ? 'partial' : 'all_or_nothing',
    resultVisibility: ['immediately', 'after_close', 'manual'].includes(s.resultVisibility ?? s.result_visibility)
      ? (s.resultVisibility ?? s.result_visibility)
      : DEFAULT_SETTINGS.resultVisibility,
    showCorrectAnswers: Boolean(s.showCorrectAnswers ?? s.show_correct_answers)
  };
}

/**
 * @param {any} raw
 * @returns {Appearance}
 */
export function appearanceFromApi(raw) {
  const a = raw && typeof raw === 'object' ? raw : {};
  return {
    fontFamily: str(a.fontFamily ?? a.font_family) || DEFAULT_APPEARANCE.fontFamily,
    fontSize: num(a.fontSize ?? a.font_size, DEFAULT_APPEARANCE.fontSize),
    textColor: str(a.textColor ?? a.text_color) || DEFAULT_APPEARANCE.textColor,
    pageBackground: str(a.pageBackground ?? a.page_background) || DEFAULT_APPEARANCE.pageBackground,
    cardBackground: str(a.cardBackground ?? a.card_background) || DEFAULT_APPEARANCE.cardBackground,
    bold: Boolean(a.bold),
    italic: Boolean(a.italic),
    underline: Boolean(a.underline),
    align: a.align === 'center' ? 'center' : 'left'
  };
}

/**
 * @param {any} raw
 * @returns {QuizImage | null}
 */
function imageFromApi(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    assetId: str(raw.assetId ?? raw.asset_id),
    url: str(raw.url),
    alt: str(raw.alt),
    decorative: Boolean(raw.decorative),
    placement: raw.placement,
    size: raw.size
  };
}

/**
 * @param {any} raw
 * @returns {Question}
 */
export function questionFromApi(raw) {
  const q = raw && typeof raw === 'object' ? raw : {};
  /** @type {Question} */
  const question = {
    id: str(q.id),
    type: q.type,
    order: num(q.order, 0),
    text: str(q.text),
    explanation: q.explanation ? String(q.explanation) : null,
    marks: num(q.marks, 0),
    image: imageFromApi(q.image),
    appearance: q.appearance && typeof q.appearance === 'object' ? { ...q.appearance } : {},
    source: q.source && typeof q.source === 'object'
      ? { bankQuestionId: str(q.source.bankQuestionId ?? q.source.bank_question_id), bankVersion: num(q.source.bankVersion ?? q.source.bank_version, 1) }
      : null
  };
  if (Array.isArray(q.options)) {
    question.options = q.options.map((/** @type {any} */ o) => /** @type {Option} */ ({
      id: str(o.id),
      text: str(o.text),
      image: imageFromApi(o.image),
      isCorrect: Boolean(o.isCorrect ?? o.is_correct)
    }));
  }
  if (q.type === 'short_answer') {
    question.acceptedAnswers = Array.isArray(q.acceptedAnswers ?? q.accepted_answers) ? (q.acceptedAnswers ?? q.accepted_answers).map(String) : [];
    question.caseSensitive = Boolean(q.caseSensitive ?? q.case_sensitive);
  }
  if (q.type === 'short_answer' || q.type === 'paragraph') question.maxLength = numOrNull(q.maxLength ?? q.max_length);
  if (q.type === 'paragraph') question.gradingNotes = str(q.gradingNotes ?? q.grading_notes);
  return question;
}

/**
 * A quiz as it appears in lists (no questions needed).
 * @param {any} raw
 * @returns {QuizSummary}
 */
export function quizSummaryFromApi(raw) {
  const q = raw && typeof raw === 'object' ? raw : {};
  const status = QUIZ_STATUSES.includes(q.status) ? q.status : 'draft';
  const availability = AVAILABILITIES.includes(q.availability) ? q.availability : null;
  const questions = Array.isArray(q.questions) ? q.questions : null;
  return {
    id: str(q.id),
    title: str(q.title),
    description: str(q.description),
    status,
    // Availability only means something for published quizzes (section 12).
    availability: status === 'published' ? availability : null,
    settings: settingsFromApi(q.settings),
    questionCount: num(q.questionCount ?? q.question_count ?? questions?.length, 0),
    totalMarks: num(q.totalMarks ?? q.total_marks, 0),
    attemptCount: num(q.attemptCount ?? q.attempt_count, 0),
    version: num(q.version, 1),
    createdAt: str(q.createdAt ?? q.created_at),
    updatedAt: str(q.updatedAt ?? q.updated_at),
    publishedAt: isoOrNull(q.publishedAt ?? q.published_at)
  };
}

/**
 * A full quiz with its questions and appearance (GET /admin/quizzes/{id}).
 * @param {any} raw
 * @returns {Quiz}
 */
export function quizFromApi(raw) {
  const source = raw && typeof raw === 'object' ? (raw.quiz || raw) : {};
  const summary = quizSummaryFromApi(source);
  const questions = (Array.isArray(source.questions) ? source.questions : [])
    .map(questionFromApi)
    .sort((/** @type {Question} */ a, /** @type {Question} */ b) => a.order - b.order);
  return {
    ...summary,
    instructions: str(source.instructions),
    appearance: appearanceFromApi(source.appearance),
    questions,
    questionCount: questions.length || summary.questionCount
  };
}

/**
 * A page of quizzes: { items, page, pageSize, total }.
 * @param {any} raw
 * @returns {import('../types.js').Page<QuizSummary>}
 */
export function quizPageFromApi(raw) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const items = Array.isArray(data.items) ? data.items : [];
  return {
    items: items.map(quizSummaryFromApi),
    page: num(data.page, 1),
    pageSize: num(data.pageSize ?? data.page_size, items.length),
    total: num(data.total, items.length)
  };
}

/**
 * List query parameters. PENDING: parameter names to confirm with the backend.
 * No status means "draft and published" (archived quizzes are hidden from active lists).
 * @param {{ q?: string, status?: string, availability?: string, sort?: string, page?: number, pageSize?: number }} query
 */
export function quizListQueryToApi({ q = '', status = '', availability = '', sort = '', page = 1, pageSize = CONFIG.PAGE_SIZE_DEFAULT }) {
  return {
    q: q.trim() || undefined,
    status: status || undefined,
    availability: availability || undefined,
    sort: sort || undefined,
    page,
    pageSize
  };
}

/**
 * Body for POST /admin/quizzes.
 * @param {{ title: string }} input
 */
export function quizCreateToApi({ title }) {
  return { title: title.trim() };
}
