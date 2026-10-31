// @ts-check
/**
 * TEMPORARY stand-in for quiz-edit.html (built in Stage 3) and
 * quiz-preview.html (Stage 6), so links from the quiz list already work.
 * It loads the real quiz from the API and shows a read-only overview — it
 * never pretends to be the finished editor or preview.
 */
import { api } from '../api/index.js';
import { ApiError, userMessage } from '../api/client.js';
import { el, qs } from '../core/dom.js';
import { icon } from '../icons.js';
import { formatDateTime, formatNumber, plural } from '../core/format.js';
import { redirectToLogin } from '../core/session.js';
import { takeFlash } from '../core/flash.js';
import { bootPage } from '../components/shell.js';
import { toast } from '../components/toast.js';
import { statusBadge, availabilityBadge } from '../components/badge.js';
import { skeleton, emptyState, errorState } from '../components/states.js';
import { availabilityInfo, isLocked, QUESTION_TYPE_LABELS } from '../quiz/quiz-rules.js';

/** @typedef {import('../types.js').Quiz} Quiz */

const variant = document.body.dataset.variant === 'preview' ? 'preview' : 'edit';
const quizId = new URLSearchParams(window.location.search).get('id') || '';

const body = /** @type {HTMLElement} */ (qs('[data-quiz-body]'));
const heading = /** @type {HTMLElement} */ (qs('[data-quiz-title]'));
const badges = /** @type {HTMLElement} */ (qs('[data-quiz-badges]'));
const actions = /** @type {HTMLElement} */ (qs('[data-quiz-actions]'));
const crumbs = /** @type {HTMLElement} */ (qs('[data-breadcrumbs]'));

bootPage({
  page: 'quizzes',
  title: variant === 'preview' ? 'Preview' : 'Quiz',
  onReady: () => {
    const flash = takeFlash();
    if (flash) toast(flash);
    load();
  }
});

async function load() {
  body.replaceChildren(skeleton({ label: 'Loading quiz…', lines: 4 }));
  if (!quizId) {
    showNotFound();
    return;
  }
  try {
    render(await api.getQuiz(quizId));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin();
      return;
    }
    if (error instanceof ApiError && error.status === 404) {
      showNotFound();
      return;
    }
    body.replaceChildren(errorState({ title: "We couldn't load this quiz", message: userMessage(error), onRetry: load }));
  }
}

function showNotFound() {
  heading.textContent = 'Quiz not found';
  document.title = 'Quiz not found · JCI Uniben Quiz Admin';
  body.replaceChildren(emptyState({
    iconName: 'searchX',
    title: 'We can’t find that quiz',
    message: 'It may have been deleted, or the link may be incomplete.',
    actions: [{ label: 'Back to quizzes', href: 'quizzes.html', variant: 'primary' }]
  }));
}

/** @param {string} id */
const editorUrl = (id) => `quiz-edit.html?id=${encodeURIComponent(id)}`;

/** @param {Quiz} quiz */
function render(quiz) {
  const title = quiz.title.trim() || 'Untitled quiz';
  const isPreview = variant === 'preview';
  heading.textContent = isPreview ? `Preview: ${title}` : title;
  document.title = `${isPreview ? 'Preview: ' : ''}${title} · JCI Uniben Quiz Admin`;
  const topbarTitle = qs('.topbar__title');
  if (topbarTitle) topbarTitle.textContent = title;

  crumbs.replaceChildren(
    el('li', {}, el('a', { href: 'quizzes.html', text: 'Quizzes' })),
    ...(isPreview
      ? [el('li', {}, el('a', { href: editorUrl(quiz.id), text: title })), el('li', {}, el('span', { attrs: { 'aria-current': 'page' }, text: 'Preview' }))]
      : [el('li', {}, el('span', { attrs: { 'aria-current': 'page' }, text: title }))])
  );

  const info = availabilityInfo(quiz);
  badges.replaceChildren(
    statusBadge(quiz.status),
    ...(info.availability ? [availabilityBadge(info.availability, { soon: info.soon })] : []),
    el('span', { class: 'page-header__meta', text: info.detail })
  );

  actions.replaceChildren(isPreview
    ? el('a', { class: 'btn', href: editorUrl(quiz.id) }, icon('arrowLeft', { size: 18 }), 'Back to quiz')
    : el('a', { class: 'btn', href: `quiz-preview.html?id=${encodeURIComponent(quiz.id)}` }, icon('eye', { size: 18 }), 'Preview'));

  body.replaceChildren(
    ...notices(quiz),
    stageNote(isPreview),
    summaryCard(quiz),
    questionsCard(quiz)
  );
  body.classList.add('fade-in');
}

/** @param {Quiz} quiz */
function notices(quiz) {
  /** @type {HTMLElement[]} */
  const list = [];
  if (quiz.status === 'archived') {
    list.push(el('div', { class: 'alert alert--info' }, icon('archive'),
      el('p', { text: 'This quiz is archived, so it’s read-only. Restore it from the quiz list to make changes.' })));
  } else if (isLocked(quiz)) {
    list.push(el('div', { class: 'alert alert--info' }, icon('lock'),
      el('p', { text: 'Students have already started this quiz, so its questions are locked to protect their results. Duplicate the quiz to make changes.' })));
  } else if (quiz.status === 'published') {
    list.push(el('div', { class: 'alert alert--info' }, icon('info'),
      el('p', { text: 'This quiz is live. Saved changes appear to students immediately.' })));
  }
  return list;
}

/** @param {boolean} isPreview */
function stageNote(isPreview) {
  const items = isPreview
    ? ['Shows the saved quiz exactly as students will see it, in the quiz’s own colors and fonts',
      'Lets you try answering, without anything being saved or submitted',
      'Switches between phone, tablet and desktop widths',
      'Can show the correct answers (visible to admins only)']
    : ['Stage 3: the Details tab — title, description and instructions — with autosave',
      'Stage 4: the question builder for all four question types',
      'Stage 5: the quiz’s appearance for students',
      'Stage 6: settings, Review & Publish, and Preview'];
  return el('section', { class: 'card stage-note', attrs: { 'aria-labelledby': 'stage-title' } },
    el('div', { class: 'card__header' },
      el('h2', { id: 'stage-title', text: isPreview ? 'Preview arrives in Stage 6' : 'The quiz editor arrives in Stage 3' }),
      el('p', { class: 'card__description', text: 'Until then, this page shows the quiz’s saved details from the server (read-only).' })),
    el('ul', { class: 'stage-note__list' }, items.map((item) => el('li', { text: item })))
  );
}

/** @param {Quiz} quiz */
function summaryCard(quiz) {
  const { settings } = quiz;
  /** @type {[string, string][]} */
  const rows = [
    ['Questions', formatNumber(quiz.questionCount)],
    ['Total marks', formatNumber(quiz.totalMarks)],
    ['Student attempts', formatNumber(quiz.attemptCount)],
    ['Time limit', settings.durationMinutes ? plural(settings.durationMinutes, 'minute') : 'None'],
    ['Opens', settings.opensAt ? formatDateTime(settings.opensAt) : 'When published'],
    ['Closes', settings.closesAt ? formatDateTime(settings.closesAt) : 'No close date'],
    ['Attempts allowed', settings.maxAttempts === null ? 'Unlimited' : formatNumber(settings.maxAttempts)],
    ['Last updated', formatDateTime(quiz.updatedAt)]
  ];
  return el('section', { class: 'card', attrs: { 'aria-labelledby': 'summary-title' } },
    el('div', { class: 'card__header' },
      el('h2', { id: 'summary-title', text: 'Summary' }),
      quiz.description && el('p', { class: 'card__description', text: quiz.description })),
    el('dl', { class: 'facts facts--grid' }, rows.map(([term, value]) =>
      el('div', { class: 'facts__row' }, el('dt', { text: term }), el('dd', { class: 'num', text: value }))))
  );
}

/** @param {Quiz} quiz */
function questionsCard(quiz) {
  return el('section', { class: 'card', attrs: { 'aria-labelledby': 'questions-title' } },
    el('div', { class: 'card__header' },
      el('h2', { id: 'questions-title', text: `Questions (${quiz.questions.length})` }),
      el('p', { class: 'card__description', text: 'A read-only outline. Editing comes with the question builder in Stage 4.' })),
    quiz.questions.length
      ? el('ol', { class: 'outline' }, quiz.questions.map((question, index) =>
        el('li', { class: 'outline__item' },
          el('span', { class: 'outline__number num', text: String(index + 1) }),
          el('div', { class: 'outline__body' },
            el('p', { class: ['outline__text', question.text.trim() ? '' : 'is-missing'], text: question.text.trim() || 'No question text yet' }),
            el('p', { class: 'outline__meta', text: `${QUESTION_TYPE_LABELS[question.type] || 'Question'} · ${plural(question.marks, 'mark')}` })))))
      : el('p', { class: 'card__description', text: 'No questions yet.' })
  );
}
