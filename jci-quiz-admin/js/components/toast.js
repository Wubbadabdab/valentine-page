// @ts-check
/**
 * Toasts: short messages in the corner (bottom-center on phones), with an
 * optional action such as Undo. Announced to screen readers. They pause while
 * hovered or focused, and existing toasts glide to make room.
 */
import { el } from '../core/dom.js';
import { icon } from '../icons.js';
import { announce } from '../core/a11y.js';
import { flip, prefersReducedMotion } from '../core/motion.js';

const MAX_TOASTS = 4;

/** @type {HTMLElement | null} */
let region = null;

function getRegion() {
  if (!region) region = el('div', { class: 'toast-region' });
  // Inside an open modal dialog the toast must live in the dialog (top layer) to stay visible.
  const host = document.querySelector('dialog[open]') || document.body;
  if (region.parentElement !== host) host.appendChild(region);
  return region;
}

/**
 * @typedef {Object} ToastOptions
 * @property {string} message
 * @property {'success' | 'error' | 'info'} [type]
 * @property {number} [duration]     ms before it disappears (default 5000; Undo toasts use ~6000)
 * @property {{ label: string, onClick: () => void }} [action]
 */

/**
 * @param {ToastOptions} options
 * @returns {{ dismiss: () => void }}
 */
export function toast({ message, type = 'info', duration = 5000, action }) {
  const host = getRegion();
  const iconName = type === 'success' ? 'checkCircle' : type === 'error' ? 'xCircle' : 'info';

  let remaining = duration;
  let startedAt = 0;
  let timer = 0;
  let leaving = false;

  const dismiss = () => {
    if (leaving) return;
    leaving = true;
    window.clearTimeout(timer);
    node.classList.add('is-leaving');
    const remove = () => flip([...host.children].filter((child) => child !== node), () => node.remove());
    if (prefersReducedMotion()) remove();
    else window.setTimeout(remove, 160);
  };

  const node = el('div', { class: ['toast', `toast--${type}`] },
    icon(iconName, { className: 'toast__icon' }),
    el('p', { class: 'toast__message', text: message }),
    el('div', { class: 'toast__actions' },
      action && el('button', {
        type: 'button',
        class: 'btn btn--ghost',
        text: action.label,
        on: { click: () => { action.onClick(); dismiss(); } }
      }),
      el('button', {
        type: 'button',
        class: 'btn btn--ghost btn--icon toast__close',
        attrs: { 'aria-label': 'Dismiss message' },
        on: { click: dismiss }
      }, icon('close', { size: 16 }))
    ),
    el('span', { class: 'toast__timer', attrs: { 'aria-hidden': 'true' } })
  );
  node.style.setProperty('--toast-duration', `${duration}ms`);

  const start = () => {
    if (leaving) return;
    startedAt = Date.now();
    timer = window.setTimeout(dismiss, remaining);
    node.classList.remove('is-paused');
  };
  const pause = () => {
    window.clearTimeout(timer);
    remaining = Math.max(1000, remaining - (Date.now() - startedAt));
    node.classList.add('is-paused');
  };
  node.addEventListener('pointerenter', pause);
  node.addEventListener('pointerleave', start);
  node.addEventListener('focusin', pause);
  node.addEventListener('focusout', (event) => {
    if (!node.contains(/** @type {Node | null} */ (event.relatedTarget))) start();
  });

  // Make room smoothly: existing toasts glide up as the new one arrives.
  flip([...host.children], () => {
    host.appendChild(node);
    while (host.children.length > MAX_TOASTS) host.firstElementChild?.remove();
  });
  announce(message, { assertive: type === 'error' });
  start();
  return { dismiss };
}
