// @ts-check
/**
 * Quizzes (quizzes.html): search, filters, sorting and paging — all kept in
 * the URL — plus each row's action menu with its confirmations, and New quiz.
 * Filtering, sorting and paging happen on the server; this page only asks.
 */
import { CONFIG } from '../config.js';
import { api } from '../api/index.js';
import { ApiError, isAbortError, userMessage } from '../api/client.js';
import { el, qs, qsa } from '../core/dom.js';
import { icon } from '../icons.js';
import { getPref, setPref } from '../core/storage.js';
import { announce } from '../core/a11y.js';
import { flip, stagger, prefersReducedMotion } from '../core/motion.js';
import { createStore } from '../core/store.js';
import { parseListState, listStateToSearch, isFiltered, clearFilters, pageRange } from '../core/list-state.js';
import { formatDateTime, formatRelative, formatNumber, plural } from '../core/format.js';
import { rules, validateValue } from '../core/validate.js';
import { redirectToLogin } from '../core/session.js';
import { setFlash } from '../core/flash.js';
import { bootPage } from '../components/shell.js';
import { toast } from '../components/toast.js';
import { openDialog, confirmDialog, formDialog } from '../components/dialog.js';
import { showMenu, closeMenus, menuButtonAttrs } from '../components/menu.js';
import { statusBadge, availabilityBadge } from '../components/badge.js';
import { renderPagination } from '../components/pagination.js';
import { emptyState, errorState } from '../components/states.js';
import { setFieldError, clearFieldError, showFormAlert, hideFormMessage } from '../components/form-feedback.js';
import {
  QUIZ_LIST_SCHEMA, QUIZ_SORTS, STATUS_META, AVAILABILITY_META, TITLE_MAX_LENGTH,
  quizActions, deleteBlockReason, quickPublishBlockers, availabilityInfo, isLocked
} from '../quiz/quiz-rules.js';

/** @typedef {import('../types.js').QuizSummary} QuizSummary */
/** @typedef {import('../core/list-state.js').ListState} ListState */
/** @typedef {import('../quiz/quiz-rules.js').QuizActionId} QuizActionId */

const SEARCH_DEBOUNCE_MS = 300;
/** Table rows and phone cards — the things that move when the list changes. */
const ROW_SELECTOR = '.quiz-row, .quiz-card';
const STALE_AFTER_MS = 60_000;

/** @type {Record<QuizActionId, { label: string, icon: string, tone?: 'danger', separatorBefore?: boolean }>} */
const ACTION_META = {
  edit: { label: 'Edit', icon: 'edit' },
  view: { label: 'View', icon: 'fileText' },
  preview: { label: 'Preview', icon: 'eye' },
  duplicate: { label: 'Duplicate', icon: 'copy' },
  publish: { label: 'Publish…', icon: 'send', separatorBefore: true },
  unpublish: { label: 'Unpublish…', icon: 'eyeOff', separatorBefore: true },
  archive: { label: 'Archive…', icon: 'archive' },
  restore: { label: 'Restore', icon: 'restore', separatorBefore: true },
  delete: { label: 'Delete…', icon: 'trash', tone: 'danger', separatorBefore: true }
};

/** Column headers that sort, and the direction a first click uses. */
const SORT_COLUMNS = /** @type {const} */ ({ title: 'asc', attemptCount: 'desc', updatedAt: 'desc' });

// Elements -------------------------------------------------------------------------
const panel = /** @type {HTMLElement} */ (qs('[data-quiz-list]'));
const searchInput = /** @type {HTMLInputElement} */ (qs('#quiz-search'));
const searchClear = /** @type {HTMLButtonElement} */ (qs('[data-search-clear]'));
const searchSpinner = /** @type {HTMLElement} */ (qs('[data-search-spinner]'));
const statusInputs = /** @type {HTMLInputElement[]} */ (qsa('input[name="status"]'));
const availabilitySelect = /** @type {HTMLSelectElement} */ (qs('#availability-filter'));
const sortSelect = /** @type {HTMLSelectElement} */ (qs('#quiz-sort'));
const chipsHost = /** @type {HTMLElement} */ (qs('[data-filter-chips]'));
const countHost = /** @type {HTMLElement} */ (qs('[data-list-count]'));
const listHost = /** @type {HTMLElement} */ (qs('[data-list]'));
const paginationHost = /** @type {HTMLElement} */ (qs('[data-pagination]'));
const newButtons = /** @type {HTMLButtonElement[]} */ (qsa('[data-new-quiz]'));

// State ------------------------------------------------------------------------------
const store = createStore({
  query: parseListState(window.location.search, QUIZ_LIST_SCHEMA),
  pageSize: savedPageSize(),
  /** @type {QuizSummary[]} */
  items: [],
  total: 0,
  /** @type {'loading' | 'ready' | 'error'} */
  phase: 'loading',
  hasShownRows: false,
  loadedAt: 0
});
/** Quizzes with an action in progress (their menu button shows a spinner). */
const busyIds = new Set();
/** @type {AbortController | null} */
let inFlight = null;

function savedPageSize() {
  const saved = Number(getPref('rows'));
  return CONFIG.PAGE_SIZES.includes(saved) ? saved : CONFIG.PAGE_SIZE_DEFAULT;
}

/** @param {string} id */
const editorUrl = (id) => `quiz-edit.html?id=${encodeURIComponent(id)}`;
/** @param {string} id */
const previewUrl = (id) => `quiz-preview.html?id=${encodeURIComponent(id)}`;
/** @param {ListState} query */
const urlFor = (query) => `${window.location.pathname}${listStateToSearch(query, QUIZ_LIST_SCHEMA)}`;

// Start ----------------------------------------------------------------------------
bootPage({
  page: 'quizzes',
  title: 'Quizzes',
  onReady: () => {
    newButtons.forEach((button) => {
      button.hidden = false;
      button.classList.add('fade-in');
      button.addEventListener('click', () => newQuiz());
    });
    syncControls();
    wireControls();
    load({ reason: 'initial' });
  }
});

// Loading ------------------------------------------------------------------------------

/**
 * Fetch the current page from the server. Older requests are cancelled, so a
 * slow response can never overwrite a newer one.
 * @param {{ reason?: 'initial' | 'user' | 'refresh', highlightId?: string, morphId?: string }} [options]
 */
async function load({ reason = 'user', highlightId, morphId } = {}) {
  inFlight?.abort();
  const controller = new AbortController();
  inFlight = controller;
  const { query, pageSize, hasShownRows } = store.get();

  const firstLoad = !hasShownRows && store.get().phase !== 'ready';
  if (firstLoad) listHost.replaceChildren(listSkeleton());
  panel.classList.toggle('is-refreshing', !firstLoad);
  listHost.setAttribute('aria-busy', 'true');
  searchSpinner.hidden = !query.q;

  try {
    const result = await api.listQuizzes(
      { q: query.q, status: query.filters.status, availability: query.filters.availability, sort: query.sort, page: query.page, pageSize },
      { signal: controller.signal }
    );
    if (controller !== inFlight) return;

    // Asked for a page past the end (e.g. after deleting the last row): go to the last real page.
    const { pageCount } = pageRange({ page: query.page, pageSize, total: result.total });
    if (result.total > 0 && result.items.length === 0 && query.page > pageCount) {
      const fixed = { ...query, page: pageCount };
      store.set({ query: fixed });
      window.history.replaceState(null, '', urlFor(fixed));
      load({ reason });
      return;
    }

    store.set({ items: result.items, total: result.total, phase: 'ready', loadedAt: Date.now() });
    const mode = firstLoad || !hasShownRows ? 'stagger' : 'flip';
    renderList({ mode, highlightId, morphId });
    renderCount();
    renderPaginationBar();
    if (reason === 'user') announce(summaryText());
  } catch (error) {
    if (isAbortError(error) || controller !== inFlight) return;
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin();
      return;
    }
    store.set({ phase: 'error', items: [], total: 0 });
    paginationHost.replaceChildren();
    countHost.textContent = '';
    listHost.replaceChildren(errorState({
      title: "We couldn't load your quizzes",
      message: userMessage(error),
      onRetry: () => load({ reason: 'user' })
    }));
  } finally {
    if (controller === inFlight) {
      inFlight = null;
      panel.classList.remove('is-refreshing');
      listHost.removeAttribute('aria-busy');
      searchSpinner.hidden = true;
    }
  }
}

/**
 * Change the list query, update the URL and reload.
 * @param {Partial<ListState> & { filters?: Partial<Record<string, string>> }} changes
 * @param {{ history?: 'push' | 'replace' }} [options]
 */
function updateQuery(changes, { history = 'push' } = {}) {
  const current = store.get().query;
  /** @type {ListState} */
  const next = {
    ...current,
    ...changes,
    filters: { ...current.filters, ...(changes.filters || {}) },
    page: changes.page ?? 1
  };
  // Availability only applies to published quizzes.
  if (next.filters.status === 'draft' || next.filters.status === 'archived') next.filters.availability = '';
  store.set({ query: next });
  const url = urlFor(next);
  if (history === 'replace') window.history.replaceState(null, '', url);
  else window.history.pushState(null, '', url);
  syncControls();
  load({ reason: 'user' });
}

// Controls ---------------------------------------------------------------------------

function syncControls() {
  const { query } = store.get();
  if (document.activeElement !== searchInput) searchInput.value = query.q;
  searchClear.hidden = searchInput.value === '';
  statusInputs.forEach((input) => { input.checked = input.value === query.filters.status; });
  availabilitySelect.value = query.filters.availability;
  const availabilityApplies = query.filters.status === '' || query.filters.status === 'published';
  availabilitySelect.disabled = !availabilityApplies;
  availabilitySelect.closest('.toolbar-select')?.classList.toggle('is-disabled', !availabilityApplies);
  sortSelect.value = query.sort;
  renderChips();
}

function wireControls() {
  // Search: debounced; the first search adds a history entry, refinements replace it.
  let timer = 0;
  const commitSearch = () => {
    window.clearTimeout(timer);
    const q = searchInput.value.trim();
    const { query } = store.get();
    if (q === query.q) return;
    updateQuery({ q }, { history: query.q === '' ? 'push' : 'replace' });
  };
  searchInput.addEventListener('input', () => {
    searchClear.hidden = searchInput.value === '';
    window.clearTimeout(timer);
    timer = window.setTimeout(commitSearch, SEARCH_DEBOUNCE_MS);
  });
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); commitSearch(); }
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    commitSearch();
    searchInput.focus();
  });

  statusInputs.forEach((input) => input.addEventListener('change', () => {
    if (input.checked) updateQuery({ filters: { status: input.value } });
  }));
  availabilitySelect.addEventListener('change', () => updateQuery({ filters: { availability: availabilitySelect.value } }));
  sortSelect.addEventListener('change', () => updateQuery({ sort: sortSelect.value }));

  // Back / forward buttons
  window.addEventListener('popstate', () => {
    store.set({ query: parseListState(window.location.search, QUIZ_LIST_SCHEMA) });
    searchInput.value = store.get().query.q;
    syncControls();
    load({ reason: 'user' });
  });

  // "/" jumps to the search box (unless you're typing somewhere already).
  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = /** @type {HTMLElement} */ (event.target);
    if (target.closest('input, textarea, select, [contenteditable="true"], dialog[open]')) return;
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  });

  // Rows: open the editor on click; menus on the ⋯ button; column sorting.
  listHost.addEventListener('click', onListClick);
  listHost.addEventListener('keydown', onListKeydown);

  // Data may have changed elsewhere: refresh quietly when the tab comes back.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && store.get().phase === 'ready' && Date.now() - store.get().loadedAt > STALE_AFTER_MS) {
      load({ reason: 'refresh' });
    }
  });
}

/** @param {MouseEvent} event */
function onListClick(event) {
  const target = /** @type {HTMLElement} */ (event.target);

  const sortButton = /** @type {HTMLButtonElement | null} */ (target.closest('[data-sort-field]'));
  if (sortButton) {
    const field = /** @type {keyof typeof SORT_COLUMNS} */ (sortButton.dataset.sortField);
    const [currentField, currentDirection] = store.get().query.sort.split(':');
    const direction = currentField === field ? (currentDirection === 'asc' ? 'desc' : 'asc') : SORT_COLUMNS[field];
    updateQuery({ sort: `${field}:${direction}` });
    return;
  }

  const menuButton = /** @type {HTMLButtonElement | null} */ (target.closest('[data-row-menu]'));
  if (menuButton) {
    openRowMenu(menuButton);
    return;
  }

  // A click anywhere else on a row opens the quiz — but not when selecting text
  // or using a link/button inside the row.
  if (target.closest('a, button, input, select, label, summary')) return;
  if (window.getSelection()?.toString()) return;
  const row = target.closest(ROW_SELECTOR);
  if (row instanceof HTMLElement && row.dataset.id && !busyIds.has(row.dataset.id)) {
    window.location.href = editorUrl(row.dataset.id);
  }
}

/** @param {KeyboardEvent} event */
function onListKeydown(event) {
  const menuButton = /** @type {HTMLElement} */ (event.target).closest('[data-row-menu]');
  if (menuButton && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault();
    openRowMenu(/** @type {HTMLButtonElement} */ (menuButton), event.key === 'ArrowUp' ? 'last' : 'first');
  }
}

/**
 * @param {HTMLButtonElement} button
 * @param {'first' | 'last'} [focus]
 */
function openRowMenu(button, focus = 'first') {
  const quiz = findQuiz(button.dataset.quizId || '');
  if (!quiz || busyIds.has(quiz.id)) return;
  showMenu(button, quizActions(quiz).map((id) => ({ id, ...ACTION_META[id] })), {
    label: `Actions for ${quiz.title || 'Untitled quiz'}`,
    focus,
    onSelect: (action) => runAction(/** @type {QuizActionId} */ (action), quiz, button)
  });
}

/** @param {string} id */
function findQuiz(id) {
  return store.get().items.find((quiz) => quiz.id === id) || null;
}

// Rendering ----------------------------------------------------------------------------

function summaryText() {
  const { query, pageSize, total } = store.get();
  if (!total) return isFiltered(query) ? 'No quizzes match these filters.' : 'No quizzes.';
  const { from, to } = pageRange({ page: query.page, pageSize, total });
  return `Showing ${from} to ${to} of ${plural(total, 'quiz', 'quizzes')}.`;
}

function renderCount() {
  const { query, total } = store.get();
  countHost.textContent = isFiltered(query)
    ? `${plural(total, 'quiz', 'quizzes')} ${total === 1 ? 'matches' : 'match'}`
    : plural(total, 'quiz', 'quizzes');
}

function renderPaginationBar() {
  const { query, pageSize, total } = store.get();
  if (!total) {
    paginationHost.replaceChildren();
    return;
  }
  paginationHost.replaceChildren(renderPagination({
    page: query.page,
    pageSize,
    total,
    pageSizes: CONFIG.PAGE_SIZES,
    noun: 'quizzes',
    hrefFor: (page) => urlFor({ ...query, page }),
    onPage: (page) => {
      updateQuery({ page });
      panel.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    },
    onPageSize: (size) => {
      setPref('rows', String(size));
      store.set({ pageSize: size });
      toast({ type: 'success', message: `Lists will show ${size} rows per page on this device.` });
      updateQuery({ page: 1 }, { history: 'replace' });
    }
  }));
}

/** Removable chips for each active filter, plus "Clear filters". */
function renderChips() {
  const { query } = store.get();
  /** @type {{ key: string, label: string, clear: () => void }[]} */
  const chips = [];
  if (query.q) chips.push({ key: 'q', label: `Search: “${query.q}”`, clear: () => { searchInput.value = ''; updateQuery({ q: '' }); } });
  const status = /** @type {keyof typeof STATUS_META | ''} */ (query.filters.status);
  if (status) chips.push({ key: 'status', label: `Status: ${STATUS_META[status].label}`, clear: () => updateQuery({ filters: { status: '' } }) });
  const availability = /** @type {keyof typeof AVAILABILITY_META | ''} */ (query.filters.availability);
  if (availability) chips.push({ key: 'availability', label: `Availability: ${AVAILABILITY_META[availability].label}`, clear: () => updateQuery({ filters: { availability: '' } }) });

  const existing = new Set(qsa('[data-chip]', chipsHost).map((chip) => chip.dataset.chip));
  chipsHost.replaceChildren(...[
    ...chips.map((chip) => {
      const node = el('li', { class: ['chip', existing.has(chip.key) ? '' : 'chip--enter'], data: { chip: chip.key } },
        el('span', { class: 'chip__label', text: chip.label }),
        el('button', {
          type: 'button',
          class: 'chip__remove',
          attrs: { 'aria-label': `Remove filter: ${chip.label}` },
          on: { click: () => { chip.clear(); focusAfterChipRemoval(); } }
        }, icon('close', { size: 14 })));
      return node;
    }),
    chips.length > 0 ? el('li', {}, el('button', {
      type: 'button',
      class: 'btn btn--ghost btn--small',
      text: 'Clear filters',
      on: { click: () => { searchInput.value = ''; applyQuery(clearFilters(store.get().query)); searchInput.focus(); } }
    })) : null
  ].filter((node) => node !== null));
  chipsHost.closest('.list-meta')?.classList.toggle('has-chips', chips.length > 0);
}

/** After removing a chip, keep keyboard focus somewhere sensible. */
function focusAfterChipRemoval() {
  const next = /** @type {HTMLElement | null} */ (chipsHost.querySelector('.chip__remove'));
  (next || searchInput).focus({ preventScroll: true });
}

/** @param {ListState} query */
function applyQuery(query) {
  store.set({ query });
  window.history.pushState(null, '', urlFor(query));
  syncControls();
  load({ reason: 'user' });
}

/**
 * Draw the table (wide layouts) and the cards (narrow layouts). CSS container
 * queries decide which one is visible, so both are kept in step.
 * @param {{ mode: 'stagger' | 'flip', highlightId?: string, morphId?: string }} options
 */
function renderList({ mode, highlightId, morphId }) {
  closeMenus();
  const { items, query } = store.get();
  if (!items.length) {
    listHost.replaceChildren(emptyFor(query));
    return;
  }

  // Remember focus and positions so the re-render is seamless.
  const focusKey = /** @type {HTMLElement | null} */ (document.activeElement)?.closest?.('[data-focus-key]')?.getAttribute('data-focus-key') || null;
  /** @type {Map<string, DOMRect>} */
  const before = new Map();
  if (mode === 'flip') {
    for (const node of qsa(ROW_SELECTOR, listHost)) {
      const rect = node.getBoundingClientRect();
      if (rect.width) before.set(node.dataset.id || '', rect);
    }
  }

  const table = buildTable(items, query.sort, { highlightId, morphId });
  const cards = el('ul', { class: 'quiz-cards', attrs: { 'aria-label': 'Quizzes' } },
    items.map((quiz) => buildCard(quiz, { highlightId, morphId })));
  listHost.replaceChildren(table, cards);

  if (focusKey) {
    const target = qsa(`[data-focus-key="${CSS.escape(focusKey)}"]`, listHost).find((node) => node.offsetParent !== null);
    target?.focus({ preventScroll: true });
  }

  const visibleRows = qsa(ROW_SELECTOR, listHost).filter((node) => node.offsetParent !== null);
  if (mode === 'stagger') {
    stagger(visibleRows);
    store.set({ hasShownRows: true });
    return;
  }
  if (prefersReducedMotion()) return;
  for (const node of visibleRows) {
    const id = node.dataset.id || '';
    const old = before.get(id);
    if (old) {
      const now = node.getBoundingClientRect();
      const dy = old.top - now.top;
      if (Math.abs(dy) > 1) {
        node.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }],
          { duration: 320, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
      }
    } else {
      node.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
        { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    }
  }
}

/**
 * @param {QuizSummary[]} items
 * @param {string} sort
 * @param {{ highlightId?: string, morphId?: string }} marks
 */
function buildTable(items, sort, marks) {
  const [sortField, sortDirection] = sort.split(':');
  const sortLabel = QUIZ_SORTS.find((option) => option.value === sort)?.label || '';

  /**
   * @param {string} label
   * @param {keyof typeof SORT_COLUMNS | null} field
   * @param {string} [className]
   */
  const header = (label, field, className = '') => {
    if (!field) return el('th', { scope: 'col', class: className, text: label });
    const active = sortField === field;
    return el('th', {
      scope: 'col',
      class: [className, active ? 'is-sorted' : ''],
      attrs: { 'aria-sort': active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : null }
    },
    el('button', { type: 'button', class: 'sort-button', data: { sortField: field, focusKey: `sort:${field}` } },
      el('span', { text: label }),
      icon(active ? (sortDirection === 'asc' ? 'arrowUp' : 'arrowDown') : 'arrowUpDown', { size: 14, className: 'sort-button__icon' })));
  };

  return el('table', { class: 'data-table quiz-table' },
    el('caption', { class: 'sr-only', text: `Quizzes, sorted by ${sortLabel}` }),
    el('thead', {}, el('tr', {},
      header('Title', 'title', 'col-title'),
      header('Status', null, 'col-status'),
      header('Availability', null, 'col-availability'),
      header('Questions', null, 'col-questions num'),
      header('Marks', null, 'col-marks num'),
      header('Attempts', 'attemptCount', 'col-attempts num'),
      header('Last updated', 'updatedAt', 'col-updated'),
      el('th', { scope: 'col', class: 'col-actions' }, el('span', { class: 'sr-only', text: 'Actions' }))
    )),
    el('tbody', {}, items.map((quiz) => buildRow(quiz, marks)))
  );
}

/** @param {QuizSummary} quiz */
function titleBlock(quiz) {
  const title = quiz.title.trim() || 'Untitled quiz';
  return [
    el('div', { class: 'quiz-title-line' },
      el('a', { class: ['quiz-title', quiz.title.trim() ? '' : 'is-untitled'], href: editorUrl(quiz.id), data: { focusKey: `title:${quiz.id}` }, text: title }),
      isLocked(quiz) && el('span', { class: 'lock-hint', attrs: { title: 'Locked: students have already taken this quiz' } },
        icon('lock', { size: 14 }), el('span', { class: 'sr-only', text: '(locked because students have taken it)' }))),
    quiz.description && el('p', { class: 'quiz-desc', text: quiz.description })
  ];
}

/** @param {QuizSummary} quiz @param {string | undefined} morphId */
function statusCell(quiz, morphId) {
  const badge = statusBadge(quiz.status);
  if (quiz.id === morphId) {
    badge.classList.add('badge--morph');
    badge.querySelector('svg')?.classList.add('check-draw');
  }
  return badge;
}

/** @param {QuizSummary} quiz */
function availabilityBlock(quiz) {
  const info = availabilityInfo(quiz);
  return el('div', { class: 'availability' },
    info.availability && availabilityBadge(info.availability, { soon: info.soon }),
    el('span', {
      class: ['availability__detail', info.soon ? 'is-soon' : '', info.availability ? '' : 'is-muted'],
      attrs: { title: info.title || null }
    }, info.soon && icon('clock', { size: 14 }), info.detail)
  );
}

/** @param {string} iso */
function updatedTime(iso) {
  return el('time', { datetime: iso, attrs: { title: formatDateTime(iso) }, text: formatRelative(iso) });
}

/** @param {QuizSummary} quiz @param {'row' | 'card'} where */
function menuButton(quiz, where) {
  const button = el('button', {
    type: 'button',
    class: 'btn btn--ghost btn--icon row-menu',
    attrs: { 'aria-label': `Actions for ${quiz.title || 'Untitled quiz'}` },
    data: { rowMenu: '', quizId: quiz.id, focusKey: `menu:${quiz.id}:${where}` }
  });
  menuButtonAttrs(button);
  showBusy(button, busyIds.has(quiz.id));
  return button;
}

/**
 * While an action runs, the ⋯ button shows a spinner. It stays focusable
 * (aria-disabled rather than disabled) so keyboard focus isn't lost.
 * @param {HTMLElement} button
 * @param {boolean} busy
 */
function showBusy(button, busy) {
  button.classList.toggle('is-busy', busy);
  if (busy) {
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('aria-busy', 'true');
  } else {
    button.removeAttribute('aria-disabled');
    button.removeAttribute('aria-busy');
  }
  button.replaceChildren(busy ? el('span', { class: 'spinner', attrs: { 'aria-hidden': 'true' } }) : icon('more'));
}

/**
 * @param {QuizSummary} quiz
 * @param {{ highlightId?: string, morphId?: string }} marks
 */
function buildRow(quiz, { highlightId, morphId }) {
  return el('tr', {
    class: ['quiz-row', quiz.id === highlightId ? 'is-highlighted' : '', busyIds.has(quiz.id) ? 'is-busy' : ''],
    data: { id: quiz.id }
  },
  el('td', { class: 'col-title' }, titleBlock(quiz),
    // Shown under the title when the table is too narrow for every column.
    el('p', { class: 'quiz-meta' },
      el('span', { class: 'quiz-meta__counts', text: `${plural(quiz.questionCount, 'question')} · ${plural(quiz.totalMarks, 'mark')}` }),
      el('span', { class: 'quiz-meta__attempts', text: ` · ${plural(quiz.attemptCount, 'attempt')}` }),
      el('span', { class: 'quiz-meta__updated' }, ' · Updated ', updatedTime(quiz.updatedAt)))),
  el('td', { class: 'col-status' }, statusCell(quiz, morphId)),
  el('td', { class: 'col-availability' }, availabilityBlock(quiz)),
  el('td', { class: 'col-questions num', text: formatNumber(quiz.questionCount) }),
  el('td', { class: 'col-marks num', text: formatNumber(quiz.totalMarks) }),
  el('td', { class: 'col-attempts num', text: formatNumber(quiz.attemptCount) }),
  el('td', { class: 'col-updated' }, updatedTime(quiz.updatedAt)),
  el('td', { class: 'col-actions' }, menuButton(quiz, 'row'))
  );
}

/**
 * @param {QuizSummary} quiz
 * @param {{ highlightId?: string, morphId?: string }} marks
 */
function buildCard(quiz, { highlightId, morphId }) {
  return el('li', {
    class: ['quiz-card', quiz.id === highlightId ? 'is-highlighted' : '', busyIds.has(quiz.id) ? 'is-busy' : ''],
    data: { id: quiz.id }
  },
  el('div', { class: 'quiz-card__head' },
    el('div', { class: 'quiz-card__titles' }, titleBlock(quiz)),
    menuButton(quiz, 'card')),
  el('div', { class: 'quiz-card__status' }, statusCell(quiz, morphId), availabilityBlock(quiz)),
  el('dl', { class: 'quiz-card__stats' },
    el('div', {}, el('dt', { text: 'Questions' }), el('dd', { class: 'num', text: formatNumber(quiz.questionCount) })),
    el('div', {}, el('dt', { text: 'Marks' }), el('dd', { class: 'num', text: formatNumber(quiz.totalMarks) })),
    el('div', {}, el('dt', { text: 'Attempts' }), el('dd', { class: 'num', text: formatNumber(quiz.attemptCount) }))),
  el('p', { class: 'quiz-card__updated' }, 'Updated ', updatedTime(quiz.updatedAt))
  );
}

function listSkeleton() {
  return el('div', { class: 'list-skeleton', attrs: { role: 'status' } },
    el('span', { class: 'sr-only', text: 'Loading quizzes…' }),
    Array.from({ length: 6 }, (_, index) => el('div', { class: 'list-skeleton__row', attrs: { 'aria-hidden': 'true' } },
      el('div', { class: 'list-skeleton__main' },
        el('div', { class: 'skeleton skeleton--line', attrs: { style: `width:${[62, 48, 70, 55, 66, 44][index]}%` } }),
        el('div', { class: 'skeleton skeleton--line skeleton--thin', attrs: { style: `width:${[80, 64, 72, 58, 76, 60][index]}%` } })),
      el('div', { class: 'skeleton skeleton--pill' }),
      el('div', { class: 'skeleton skeleton--line list-skeleton__side' }))));
}

/**
 * The right empty state: nothing created yet, nothing in this filter, or no matches.
 * @param {ListState} query
 */
function emptyFor(query) {
  const { status, availability } = query.filters;
  const clear = { label: 'Clear filters', variant: /** @type {const} */ ('ghost'), onClick: () => { searchInput.value = ''; applyQuery(clearFilters(query)); } };
  const create = { label: 'New quiz', variant: /** @type {const} */ ('primary'), onClick: () => newQuiz() };

  if (query.q) {
    return emptyState({
      iconName: 'searchX',
      title: `No quizzes match “${query.q}”`,
      message: status || availability
        ? 'Check the spelling, or search all quizzes instead of only this filter.'
        : 'Check the spelling, or try a shorter search. Search looks at quiz titles and descriptions.',
      actions: [clear]
    });
  }
  if (availability) {
    const label = AVAILABILITY_META[/** @type {keyof typeof AVAILABILITY_META} */ (availability)].label.toLowerCase();
    return emptyState({ iconName: 'calendar', title: `No ${label} quizzes`, message: 'No published quiz is in this state right now.', actions: [clear] });
  }
  if (status === 'archived') {
    return emptyState({ iconName: 'archive', title: 'No archived quizzes', message: 'Quizzes you archive appear here. You can restore them at any time.', actions: [clear] });
  }
  if (status === 'draft') {
    return emptyState({ iconName: 'edit', title: 'No drafts', message: 'New quizzes start as drafts, and stay private until you publish them.', actions: [create, clear] });
  }
  if (status === 'published') {
    return emptyState({ iconName: 'send', title: 'No published quizzes', message: 'Publish a draft when it’s ready for students.', actions: [clear] });
  }
  return emptyState({
    iconName: 'inbox',
    title: 'No quizzes yet',
    message: 'Create your first quiz to get started. You’ll add questions and settings, then publish it when it’s ready.',
    actions: [create]
  });
}

// Actions ---------------------------------------------------------------------------------

/**
 * @param {QuizActionId} action
 * @param {QuizSummary} quiz
 * @param {HTMLButtonElement} trigger
 */
async function runAction(action, quiz, trigger) {
  switch (action) {
    case 'edit':
    case 'view':
      window.location.href = editorUrl(quiz.id);
      return;
    case 'preview':
      window.location.href = previewUrl(quiz.id);
      return;
    case 'duplicate': return duplicate(quiz);
    case 'publish': return publish(quiz);
    case 'unpublish': return unpublish(quiz);
    case 'archive': return archive(quiz);
    case 'restore': return restore(quiz);
    case 'delete': return remove(quiz, trigger);
    default:
  }
}

/** @param {string} id @param {boolean} busy */
function setBusy(id, busy) {
  if (busy) busyIds.add(id);
  else busyIds.delete(id);
  qsa(`[data-id="${CSS.escape(id)}"]`, listHost).forEach((node) => {
    node.classList.toggle('is-busy', busy);
    const button = /** @type {HTMLElement | null} */ (node.querySelector('[data-row-menu]'));
    if (button) showBusy(button, busy);
  });
}

/**
 * Run an API action for one quiz with a busy row and consistent error handling.
 * @template T
 * @param {QuizSummary} quiz
 * @param {() => Promise<T>} call
 * @returns {Promise<T | undefined>}
 */
async function withBusy(quiz, call) {
  setBusy(quiz.id, true);
  try {
    return await call();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin();
      return undefined;
    }
    if (error instanceof ApiError && error.status === 404) {
      toast({ type: 'error', message: 'That quiz no longer exists. The list has been refreshed.' });
      load({ reason: 'refresh' });
      return undefined;
    }
    throw error;
  } finally {
    setBusy(quiz.id, false);
  }
}

/** @param {unknown} error @param {string} what */
function actionFailed(error, what) {
  toast({ type: 'error', message: `Couldn't ${what}. ${userMessage(error)}` });
}

/** Fade a quiz's row out, then close the gap smoothly. @param {string} id */
async function removeRowLocally(id) {
  const nodes = qsa(`[data-id="${CSS.escape(id)}"]`, listHost);
  if (!prefersReducedMotion()) {
    await Promise.all(nodes.filter((node) => node.offsetParent !== null).map((node) =>
      node.animate([{ opacity: 1 }, { opacity: 0, transform: 'scale(0.98)' }],
        { duration: 160, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }).finished.catch(() => {})));
  }
  const others = qsa(ROW_SELECTOR, listHost).filter((node) => node.dataset.id !== id && node.offsetParent !== null);
  flip(others, () => nodes.forEach((node) => node.remove()));
  store.set({ items: store.get().items.filter((quiz) => quiz.id !== id), total: Math.max(0, store.get().total - 1) });
}

/** @param {QuizSummary} quiz */
const quizName = (quiz) => `“${quiz.title || 'Untitled quiz'}”`;

/** @param {QuizSummary} quiz */
async function duplicate(quiz) {
  try {
    const copy = await withBusy(quiz, () => api.duplicateQuiz(quiz.id));
    if (!copy) return;
    toast({
      type: 'success',
      message: `Duplicated as “${copy.title}”. It’s a new draft with no attempts.`,
      action: { label: 'Open copy', onClick: () => { window.location.href = editorUrl(copy.id); } }
    });
    await load({ reason: 'refresh', highlightId: copy.id });
  } catch (error) {
    actionFailed(error, 'duplicate the quiz');
  }
}

/**
 * Key facts repeated in the publish confirmation (section 21).
 * @param {QuizSummary} quiz
 */
function publishFacts(quiz) {
  const { settings } = quiz;
  /** @type {[string, string][]} */
  const rows = [
    ['Questions', formatNumber(quiz.questionCount)],
    ['Total marks', formatNumber(quiz.totalMarks)],
    ['Opens', settings.opensAt ? formatDateTime(settings.opensAt) : 'As soon as it’s published'],
    ['Closes', settings.closesAt ? formatDateTime(settings.closesAt) : 'No close date'],
    ['Attempts allowed', settings.maxAttempts === null ? 'Unlimited' : formatNumber(settings.maxAttempts)],
    ['Time limit', settings.durationMinutes ? plural(settings.durationMinutes, 'minute') : 'None']
  ];
  return el('dl', { class: 'facts' }, rows.map(([term, value]) =>
    el('div', { class: 'facts__row' }, el('dt', { text: term }), el('dd', { class: 'num', text: value }))));
}

/**
 * "Not ready to publish" with a list of problems and a way to fix them.
 * @param {QuizSummary} quiz
 * @param {string[]} problems
 */
async function showNotReady(quiz, problems) {
  const choice = await openDialog({
    title: 'This quiz isn’t ready to publish',
    body: [
      `Fix ${problems.length === 1 ? 'this' : 'these'} in ${quizName(quiz)} first:`,
      el('ul', { class: 'problem-list' }, problems.map((problem) => el('li', {}, icon('alertCircle', { size: 16 }), el('span', { text: problem }))))
    ],
    actions: [
      { label: 'Close', value: 'close', variant: 'ghost' },
      { label: 'Open quiz', value: 'open', variant: 'primary', autofocus: true }
    ]
  });
  if (choice === 'open') window.location.href = editorUrl(quiz.id);
}

/** @param {QuizSummary} quiz */
async function publish(quiz) {
  const blockers = quickPublishBlockers(quiz);
  if (blockers.length) return showNotReady(quiz, blockers);

  const opensLater = quiz.settings.opensAt && Date.parse(quiz.settings.opensAt) > Date.now();
  const confirmed = await confirmDialog({
    title: `Publish ${quizName(quiz)}?`,
    message: [
      opensLater
        ? 'Students will see it when it opens. Check the details below.'
        : 'Students will be able to start it straight away. Check the details below.',
      publishFacts(quiz)
    ],
    confirmLabel: 'Publish quiz'
  });
  if (!confirmed) return;

  try {
    const published = await withBusy(quiz, () => api.publishQuiz(quiz.id));
    if (!published) return;
    toast({
      type: 'success',
      message: published.availability === 'scheduled' && published.settings.opensAt
        ? `Published. ${quizName(published)} opens ${formatDateTime(published.settings.opensAt)}.`
        : `Published. Students can now start ${quizName(published)}.`
    });
    await load({ reason: 'refresh', highlightId: quiz.id, morphId: quiz.id });
  } catch (error) {
    if (error instanceof ApiError && error.code === 'PUBLISH_BLOCKED') {
      const problems = Object.values(error.fieldErrors);
      return showNotReady(quiz, problems.length ? problems : [error.message]);
    }
    actionFailed(error, 'publish the quiz');
  }
}

/** @param {QuizSummary} quiz */
async function unpublish(quiz) {
  const confirmed = await confirmDialog({
    title: `Unpublish ${quizName(quiz)}?`,
    message: [
      'Students won’t be able to start new attempts. Anyone already taking it can finish and submit.',
      isLocked(quiz)
        ? 'It goes back to Drafts. Its questions stay locked because students have already taken it.'
        : 'It goes back to Drafts, where you can edit it and publish it again.'
    ],
    confirmLabel: 'Unpublish'
  });
  if (!confirmed) return;
  try {
    const updated = await withBusy(quiz, () => api.unpublishQuiz(quiz.id));
    if (!updated) return;
    toast({ type: 'success', message: `Unpublished. ${quizName(quiz)} is back in Drafts.` });
    await afterStatusChange(quiz.id, 'draft');
  } catch (error) {
    actionFailed(error, 'unpublish the quiz');
  }
}

/** @param {QuizSummary} quiz */
async function archive(quiz) {
  const confirmed = await confirmDialog({
    title: `Archive ${quizName(quiz)}?`,
    message: [
      quiz.status === 'published'
        ? 'Students will no longer be able to start it. It will be hidden from your active lists and become read-only.'
        : 'It will be hidden from your active lists and become read-only.',
      quiz.attemptCount
        ? `Its ${plural(quiz.attemptCount, 'attempt')} and results are kept. You can restore it at any time.`
        : 'You can restore it at any time.'
    ],
    confirmLabel: 'Archive'
  });
  if (!confirmed) return;
  await doArchive(quiz);
}

/** @param {QuizSummary} quiz */
async function doArchive(quiz) {
  try {
    const updated = await withBusy(quiz, () => api.archiveQuiz(quiz.id));
    if (!updated) return;
    toast({
      type: 'success',
      message: `Archived ${quizName(quiz)}.`,
      action: store.get().query.filters.status === 'archived' ? undefined : {
        label: 'View archived',
        onClick: () => { searchInput.value = ''; applyQuery({ ...clearFilters(store.get().query), filters: { status: 'archived', availability: '' } }); }
      }
    });
    await afterStatusChange(quiz.id, 'archived');
  } catch (error) {
    actionFailed(error, 'archive the quiz');
  }
}

/** @param {QuizSummary} quiz */
async function restore(quiz) {
  try {
    const updated = await withBusy(quiz, () => api.restoreQuiz(quiz.id));
    if (!updated) return;
    toast({ type: 'success', message: `Restored. ${quizName(quiz)} is back in Drafts.` });
    await afterStatusChange(quiz.id, 'draft');
  } catch (error) {
    actionFailed(error, 'restore the quiz');
  }
}

/**
 * @param {QuizSummary} quiz
 * @param {HTMLButtonElement} trigger
 */
async function remove(quiz, trigger) {
  const reason = deleteBlockReason(quiz);
  if (reason) {
    const choice = await openDialog({
      title: 'This quiz can’t be deleted',
      body: [reason, 'Archive it instead: it will be hidden and read-only, and its results are kept.'],
      actions: [
        { label: 'Cancel', value: 'cancel', variant: 'ghost', autofocus: true },
        { label: 'Archive instead', value: 'archive', variant: 'primary' }
      ]
    });
    if (choice === 'archive') await doArchive(quiz);
    return;
  }

  const confirmed = await confirmDialog({
    title: `Delete ${quizName(quiz)}?`,
    message: [
      quiz.questionCount
        ? `This permanently deletes the draft and its ${plural(quiz.questionCount, 'question')}.`
        : 'This permanently deletes the draft.',
      'This can’t be undone.'
    ],
    confirmLabel: 'Delete quiz',
    tone: 'danger'
  });
  if (!confirmed) return;
  try {
    let done = false;
    await withBusy(quiz, async () => { await api.deleteQuiz(quiz.id); done = true; });
    if (!done) return;
    const nextFocus = neighbourFocus(quiz.id) || searchInput;
    await removeRowLocally(quiz.id);
    nextFocus.focus({ preventScroll: true });
    toast({ type: 'success', message: `Deleted ${quizName(quiz)}.` });
    renderCount();
    await load({ reason: 'refresh' });
  } catch (error) {
    actionFailed(error, 'delete the quiz');
    if (trigger.isConnected) trigger.focus();
  }
}

/**
 * After a status change: if the quiz no longer belongs in this filter, fade it
 * out; then refresh so counts, order and the next page's rows are right.
 * @param {string} id
 * @param {import('../types.js').QuizStatus} newStatus
 */
async function afterStatusChange(id, newStatus) {
  const { status, availability } = store.get().query.filters;
  const stillMatches = status ? status === newStatus : newStatus !== 'archived';
  if (!stillMatches || availability) {
    const nextFocus = neighbourFocus(id);
    await removeRowLocally(id);
    nextFocus?.focus({ preventScroll: true });
    await load({ reason: 'refresh' });
  } else {
    await load({ reason: 'refresh', highlightId: id });
  }
}

/**
 * Where keyboard focus should go when a row disappears: the next row's title,
 * or the previous one's.
 * @param {string} id
 * @returns {HTMLElement | null}
 */
function neighbourFocus(id) {
  if (!listHost.contains(document.activeElement) && !document.activeElement?.closest('.menu')) return null;
  const rows = qsa(ROW_SELECTOR, listHost).filter((node) => node.offsetParent !== null);
  const index = rows.findIndex((node) => node.dataset.id === id);
  const neighbour = rows[index + 1] || rows[index - 1];
  return neighbour ? /** @type {HTMLElement | null} */ (neighbour.querySelector('.quiz-title')) : null;
}

// New quiz -------------------------------------------------------------------------------

async function newQuiz() {
  const inputId = 'new-quiz-title';
  const input = el('input', {
    class: 'input',
    id: inputId,
    name: 'title',
    type: 'text',
    autocomplete: 'off',
    attrs: { 'aria-describedby': `${inputId}-hint`, required: true }
  });
  const counter = el('span', { class: 'char-count num', attrs: { 'aria-hidden': 'true' }, text: `0 / ${TITLE_MAX_LENGTH}` });
  const alertSlot = el('div', { hidden: true });
  const field = el('div', { class: 'field' },
    el('label', { class: 'field__label', for: inputId, text: 'Quiz title' }),
    el('div', { class: 'field__control' }, input),
    el('div', { class: 'field__row' },
      el('p', { class: 'field__hint', id: `${inputId}-hint`, text: `For example “Leadership Essentials”. Up to ${TITLE_MAX_LENGTH} characters.` }),
      counter),
    el('div', { class: 'field__message' }, el('div', {})));

  const validate = () => validateValue(input.value, [
    rules.required('Enter a title for the quiz'),
    rules.maxLength(TITLE_MAX_LENGTH, 'Title')
  ]);
  input.addEventListener('input', () => {
    const length = input.value.length;
    counter.textContent = `${length} / ${TITLE_MAX_LENGTH}`;
    counter.classList.toggle('is-over', length > TITLE_MAX_LENGTH);
    counter.classList.toggle('is-near', length > TITLE_MAX_LENGTH - 20 && length <= TITLE_MAX_LENGTH);
    if (input.getAttribute('aria-invalid') === 'true') {
      const message = validate();
      if (message) setFieldError(input, message, { shake: false });
      else clearFieldError(input);
    }
  });

  const created = await formDialog({
    title: 'New quiz',
    description: 'Start with a title. Next you’ll add the details, questions and settings — it stays a private draft until you publish it.',
    body: [alertSlot, field],
    submitLabel: 'Create quiz',
    onSubmit: async () => {
      hideFormMessage(alertSlot);
      const message = validate();
      if (message) {
        setFieldError(input, message);
        input.focus();
        return undefined;
      }
      try {
        return await api.createQuiz({ title: input.value });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          redirectToLogin();
          return undefined;
        }
        if (error instanceof ApiError && error.fieldErrors.title) {
          setFieldError(input, error.fieldErrors.title);
          input.focus();
          return undefined;
        }
        showFormAlert(alertSlot, userMessage(error));
        return undefined;
      }
    }
  });

  if (created) {
    setFlash({ type: 'success', message: `Draft created. “${created.title}” is private until you publish it.` });
    window.location.href = `${editorUrl(created.id)}#details`;
  }
}
