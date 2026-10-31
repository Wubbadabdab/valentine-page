// @ts-check
import { test, assert, assertEqual } from './harness.js';
import { rules, validateValue, validateFields } from '../core/validate.js';
import { el } from '../core/dom.js';
import { safeReturnTo, loginUrl } from '../core/session.js';
import { resolveInitialTheme } from '../core/theme.js';

/* Validation ----------------------------------------------------------------- */
test('validate: required rejects blank and whitespace', () => {
  const rule = rules.required('Enter your email address');
  assertEqual(rule(''), 'Enter your email address');
  assertEqual(rule('   '), 'Enter your email address');
  assertEqual(rule('a'), null);
});

test('validate: email accepts valid addresses and rejects invalid ones', () => {
  const rule = rules.email();
  assertEqual(rule('admin@jciuniben.org'), null);
  assertEqual(rule(' admin@jci.org '), null, 'surrounding spaces are ignored');
  assert(rule('admin@') !== null, 'missing domain');
  assert(rule('admin.jci.org') !== null, 'missing @');
  assert(rule('a b@jci.org') !== null, 'space inside');
  assertEqual(rule(''), null, 'blank is left to the required rule');
});

test('validate: maxLength reports the current length', () => {
  const rule = rules.maxLength(5, 'Title');
  assertEqual(rule('12345'), null);
  assertEqual(rule('123456'), 'Title must be 5 characters or fewer (currently 6)');
});

test('validate: first failing rule wins; validateFields returns only invalid fields', () => {
  const list = [rules.required('Enter your email address'), rules.email()];
  assertEqual(validateValue('', list), 'Enter your email address');
  assertEqual(validateValue('nope', list), 'Enter a valid email address, like name@example.com');
  assertEqual(validateFields({ email: 'x@y.co', password: '' }, {
    email: list,
    password: [rules.required('Enter your password')]
  }), { password: 'Enter your password' });
});

/* Safe DOM --------------------------------------------------------------------- */
test('dom: text is never parsed as HTML', () => {
  const node = el('p', { text: '<img src=x onerror=alert(1)>' }, '<b>bold?</b>');
  assertEqual(node.children.length, 0, 'no elements were created from text');
  assert(node.textContent === '<img src=x onerror=alert(1)><b>bold?</b>', 'text kept literally');
});

test('dom: attrs skip false/null and set true as empty', () => {
  const node = el('button', { attrs: { 'aria-pressed': 'true', hidden: false, 'data-x': null, disabled: true } });
  assertEqual(node.getAttribute('aria-pressed'), 'true');
  assert(!node.hasAttribute('hidden') && !node.hasAttribute('data-x'), 'false/null skipped');
  assertEqual(node.getAttribute('disabled'), '');
});

/* Return URL after login (open-redirect protection) ------------------------------ */
test('session: safeReturnTo allows our own pages with query and hash', () => {
  assertEqual(safeReturnTo('quizzes.html'), 'quizzes.html');
  assertEqual(safeReturnTo('quiz-edit.html?id=abc#questions'), 'quiz-edit.html?id=abc#questions');
  assertEqual(safeReturnTo('settings.html'), 'settings.html');
});

test('session: safeReturnTo blocks other sites and odd paths', () => {
  for (const value of ['https://evil.example/quizzes.html', '//evil.example', 'javascript:alert(1)', '../quizzes.html',
    '/quizzes.html', 'login.html', 'index.html', 'unknown.html', '', null, 'quizzes.html\nx']) {
    assertEqual(safeReturnTo(value), null, String(value));
  }
});

test('session: loginUrl encodes a safe return link and drops unsafe ones', () => {
  assertEqual(loginUrl('quiz-edit.html?id=1#details'), 'login.html?returnTo=quiz-edit.html%3Fid%3D1%23details');
  assertEqual(loginUrl('https://evil.example'), 'login.html');
});

/* Theme ------------------------------------------------------------------------------ */
test('theme: a saved choice wins; otherwise follow the device', () => {
  assertEqual(resolveInitialTheme('light', false), 'light');
  assertEqual(resolveInitialTheme('dark', true), 'dark');
  assertEqual(resolveInitialTheme(null, true), 'light');
  assertEqual(resolveInitialTheme(null, false), 'dark');
  assertEqual(resolveInitialTheme('AMOLED', true), 'light', 'unknown values are ignored');
});

test('theme: every page has the same inline theme script as js/theme-init.js', async () => {
  const master = (await (await fetch('js/theme-init.js')).text()).split('\n').find((line) => line.startsWith('(function'));
  assert(master, 'master line found');
  const pages = ['index.html', 'login.html', 'dashboard.html', 'quizzes.html', 'quiz-edit.html', 'quiz-preview.html',
    'question-bank.html', 'results.html', 'settings.html', 'no-access.html', '404.html', 'tests.html'];
  for (const page of pages) {
    const html = await (await fetch(page)).text();
    assert(html.includes(`<script>${master}</script>`), `${page} has a different or missing theme script`);
  }
});

test('theme: the user interface never says "AMOLED"', async () => {
  const files = ['login.html', 'settings.html', 'js/core/theme.js', 'js/components/theme-switch.js'];
  for (const file of files) {
    const text = await (await fetch(file)).text();
    assert(!/amoled/i.test(text), `${file} mentions AMOLED`);
  }
});
