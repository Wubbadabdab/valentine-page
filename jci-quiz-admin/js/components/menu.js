// @ts-check
/**
 * Action menus (the "⋯" button on each row), following the ARIA menu-button
 * pattern: aria-haspopup / aria-expanded on the button, arrow keys, Home/End,
 * type-ahead, Esc to close (focus returns to the button), Tab to leave.
 * The menu grows from the button that opened it, always fits on screen, and
 * follows the button if the page scrolls.
 */
import { el } from '../core/dom.js';
import { icon } from '../icons.js';
import { prefersReducedMotion } from '../core/motion.js';

/**
 * @typedef {Object} MenuItem
 * @property {string} id
 * @property {string} label
 * @property {string} [icon]
 * @property {'danger'} [tone]
 * @property {boolean} [separatorBefore]
 */

/** @type {{ close: (options?: { restoreFocus?: boolean }) => void } | null} */
let openMenu = null;
let counter = 0;

/** Close whichever menu is open (e.g. before the list re-renders). */
export function closeMenus() {
  openMenu?.close({ restoreFocus: false });
}

/**
 * Prepare a button to open a menu.
 * @param {HTMLButtonElement} button
 */
export function menuButtonAttrs(button) {
  button.setAttribute('aria-haspopup', 'menu');
  button.setAttribute('aria-expanded', 'false');
}

/**
 * Open a menu under (or above) its button.
 * @param {HTMLElement} trigger
 * @param {MenuItem[]} items
 * @param {{ label: string, onSelect: (id: string) => void, focus?: 'first' | 'last' }} options
 */
export function showMenu(trigger, items, { label, onSelect, focus = 'first' }) {
  if (openMenu) {
    const wasThisOne = trigger.getAttribute('aria-expanded') === 'true';
    openMenu.close({ restoreFocus: false });
    if (wasThisOne) return; // a second click on the same button closes it
  }

  const id = `menu-${++counter}`;
  const buttons = items.map((item) =>
    el('button', {
      type: 'button',
      class: ['menu__item', item.tone === 'danger' ? 'menu__item--danger' : ''],
      attrs: { role: 'menuitem', tabindex: '-1', 'data-menu-id': item.id }
    }, item.icon && icon(item.icon, { size: 18 }), el('span', { text: item.label }))
  );
  const menu = el('div', { class: 'menu', id, attrs: { role: 'menu', 'aria-label': label } },
    items.flatMap((item, index) => [
      item.separatorBefore && index > 0 && el('div', { class: 'menu__separator', attrs: { role: 'separator' } }),
      buttons[index]
    ])
  );

  let closed = false;
  /** @param {{ restoreFocus?: boolean }} [options] */
  const close = ({ restoreFocus = true } = {}) => {
    if (closed) return;
    closed = true;
    openMenu = null;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-controls');
    document.removeEventListener('pointerdown', onOutside, true);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
    if (restoreFocus && trigger.isConnected) trigger.focus({ preventScroll: true });
    if (prefersReducedMotion()) menu.remove();
    else {
      menu.classList.add('is-closing');
      window.setTimeout(() => menu.remove(), 160);
    }
  };

  /** @param {number} index */
  const focusItem = (index) => {
    const count = buttons.length;
    buttons[((index % count) + count) % count]?.focus();
  };
  const current = () => buttons.indexOf(/** @type {HTMLButtonElement} */ (document.activeElement));

  menu.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); focusItem(current() + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focusItem(current() - 1); }
    else if (event.key === 'Home') { event.preventDefault(); focusItem(0); }
    else if (event.key === 'End') { event.preventDefault(); focusItem(buttons.length - 1); }
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    else if (event.key === 'Tab') { close({ restoreFocus: false }); trigger.focus({ preventScroll: true }); }
    else if (event.key.length === 1 && /\S/.test(event.key)) {
      // Type-ahead: jump to the next item starting with that letter.
      const letter = event.key.toLowerCase();
      const start = current();
      for (let step = 1; step <= buttons.length; step += 1) {
        const index = (start + step) % buttons.length;
        if (items[index].label.toLowerCase().startsWith(letter)) { focusItem(index); break; }
      }
    }
  });
  menu.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-menu-id]') : null;
    if (!target) return;
    const choice = target.getAttribute('data-menu-id') || '';
    close();
    onSelect(choice);
  });

  /** @param {Event} event */
  function onOutside(event) {
    const target = /** @type {Node} */ (event.target);
    if (!menu.contains(target) && !trigger.contains(target)) close({ restoreFocus: false });
  }
  // When the page scrolls or resizes, the menu follows its button; it only
  // closes once the button has left the screen.
  let frame = 0;
  /** @param {Event} event */
  function onViewportChange(event) {
    if (event.type === 'scroll' && menu.contains(/** @type {Node} */ (event.target))) return;
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      if (closed) return;
      const rect = trigger.getBoundingClientRect();
      if (!trigger.isConnected || rect.bottom < 0 || rect.top > window.innerHeight) close({ restoreFocus: false });
      else position(menu, trigger);
    });
  }

  document.body.appendChild(menu);
  position(menu, trigger);
  trigger.setAttribute('aria-expanded', 'true');
  trigger.setAttribute('aria-controls', id);
  document.addEventListener('pointerdown', onOutside, true);
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, true);
  focusItem(focus === 'last' ? buttons.length - 1 : 0);

  openMenu = { close };
}

/**
 * Below the button, right-aligned; flips above when there isn't room, and is
 * clamped inside the viewport. transform-origin points at the button.
 * @param {HTMLElement} menu
 * @param {HTMLElement} trigger
 */
function position(menu, trigger) {
  const gap = 6;
  const margin = 8;
  const rect = trigger.getBoundingClientRect();
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  const below = window.innerHeight - rect.bottom - margin;
  const placeAbove = below < height + gap && rect.top - margin > below;
  const left = Math.min(Math.max(margin, rect.right - width), window.innerWidth - width - margin);
  const top = placeAbove ? Math.max(margin, rect.top - height - gap) : Math.min(rect.bottom + gap, window.innerHeight - height - margin);
  menu.style.left = `${left}px`;
  menu.style.top = `${Math.max(margin, top)}px`;
  const originX = Math.min(width, Math.max(0, rect.left + rect.width / 2 - left));
  menu.style.transformOrigin = `${originX}px ${placeAbove ? '100%' : '0'}`;
}
