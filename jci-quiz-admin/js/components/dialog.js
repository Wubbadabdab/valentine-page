// @ts-check
/**
 * Dialogs built on the native <dialog> element with showModal():
 * focus moves in, Esc closes, the page behind is inert, and focus returns to
 * the button that opened it. Sheets on phones (see css).
 */
import { el } from '../core/dom.js';
import { setButtonLoading } from './button.js';

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

/**
 * A dialog containing a form (e.g. "New quiz"). The dialog stays open while
 * onSubmit runs (with a loading button) and while it reports errors; it closes
 * with whatever onSubmit returns, unless that is undefined.
 * Esc and the backdrop are ignored while a submit is in progress.
 * @template T
 * @param {{
 *   title: string,
 *   description?: string,
 *   body: Node | Node[],
 *   submitLabel: string,
 *   cancelLabel?: string,
 *   onSubmit: (form: HTMLFormElement) => Promise<T | undefined>
 * }} options
 * @returns {Promise<T | null>}
 */
export function formDialog({ title, description, body, submitLabel, cancelLabel = 'Cancel', onSubmit }) {
  return new Promise((resolve) => {
    const id = `dialog-${++counter}`;
    const opener = /** @type {HTMLElement | null} */ (document.activeElement);
    let busy = false;
    /** @type {T | null} */
    let result = null;

    const submit = el('button', { type: 'submit', class: 'btn btn--primary' }, el('span', { class: 'btn__label', text: submitLabel }));
    const cancel = el('button', { type: 'button', class: 'btn btn--ghost', text: cancelLabel, on: { click: () => { if (!busy) dialog.close(); } } });
    const form = el('form', { class: 'dialog__panel', attrs: { novalidate: true } },
      el('div', { class: 'dialog__header' },
        el('h2', { id: `${id}-title`, text: title }),
        description && el('p', { class: 'dialog__description', id: `${id}-description`, text: description })),
      el('div', { class: 'dialog__body stack' }, body),
      el('div', { class: 'dialog__footer' }, cancel, submit)
    );
    const dialog = el('dialog', {
      class: 'dialog',
      attrs: { 'aria-labelledby': `${id}-title`, 'aria-describedby': description ? `${id}-description` : null }
    }, form);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy) return; // no double submissions
      busy = true;
      setButtonLoading(submit, true);
      try {
        const value = await onSubmit(form);
        if (value !== undefined) {
          result = value;
          dialog.close();
          return;
        }
      } catch {
        /* onSubmit shows its own errors inside the dialog */
      }
      busy = false;
      setButtonLoading(submit, false);
    });
    dialog.addEventListener('cancel', (event) => { if (busy) event.preventDefault(); });
    dialog.addEventListener('click', (event) => { if (event.target === dialog && !busy) dialog.close(); });
    dialog.addEventListener('close', () => {
      resolve(result);
      window.setTimeout(() => dialog.remove(), 400);
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    });

    document.body.appendChild(dialog);
    dialog.showModal();
    /** @type {HTMLElement | null} */ (form.querySelector('input, textarea, select'))?.focus();
  });
}
