// @ts-check
/**
 * Button loading state: the label fades to a spinner without the button
 * changing size, and the button can't be pressed twice.
 */
import { el } from '../core/dom.js';

/**
 * @param {HTMLButtonElement} button   Must contain a .btn__label element
 * @param {boolean} loading
 */
export function setButtonLoading(button, loading) {
  if (!button.querySelector('.btn__spinner')) {
    button.append(el('span', { class: 'btn__spinner', attrs: { 'aria-hidden': 'true' } }, el('span', { class: 'spinner' })));
  }
  button.classList.toggle('is-loading', loading);
  button.disabled = loading;
  if (loading) button.setAttribute('aria-busy', 'true');
  else button.removeAttribute('aria-busy');
}
