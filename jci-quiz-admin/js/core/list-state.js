// @ts-check
/**
 * Search, filters, sort and page for any list (quizzes now; the Question Bank
 * and Results later), stored in the URL so refreshing, the back button and
 * shared links all work, e.g. ?q=bio&status=published&sort=updatedAt:desc&page=2
 * Pure functions: easy to test in tests.html.
 */

/**
 * @typedef {Object} ListSchema
 * @property {Record<string, readonly string[]>} filters   Allowed values per filter ('' always means "any")
 * @property {readonly string[]} sorts                     Allowed sort values, "field:asc|desc"
 * @property {string} defaultSort
 */

/**
 * @typedef {Object} ListState
 * @property {string} q
 * @property {Record<string, string>} filters
 * @property {string} sort
 * @property {number} page
 */

const MAX_QUERY_LENGTH = 200;

/**
 * Read list state from a query string. Unknown or invalid values fall back to
 * defaults, so a hand-edited or outdated link never breaks the page.
 * @param {string | URLSearchParams} search
 * @param {ListSchema} schema
 * @returns {ListState}
 */
export function parseListState(search, schema) {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  /** @type {Record<string, string>} */
  const filters = {};
  for (const [name, allowed] of Object.entries(schema.filters)) {
    const value = params.get(name) || '';
    filters[name] = allowed.includes(value) ? value : '';
  }
  const sort = params.get('sort') || '';
  const page = Number.parseInt(params.get('page') || '', 10);
  return {
    q: (params.get('q') || '').trim().slice(0, MAX_QUERY_LENGTH),
    filters,
    sort: schema.sorts.includes(sort) ? sort : schema.defaultSort,
    page: Number.isFinite(page) && page >= 1 ? page : 1
  };
}

/**
 * Write list state back to a query string ("" when everything is default).
 * Defaults are left out to keep links short.
 * @param {ListState} state
 * @param {ListSchema} schema
 */
export function listStateToSearch(state, schema) {
  const params = new URLSearchParams();
  const q = state.q.trim();
  if (q) params.set('q', q);
  for (const name of Object.keys(schema.filters)) {
    const value = state.filters[name];
    if (value) params.set(name, value);
  }
  if (state.sort && state.sort !== schema.defaultSort) params.set('sort', state.sort);
  if (state.page > 1) params.set('page', String(state.page));
  const text = params.toString();
  return text ? `?${text}` : '';
}

/**
 * True when a search or any filter is narrowing the list (sort and page don't count).
 * @param {ListState} state
 */
export function isFiltered(state) {
  return state.q.trim() !== '' || Object.values(state.filters).some(Boolean);
}

/**
 * The same state with no search or filters (sort is kept).
 * @param {ListState} state
 * @returns {ListState}
 */
export function clearFilters(state) {
  return {
    q: '',
    filters: Object.fromEntries(Object.keys(state.filters).map((name) => [name, ''])),
    sort: state.sort,
    page: 1
  };
}

/**
 * "Showing 21–40 of 134" numbers for a page.
 * @param {{ page: number, pageSize: number, total: number }} info
 */
export function pageRange({ page, pageSize, total }) {
  if (total <= 0) return { from: 0, to: 0, total: 0, pageCount: 1 };
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const from = (current - 1) * pageSize + 1;
  return { from, to: Math.min(total, from + pageSize - 1), total, pageCount };
}

/**
 * Page numbers to show, with null for a gap: [1, null, 4, 5, 6, null, 12].
 * Always includes the first, last and current page plus one either side.
 * @param {number} page
 * @param {number} pageCount
 * @returns {(number | null)[]}
 */
export function pageList(page, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const wanted = new Set([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => wanted.add(n));
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((n) => wanted.add(n));
  const pages = [...wanted].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  /** @type {(number | null)[]} */
  const result = [];
  pages.forEach((n, index) => {
    if (index > 0 && n - pages[index - 1] > 1) result.push(null);
    result.push(n);
  });
  return result;
}
