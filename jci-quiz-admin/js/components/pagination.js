// @ts-check
/**
 * Pagination for any list: "Showing 21–40 of 134", rows per page, and
 * Previous / page numbers / Next. Page links are real links (they open in a
 * new tab with a middle-click), while a normal click updates the list in place.
 */
import { el } from '../core/dom.js';
import { icon } from '../icons.js';
import { formatNumber } from '../core/format.js';
import { pageRange, pageList } from '../core/list-state.js';

/**
 * @typedef {Object} PaginationOptions
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 * @property {readonly number[]} pageSizes
 * @property {string} noun                         e.g. "quizzes"
 * @property {(page: number) => string} hrefFor
 * @property {(page: number) => void} onPage
 * @property {(size: number) => void} onPageSize
 */

/** @param {MouseEvent} event */
const isPlainClick = (event) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/**
 * @param {PaginationOptions} options
 */
export function renderPagination({ page, pageSize, total, pageSizes, noun, hrefFor, onPage, onPageSize }) {
  const { from, to, pageCount } = pageRange({ page, pageSize, total });
  const current = Math.min(Math.max(1, page), pageCount);

  /**
   * @param {number} target
   * @param {string | Node[]} content
   * @param {{ label?: string, current?: boolean, disabled?: boolean, className?: string }} [options]
   */
  const pageLink = (target, content, { label, current: isCurrent = false, disabled = false, className = '' } = {}) => {
    if (disabled) {
      return el('span', { class: ['pagination__link', 'is-disabled', className], attrs: { 'aria-disabled': 'true', 'aria-label': label } }, content);
    }
    return el('a', {
      class: ['pagination__link', className],
      href: hrefFor(target),
      attrs: { 'aria-label': label, 'aria-current': isCurrent ? 'page' : null },
      on: {
        click: (event) => {
          if (!isPlainClick(/** @type {MouseEvent} */ (event))) return;
          event.preventDefault();
          if (!isCurrent) onPage(target);
        }
      }
    }, content);
  };

  const sizeId = `page-size-${Math.random().toString(36).slice(2, 8)}`;
  const sizeSelect = el('select', { class: 'select select--compact', id: sizeId },
    pageSizes.map((size) => el('option', { value: String(size), text: String(size), selected: size === pageSize }))
  );
  sizeSelect.addEventListener('change', () => onPageSize(Number(sizeSelect.value)));

  return el('div', { class: 'pagination' },
    el('p', { class: 'pagination__summary num' },
      total ? `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatNumber(total)} ${noun}` : `No ${noun}`),
    el('div', { class: 'pagination__size' },
      el('label', { class: 'pagination__size-label', for: sizeId, text: 'Rows per page' }),
      sizeSelect),
    pageCount > 1 && el('nav', { class: 'pagination__nav', attrs: { 'aria-label': 'Pages' } },
      pageLink(current - 1, [icon('chevronLeft', { size: 18 }), el('span', { class: 'pagination__word', text: 'Previous' })],
        { label: 'Previous page', disabled: current <= 1, className: 'pagination__step' }),
      el('span', { class: 'pagination__compact num', text: `Page ${current} of ${pageCount}` }),
      el('ul', { class: 'pagination__pages' },
        pageList(current, pageCount).map((n) => el('li', {},
          n === null
            ? el('span', { class: 'pagination__gap', attrs: { 'aria-hidden': 'true' }, text: '…' })
            : pageLink(n, String(n), { label: `Page ${n}`, current: n === current })
        ))),
      pageLink(current + 1, [el('span', { class: 'pagination__word', text: 'Next' }), icon('chevronRight', { size: 18 })],
        { label: 'Next page', disabled: current >= pageCount, className: 'pagination__step' })
    )
  );
}
