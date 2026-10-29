// @ts-check
/**
 * Safe localStorage access for PREFERENCES ONLY (theme, rows per page,
 * sidebar state). Quiz content, answers and student data must never be stored
 * here — that data belongs to the backend.
 * Access can fail (private browsing, storage disabled), so every call is wrapped.
 */

/** @typedef {'theme' | 'rows' | 'sidebar'} PrefName */

const PREFIX = 'jci-admin-';

/**
 * @param {PrefName} name
 * @returns {string | null}
 */
export function getPref(name) {
  try {
    return window.localStorage.getItem(PREFIX + name);
  } catch {
    return null;
  }
}

/**
 * @param {PrefName} name
 * @param {string} value
 * @returns {boolean} whether the value was saved
 */
export function setPref(name, value) {
  try {
    window.localStorage.setItem(PREFIX + name, value);
    return true;
  } catch {
    return false;
  }
}

/** @param {PrefName} name */
export function prefKey(name) {
  return PREFIX + name;
}
