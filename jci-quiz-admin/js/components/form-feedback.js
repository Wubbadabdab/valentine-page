// @ts-check
/**
 * Field errors and error summaries, wired up for screen readers:
 * - the message is linked with aria-describedby and the input gets aria-invalid
 * - a failed submit shows a summary with links that jump to each field
 * Expects the field markup: .field > input + .field__message > div
 */
import { el, clear } from '../core/dom.js';
import { icon } from '../icons.js';
import { focusElement } from '../core/a11y.js';

/** @param {HTMLElement} input */
function describedByIds(input) {
  return (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
}

/**
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input
 * @param {string} message
 * @param {{ shake?: boolean }} [options]
 */
export function setFieldError(input, message, { shake = true } = {}) {
  const field = input.closest('.field');
  const slot = field?.querySelector('.field__message > div');
  if (!field || !slot) return;
  const id = `${input.id}-error`;
  slot.replaceChildren(el('p', { class: 'field-error', id }, icon('alertCircle', { size: 16 }), el('span', { text: message })));
  input.setAttribute('aria-invalid', 'true');
  const ids = describedByIds(input);
  if (!ids.includes(id)) input.setAttribute('aria-describedby', [...ids, id].join(' '));
  field.classList.add('is-invalid');
  field.classList.remove('is-valid');
  if (shake) {
    input.classList.remove('is-shaking');
    void input.offsetWidth; // restart the animation
    input.classList.add('is-shaking');
    input.addEventListener('animationend', () => input.classList.remove('is-shaking'), { once: true });
  }
}

/** @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input */
export function clearFieldError(input) {
  const field = input.closest('.field');
  if (!field) return;
  const id = `${input.id}-error`;
  input.removeAttribute('aria-invalid');
  const ids = describedByIds(input).filter((value) => value !== id);
  if (ids.length) input.setAttribute('aria-describedby', ids.join(' '));
  else input.removeAttribute('aria-describedby');
  field.classList.remove('is-invalid');
}

/**
 * Show the small check that confirms a field is valid.
 * @param {HTMLElement} input
 * @param {boolean} valid
 */
export function setFieldValid(input, valid) {
  input.closest('.field')?.classList.toggle('is-valid', valid);
}

/**
 * @param {HTMLElement} container
 * @param {{ fieldId: string, message: string }[]} items
 * @param {{ title?: string }} [options]
 */
export function showErrorSummary(container, items, { title = 'Please fix the following' } = {}) {
  const summary = el('div', { class: 'alert alert--danger', attrs: { tabindex: '-1' } },
    icon('alertCircle'),
    el('div', {},
      el('p', { class: 'alert__title', text: title }),
      el('ul', {}, items.map((item) =>
        el('li', {}, el('a', {
          href: `#${item.fieldId}`,
          text: item.message,
          on: {
            click: (event) => {
              event.preventDefault();
              focusElement(document.getElementById(item.fieldId));
            }
          }
        }))
      ))
    )
  );
  container.replaceChildren(summary);
  container.hidden = false;
  focusElement(summary);
}

/**
 * A single message for the whole form (e.g. "Email or password is incorrect").
 * @param {HTMLElement} container
 * @param {string} message
 */
export function showFormAlert(container, message) {
  container.replaceChildren(
    el('div', { class: 'alert alert--danger', attrs: { role: 'alert' } }, icon('alertCircle'), el('p', { text: message }))
  );
  container.hidden = false;
}

/** @param {HTMLElement} container */
export function hideFormMessage(container) {
  clear(container);
  container.hidden = true;
}
