// @ts-check
/**
 * Settings (settings.html): Dark Mode / Light Mode, rows per page, account.
 * Theme and rows per page are preferences saved on this device only.
 */
import { CONFIG } from '../config.js';
import { qs, qsa, el } from '../core/dom.js';
import { getPref, setPref } from '../core/storage.js';
import { getTheme, setTheme, onThemeChange } from '../core/theme.js';
import { bootPage, handleSignOut } from '../components/shell.js';
import { toast } from '../components/toast.js';

bootPage({
  page: 'settings',
  title: 'Settings',
  onReady(admin) {
    const name = qs('[data-account-name]');
    const email = qs('[data-account-email]');
    if (name) name.textContent = admin.name;
    if (email) email.textContent = admin.email;
  }
});

// Appearance ------------------------------------------------------------------
const themeInputs = /** @type {HTMLInputElement[]} */ (qsa('input[name="theme"]'));
const syncThemeInputs = () => themeInputs.forEach((input) => { input.checked = input.value === getTheme(); });
syncThemeInputs();
onThemeChange(syncThemeInputs);
themeInputs.forEach((input) => {
  input.addEventListener('change', () => {
    if (!input.checked) return;
    setTheme(input.value === 'light' ? 'light' : 'dark', { origin: input.closest('.choice-card') });
  });
});

// Rows per page -----------------------------------------------------------------
const rows = /** @type {HTMLSelectElement} */ (qs('#rows-per-page'));
const saved = Number(getPref('rows'));
const current = CONFIG.PAGE_SIZES.includes(saved) ? saved : CONFIG.PAGE_SIZE_DEFAULT;
rows.replaceChildren(...CONFIG.PAGE_SIZES.map((size) =>
  el('option', { value: String(size), text: `${size} rows`, selected: size === current })
));
rows.addEventListener('change', () => {
  const ok = setPref('rows', rows.value);
  toast(ok
    ? { type: 'success', message: `Saved. Lists will show ${rows.value} rows per page on this device.` }
    : { type: 'error', message: "Couldn't save this preference. Your browser may be blocking storage." });
});

// Account ----------------------------------------------------------------------
const signOutButton = /** @type {HTMLButtonElement} */ (qs('[data-sign-out]'));
signOutButton.addEventListener('click', () => handleSignOut(signOutButton));
