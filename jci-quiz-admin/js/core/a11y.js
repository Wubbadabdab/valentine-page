// @ts-check
/**
 * Accessibility helpers: a screen-reader announcer and focus utilities.
 */

/** @type {{ polite: HTMLElement | null, assertive: HTMLElement | null }} */
const regions = { polite: null, assertive: null };

/** @param {'polite' | 'assertive'} politeness */
function region(politeness) {
  let node = regions[politeness];
  if (!node || !node.isConnected) {
    node = document.createElement('div');
    node.className = 'sr-only';
    node.setAttribute('aria-live', politeness);
    node.setAttribute('aria-atomic', 'true');
    if (politeness === 'assertive') node.setAttribute('role', 'alert');
    document.body.appendChild(node);
    regions[politeness] = node;
  }
  return node;
}

/**
 * Announce a message to screen readers (save status, toasts, reorder moves…).
 * @param {string} message
 * @param {{ assertive?: boolean }} [options]
 */
export function announce(message, { assertive = false } = {}) {
  const node = region(assertive ? 'assertive' : 'polite');
  node.textContent = '';
  // A short delay makes repeated identical messages announce again.
  window.setTimeout(() => { node.textContent = message; }, 50);
}

/**
 * Move focus to an element, making it focusable first if needed.
 * @param {HTMLElement | null} element
 * @param {{ preventScroll?: boolean }} [options]
 */
export function focusElement(element, { preventScroll = false } = {}) {
  if (!element) return;
  if (!element.matches('a[href], button, input, select, textarea, [tabindex]')) {
    element.setAttribute('tabindex', '-1');
  }
  element.focus({ preventScroll });
}
