// @ts-check
/**
 * Dark Mode / Light Mode for the ADMIN interface.
 * This never touches a quiz's own appearance (students' colors and fonts).
 */
import { getPref, setPref, prefKey } from './storage.js';
import { prefersReducedMotion } from './motion.js';

/** @typedef {'dark' | 'light'} Theme */

/** @type {Readonly<Record<Theme, string>>} */
export const THEME_LABELS = Object.freeze({ dark: 'Dark Mode', light: 'Light Mode' });

/** @type {Set<(theme: Theme) => void>} */
const listeners = new Set();

/**
 * Pure helper (mirrors js/theme-init.js): a saved choice wins; otherwise follow the device.
 * @param {string | null} saved
 * @param {boolean} devicePrefersLight
 * @returns {Theme}
 */
export function resolveInitialTheme(saved, devicePrefersLight) {
  if (saved === 'dark' || saved === 'light') return saved;
  return devicePrefersLight ? 'light' : 'dark';
}

/** @returns {Theme} */
export function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

/** @param {(theme: Theme) => void} listener */
export function onThemeChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** @param {Theme} theme */
function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  listeners.forEach((listener) => listener(theme));
}

/**
 * Switch theme, save the choice, and animate the change.
 * With View Transitions: a circular reveal spreading from `origin`.
 * Without: a quick color crossfade. With reduced motion: instant.
 * @param {Theme} theme
 * @param {{ origin?: Element | null }} [options]
 */
export function setTheme(theme, { origin = null } = {}) {
  setPref('theme', theme);
  if (theme === getTheme()) return;
  const root = document.documentElement;

  if (prefersReducedMotion()) {
    apply(theme);
    return;
  }

  const doc = /** @type {Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>, finished: Promise<void> } }} */ (document);
  if (typeof doc.startViewTransition === 'function') {
    const rect = origin ? origin.getBoundingClientRect() : null;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.style.setProperty('--reveal-x', `${x}px`);
    root.style.setProperty('--reveal-y', `${y}px`);
    root.style.setProperty('--reveal-r', `${radius}px`);
    root.classList.add('is-theme-transition');
    const transition = doc.startViewTransition(() => apply(theme));
    // The browser may skip the animation (e.g. another transition is running);
    // the theme still changes, so these rejections are expected and ignored.
    transition.ready.catch(() => {});
    transition.finished.catch(() => {}).finally(() => root.classList.remove('is-theme-transition'));
    return;
  }

  root.classList.add('is-theme-fade');
  apply(theme);
  window.setTimeout(() => root.classList.remove('is-theme-fade'), 260);
}

// Keep other open tabs in sync when the choice changes.
window.addEventListener('storage', (event) => {
  if (event.key === prefKey('theme') && (event.newValue === 'dark' || event.newValue === 'light')) {
    apply(event.newValue);
  }
});

/** Current saved choice (null on a first visit). */
export function savedTheme() {
  const saved = getPref('theme');
  return saved === 'dark' || saved === 'light' ? saved : null;
}
