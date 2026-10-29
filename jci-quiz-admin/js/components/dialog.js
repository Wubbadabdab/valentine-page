// @ts-check
/**
 * Dialogs built on the native <dialog> element with showModal():
 * focus moves in, Esc closes, the page behind is inert, and focus returns to
 * the button that opened it. Sheets on phones (see css).
 */
import { el } from '../core/dom.js';

let counter = 0;

/**
 * @typedef {Object} DialogAction
 * @property {string} label
 * @property {string} value                 Returned when chosen
 * @property {'primary' | 'danger' | 'ghost'} [variant]
 * @property {boolean} [autofocus]          The safest action gets focus first
 */

/**
 * Open a dialog and resolve with the chosen action's value, or null if it was
 * dismissed (Esc, backdrop, or a cancel action returning null).
 * @param {{ title: string, body?: string | Node | (string | Node)[], actions: DialogAction[] }} options
 * @returns {Promise<string | null>}
 */
export function openDialog({ title, body = [], actions }) {
  return new Promise((resolve) => {
    const id = `dialog-${++counter}`;
    const opener = /** @type {HTMLElement | null} */ (document.activeElement);
    const paragraphs = (Array.isArray(body) ? body : [body]).map((part) =>
      typeof part === 'string' ? el('p', { text: part }) : part
    );

    /** @type {string | null} */
    let result = null;
    const buttons = actions.map((action) =>
      el('button', {
        type: 'button',
        class: ['btn', action.variant ? `btn--${action.variant}` : ''],
        text: action.label,
        on: { click: () => { result = action.value; dialog.close(); } }
      })
    );

    const dialog = el('dialog', {
      class: 'dialog',
      attrs: { 'aria-labelledby': `${id}-title`, 'aria-describedby': `${id}-body` }
    },
    el('div', { class: 'dialog__panel' },
      el('div', { class: 'dialog__header' }, el('h2', { id: `${id}-title`, text: title })),
      el('div', { class: 'dialog__body', id: `${id}-body` }, paragraphs),
      el('div', { class: 'dialog__footer' }, buttons)
    ));

    // Clicking the backdrop (the dialog element itself, outside the panel) dismisses it.
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      resolve(result);
      window.setTimeout(() => dialog.remove(), 400); // after the exit transition
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    });

    document.body.appendChild(dialog);
    dialog.showModal();
    const preferred = actions.findIndex((action) => action.autofocus);
    buttons[preferred >= 0 ? preferred : 0]?.focus();
  });
}

/**
 * A yes/no confirmation that explains the consequences in plain language.
 * For destructive actions (tone "danger"), Cancel gets focus first.
 * @param {{ title: string, message: string | Node | (string | Node)[], confirmLabel?: string, cancelLabel?: string, tone?: 'default' | 'danger' }} options
 * @returns {Promise<boolean>}
 */
export async function confirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'default' }) {
  const value = await openDialog({
    title,
    body: message,
    actions: [
      { label: cancelLabel, value: 'cancel', variant: 'ghost', autofocus: tone === 'danger' },
      { label: confirmLabel, value: 'confirm', variant: tone === 'danger' ? 'danger' : 'primary', autofocus: tone !== 'danger' }
    ]
  });
  return value === 'confirm';
}
