// @ts-check
/**
 * Administrator login (login.html).
 * The backend checks the credentials and creates the session; this page only
 * collects them, explains errors clearly, and sends the admin on.
 */
import { CONFIG } from '../config.js';
import { api, isDemoMode } from '../api/index.js';
import { ApiError, userMessage } from '../api/client.js';
import { loginFieldErrorsFromApi } from '../api/adapters.js';
import { DEMO_ERROR_PASSWORDS } from '../api/mock/mock-data.js';
import { safeReturnTo } from '../core/session.js';
import { skipNextPageTransition } from '../core/motion.js';
import { rules, validateValue } from '../core/validate.js';
import { el, qs } from '../core/dom.js';
import { icon } from '../icons.js';
import { renderBanners } from '../components/shell.js';
import { createThemeSwitch } from '../components/theme-switch.js';
import { setButtonLoading } from '../components/button.js';
import {
  setFieldError, clearFieldError, setFieldValid, showErrorSummary, showFormAlert, hideFormMessage
} from '../components/form-feedback.js';

const destination = safeReturnTo(new URLSearchParams(window.location.search).get('returnTo')) || 'dashboard.html';
const usesUsername = CONFIG.AUTH.identifier === 'username';
const identifierLabel = usesUsername ? 'Username' : 'Email';

const form = /** @type {HTMLFormElement} */ (qs('[data-login-form]'));
const identifier = /** @type {HTMLInputElement} */ (qs('#identifier'));
const password = /** @type {HTMLInputElement} */ (qs('#password'));
const submit = /** @type {HTMLButtonElement} */ (qs('button[type="submit"]', form));
const toggle = /** @type {HTMLButtonElement} */ (qs('[data-password-toggle]'));
const capsWarning = /** @type {HTMLElement} */ (qs('[data-caps-warning]'));
const summary = /** @type {HTMLElement} */ (qs('[data-error-summary]'));
const formAlert = /** @type {HTMLElement} */ (qs('[data-form-alert]'));

renderBanners(qs('[data-banners]'));
qs('[data-theme-switch]')?.append(createThemeSwitch());

// PENDING #1: switch the first field to "Username" if the backend uses usernames.
if (usesUsername) {
  const label = qs('label[for="identifier"]');
  if (label) label.textContent = identifierLabel;
  identifier.type = 'text';
  identifier.removeAttribute('inputmode');
}

if (isDemoMode) {
  const hint = qs('[data-demo-hint]');
  if (hint) {
    hint.append(el('div', { class: 'alert alert--info' },
      icon('info'),
      el('p', {},
        el('strong', { text: 'Demo sign-in: ' }),
        'any email and any password of 8 or more characters. To preview error messages, use the password ',
        Object.values(DEMO_ERROR_PASSWORDS).flatMap((value, index, list) => [
          el('code', { text: value }),
          index < list.length - 2 ? ', ' : index === list.length - 2 ? ' or ' : '.'
        ])
      )
    ));
    hint.hidden = false;
  }
}

// Already signed in? Skip the login page.
api.getMe()
  .then(() => {
    skipNextPageTransition();
    window.location.replace(destination);
  })
  .catch(() => { /* not signed in: stay here */ });

/** @type {Record<'identifier' | 'password', (value: string) => string | null>} */
const validators = {
  identifier: (value) => validateValue(value, usesUsername
    ? [rules.required('Enter your username')]
    : [rules.required('Enter your email address'), rules.email()]),
  password: (value) => validateValue(value, [rules.required('Enter your password')])
};

/**
 * @param {HTMLInputElement} input
 * @param {{ shake?: boolean }} [options]
 */
function check(input, { shake = false } = {}) {
  const name = /** @type {'identifier' | 'password'} */ (input.name);
  const message = validators[name](input.value);
  if (message) setFieldError(input, message, { shake });
  else {
    clearFieldError(input);
    if (input === identifier) setFieldValid(input, input.value.trim() !== '');
  }
  return message;
}

for (const input of [identifier, password]) {
  input.addEventListener('blur', () => { if (input.value !== '') check(input); });
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') check(input);
    else if (input === identifier) setFieldValid(identifier, false);
  });
}

// Show / hide password
toggle.addEventListener('click', () => {
  const show = password.type === 'password';
  password.type = show ? 'text' : 'password';
  toggle.setAttribute('aria-pressed', String(show));
  toggle.replaceChildren(icon(show ? 'eyeOff' : 'eye'));
});

// Caps Lock warning
/** @param {KeyboardEvent} event */
const updateCaps = (event) => {
  if (typeof event.getModifierState === 'function') capsWarning.hidden = !event.getModifierState('CapsLock');
};
password.addEventListener('keydown', updateCaps);
password.addEventListener('keyup', updateCaps);
password.addEventListener('blur', () => { capsWarning.hidden = true; });

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submit.disabled) return; // no double submissions
  hideFormMessage(formAlert);
  hideFormMessage(summary);

  const problems = [identifier, password]
    .map((input) => ({ input, message: check(input, { shake: true }) }))
    .filter((item) => item.message);
  if (problems.length) {
    showErrorSummary(summary, problems.map((item) => ({ fieldId: item.input.id, message: /** @type {string} */ (item.message) })));
    return;
  }

  setButtonLoading(submit, true);
  try {
    await api.login({ identifier: identifier.value, password: password.value });
    window.location.replace(destination); // keep the button busy while the next page loads
  } catch (error) {
    setButtonLoading(submit, false);
    if (error instanceof ApiError && error.status === 401) {
      // Never say which of the two was wrong.
      showFormAlert(formAlert, `${identifierLabel} or password is incorrect.`);
      password.focus();
      password.select();
      return;
    }
    if (error instanceof ApiError && (error.status === 400 || error.status === 422)) {
      const fieldErrors = loginFieldErrorsFromApi(error.fieldErrors);
      const items = Object.entries(fieldErrors).map(([name, message]) => {
        const input = name === 'password' ? password : identifier;
        setFieldError(input, message);
        return { fieldId: input.id, message };
      });
      if (items.length) {
        showErrorSummary(summary, items);
        return;
      }
    }
    showFormAlert(formAlert, userMessage(error));
  }
});
