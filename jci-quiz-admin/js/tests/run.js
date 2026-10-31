// @ts-check
/**
 * Entry point for tests.html. Each *.test.js file registers its checks.
 * Add new test files here as later stages arrive.
 */
import { runAll } from './harness.js';
import './core.test.js';
import './api.test.js';
import './list.test.js';

const list = /** @type {HTMLElement} */ (document.querySelector('[data-test-results]'));
const summary = /** @type {HTMLElement} */ (document.querySelector('[data-test-summary]'));
runAll(list, summary);
