// @ts-check
/**
 * Site configuration — the only shared settings object in the admin site.
 * Items marked PENDING are waiting on a decision with the backend developer
 * (see README "Pending decisions"); the values here are the agreed defaults.
 */
/**
 * @typedef {Object} Config
 * @property {string} APP_NAME
 * @property {string} API_BASE_URL
 * @property {boolean} USE_MOCK
 * @property {boolean} DEBUG
 * @property {number} REQUEST_TIMEOUT_MS
 * @property {number} PAGE_SIZE_DEFAULT
 * @property {readonly number[]} PAGE_SIZES
 * @property {{ maxBytes: number, acceptedTypes: readonly string[] }} UPLOAD
 * @property {{ mode: 'cookie' | 'token', identifier: 'email' | 'username', csrfCookieName: string | null, csrfHeaderName: string }} AUTH
 * @property {{ minDelayMs: number, maxDelayMs: number }} MOCK
 */

/** @type {Readonly<Config>} */
export const CONFIG = Object.freeze({
  APP_NAME: 'JCI Uniben Quiz Admin',

  /** Base URL of the backend API. PENDING #1: '/api' assumes the API is served on the same domain. */
  API_BASE_URL: '/api',

  /**
   * true  = demo mode: the mock API in js/api/mock is used and data stays in this browser.
   * false = the real backend at API_BASE_URL is used.
   */
  USE_MOCK: true,

  /** Print raw technical errors to the console. Keep false in production. */
  DEBUG: false,

  /** How long to wait for the server before giving up on a request. */
  REQUEST_TIMEOUT_MS: 15000,

  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZES: Object.freeze([10, 20, 50]),

  /** Image uploads. Defaults: JPG, PNG or WebP up to 5 MB (confirm the backend's limit). */
  UPLOAD: Object.freeze({
    maxBytes: 5 * 1024 * 1024,
    acceptedTypes: Object.freeze(['image/jpeg', 'image/png', 'image/webp'])
  }),

  AUTH: Object.freeze({
    /** PENDING #1: 'cookie' = the backend sets a session cookie (default). Token sessions are not wired up yet. */
    mode: 'cookie',
    /** PENDING #1: whether admins sign in with an 'email' (default) or a 'username'. */
    identifier: 'email',
    /** With cookie sessions and CSRF protection: the cookie the backend sets and the header it expects. null = not used. */
    csrfCookieName: null,
    csrfHeaderName: 'X-CSRF-Token'
  }),

  /** Demo mode only: simulated network delay range, so loading states can be seen. */
  MOCK: Object.freeze({ minDelayMs: 250, maxDelayMs: 700 })
});
