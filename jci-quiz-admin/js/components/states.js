// @ts-check
/**
 * Loading skeletons, empty states and error states with Retry.
 */
import { el } from '../core/dom.js';
import { icon } from '../icons.js';

/**
 * A loading skeleton. Screen readers hear "Loading…" once.
 * @param {{ label?: string, lines?: number }} [options]
 */
export function skeleton({ label = 'Loading…', lines = 3 } = {}) {
  const widths = ['92%', '78%', '85%', '64%', '72%'];
  return el('div', { class: 'stack', attrs: { role: 'status' } },
    el('span', { class: 'sr-only', text: label }),
    el('div', { class: 'skeleton skeleton--title', attrs: { 'aria-hidden': 'true' } }),
    Array.from({ length: lines }, (_, index) =>
      el('div', { class: 'skeleton skeleton--line', attrs: { 'aria-hidden': 'true', style: `width:${widths[index % widths.length]}` } })
    )
  );
}

/**
 * @typedef {Object} StateAction
 * @property {string} label
 * @property {string} [href]
 * @property {() => void} [onClick]
 * @property {'primary' | 'ghost'} [variant]
 */

/** @param {StateAction} action */
function actionNode(action) {
  const className = ['btn', action.variant ? `btn--${action.variant}` : ''];
  return action.href
    ? el('a', { class: className, href: action.href, text: action.label })
    : el('button', { type: 'button', class: className, text: action.label, on: { click: () => action.onClick?.() } });
}

/**
 * Nothing here yet / no matches.
 * @param {{ iconName?: string, title: string, message?: string, actions?: StateAction[] }} options
 */
export function emptyState({ iconName = 'compass', title, message, actions = [] }) {
  return el('div', { class: 'state' },
    el('span', { class: 'state__icon' }, icon(iconName)),
    el('h2', { class: 'state__title', text: title }),
    message && el('p', { class: 'state__message', text: message }),
    actions.length > 0 && el('div', { class: 'state__actions' }, actions.map(actionNode))
  );
}

/**
 * Something failed to load. Always offers Retry.
 * @param {{ title?: string, message: string, onRetry: () => void }} options
 */
export function errorState({ title = "Something didn't load", message, onRetry }) {
  return el('div', { class: 'state state--error', attrs: { role: 'alert' } },
    el('span', { class: 'state__icon' }, icon('alertCircle')),
    el('h2', { class: 'state__title', text: title }),
    el('p', { class: 'state__message', text: message }),
    el('div', { class: 'state__actions' },
      el('button', { type: 'button', class: 'btn btn--primary', on: { click: onRetry } }, icon('refresh', { size: 18 }), 'Try again')
    )
  );
}
