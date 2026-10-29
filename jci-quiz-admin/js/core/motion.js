// @ts-check
/**
 * Motion helpers (section 39). All of them respect prefers-reduced-motion.
 */

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * FLIP: record positions, apply a DOM change, then glide elements from their
 * old positions to the new ones (transform only).
 * @param {Element[]} elements    elements that may move
 * @param {() => void} mutate     the DOM change
 * @param {{ duration?: number, easing?: string }} [options]
 */
export function flip(elements, mutate, { duration = 320, easing = 'cubic-bezier(0.65, 0, 0.35, 1)' } = {}) {
  const first = new Map(elements.map((node) => [node, node.getBoundingClientRect()]));
  mutate();
  if (prefersReducedMotion() || !Element.prototype.animate) return;
  for (const [node, before] of first) {
    if (!node.isConnected) continue;
    const after = node.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (!dx && !dy) continue;
    node.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
      { duration, easing }
    );
  }
}

/**
 * Fade items up one after another — for a list's FIRST load only.
 * At most `max` items are staggered; the rest appear with the last one.
 * @param {Element[]} elements
 * @param {{ delay?: number, max?: number, duration?: number }} [options]
 */
export function stagger(elements, { delay = 30, max = 8, duration = 220 } = {}) {
  if (prefersReducedMotion() || !Element.prototype.animate) return;
  elements.forEach((node, index) => {
    node.animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
      { duration, delay: Math.min(index, max - 1) * delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }
    );
  });
}

let skipNextTransition = false;

/** Skip the page-change animation for the next navigation (automatic redirects shouldn't animate). */
export function skipNextPageTransition() {
  skipNextTransition = true;
}

/**
 * Cross-document View Transitions (page changes): when the browser skips one —
 * for example because a page redirects straight away — its promises reject.
 * That's expected, so handle it quietly instead of reporting an error.
 * @param {Event} event
 */
function quietPageTransition(event) {
  const transition = /** @type {any} */ (event).viewTransition;
  if (!transition) return;
  if (event.type === 'pageswap' && skipNextTransition) transition.skipTransition();
  transition.ready?.catch(() => {});
  transition.finished?.catch(() => {});
  transition.updateCallbackDone?.catch(() => {});
}
window.addEventListener('pagereveal', quietPageTransition);
window.addEventListener('pageswap', quietPageTransition);

// Safety net: only the browser's "transition was skipped" rejection is silenced — every other error still reports.
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason instanceof DOMException && reason.name === 'InvalidStateError' && /transition/i.test(reason.message)) {
    event.preventDefault();
  }
});
