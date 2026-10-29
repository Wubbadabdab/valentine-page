// @ts-check
/**
 * The ONE place where backend field names are mapped to the admin site's
 * model (js/types.js) and back. If the backend's final contract renames a
 * field, change it here — not across the site.
 * Stage 1 covers auth; quiz, question, bank and attempt mappers are added in
 * the stages that first use them.
 */
import { CONFIG } from '../config.js';

/** @typedef {import('../types.js').Admin} Admin */

/**
 * Admin account from /auth/me or /auth/login.
 * Accepts { admin: {...} }, { user: {...} } or the object itself, and either
 * camelCase or snake_case names (PENDING #1: the exact response shape).
 * @param {any} raw
 * @returns {Admin}
 */
export function adminFromApi(raw) {
  const source = raw && typeof raw === 'object' ? (raw.admin || raw.user || raw) : {};
  const email = String(source.email ?? '');
  const joined = [source.firstName ?? source.first_name, source.lastName ?? source.last_name].filter(Boolean).join(' ');
  const name = String(source.name ?? source.fullName ?? source.full_name ?? (joined || '')).trim();
  return {
    id: String(source.id ?? ''),
    name: name || email.split('@')[0] || 'Administrator',
    email,
    role: String(source.role ?? 'admin')
  };
}

/**
 * Login request body. PENDING #1: email (default) or username.
 * @param {{ identifier: string, password: string }} credentials
 */
export function loginRequestToApi({ identifier, password }) {
  const key = CONFIG.AUTH.identifier === 'username' ? 'username' : 'email';
  return { [key]: identifier.trim(), password };
}

/**
 * Map server field-error names to the login form's field names.
 * @param {Record<string, string>} fieldErrors
 * @returns {Record<string, string>}
 */
export function loginFieldErrorsFromApi(fieldErrors) {
  /** @type {Record<string, string>} */
  const mapped = {};
  for (const [key, message] of Object.entries(fieldErrors || {})) {
    if (key === 'email' || key === 'username') mapped.identifier = message;
    else if (key === 'password') mapped.password = message;
  }
  return mapped;
}

/**
 * Initials for the account avatar, e.g. "Demo Admin" -> "DA".
 * @param {string} name
 */
export function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
