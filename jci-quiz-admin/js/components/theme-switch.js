// @ts-check
/**
 * The Dark Mode / Light Mode switch used in the sidebar, the mobile drawer
 * and the login page. Every copy stays in sync.
 */
import { el } from '../core/dom.js';
import { icon } from '../icons.js';
import { getTheme, setTheme, onThemeChange, THEME_LABELS } from '../core/theme.js';

/** @typedef {import('../core/theme.js').Theme} Theme */

/**
 * @param {{ tooltips?: boolean }} [options] tooltips: for the collapsed tablet sidebar
 * @returns {HTMLElement}
 */
export function createThemeSwitch({ tooltips = false } = {}) {
  /** @type {Theme[]} */
  const themes = ['dark', 'light'];
  const buttons = themes.map((theme) =>
    el('button', {
      type: 'button',
      class: 'theme-switch__option',
      data: { theme },
      attrs: { 'aria-pressed': String(getTheme() === theme), 'data-tooltip': tooltips ? THEME_LABELS[theme] : null },
      on: { click: (event) => setTheme(theme, { origin: /** @type {Element} */ (event.currentTarget) }) }
    },
    icon(theme === 'dark' ? 'moon' : 'sun', { size: 16 }),
    el('span', { class: 'collapsible-label', text: THEME_LABELS[theme] }))
  );

  onThemeChange((theme) => {
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.theme === theme)));
  });

  return el('div', { class: 'theme-switch', attrs: { role: 'group', 'aria-label': 'Display mode' } }, buttons);
}
