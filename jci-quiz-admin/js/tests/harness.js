// @ts-check
/**
 * A tiny test harness for tests.html — no frameworks.
 * test('name', fn) registers a check; fn may be async and should throw on failure.
 */

/** @type {{ name: string, fn: () => unknown }[]} */
const registered = [];

/**
 * @param {string} name
 * @param {() => unknown} fn
 */
export function test(name, fn) {
  registered.push({ name, fn });
}

/**
 * @param {unknown} condition
 * @param {string} message
 */
export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Deep equality via JSON (fine for the plain data these tests compare).
 * @param {unknown} actual
 * @param {unknown} expected
 * @param {string} [message]
 */
export function assertEqual(actual, expected, message = '') {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${message ? `${message}: ` : ''}expected ${b}, got ${a}`);
}

/**
 * @param {() => Promise<unknown>} fn
 * @param {(error: any) => boolean} check
 * @param {string} message
 */
export async function assertRejects(fn, check, message) {
  try {
    await fn();
  } catch (error) {
    if (check(error)) return;
    throw new Error(`${message}: rejected with an unexpected error (${String(error && error.message)})`);
  }
  throw new Error(`${message}: expected a rejection`);
}

/**
 * Run every registered test and print PASS / FAIL.
 * @param {HTMLElement} list
 * @param {HTMLElement} summary
 */
export async function runAll(list, summary) {
  let passed = 0;
  /** @type {string[]} */
  const failures = [];
  for (const { name, fn } of registered) {
    const item = document.createElement('li');
    try {
      await fn();
      passed += 1;
      item.className = 'test test--pass';
      item.textContent = `PASS — ${name}`;
    } catch (error) {
      failures.push(name);
      item.className = 'test test--fail';
      item.textContent = `FAIL — ${name}: ${error instanceof Error ? error.message : String(error)}`;
    }
    list.appendChild(item);
  }
  summary.textContent = `${passed} passed, ${failures.length} failed (${registered.length} checks)`;
  summary.dataset.failed = String(failures.length);
  document.title = `${failures.length ? 'FAIL' : 'PASS'} · Automated checks · JCI Uniben Quiz Admin`;
}
