// @ts-check
/**
 * CLEARLY FAKE DEMO DATA — used only when CONFIG.USE_MOCK is true.
 * Nothing here is a real person, account or quiz. Data is returned in the
 * backend's proposed JSON shape so it goes through adapters.js like real data.
 * Quiz, bank and attempt demo data is added in the stages that use it.
 */

/** The demo administrator returned by the mock /auth/me (API shape). */
export const DEMO_ADMIN = Object.freeze({
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Demo Admin',
  email: 'admin@demo.jciuniben.test',
  role: 'admin'
});

/**
 * Demo-only passwords that trigger each login error, so every error state can
 * be tested without a backend. Any other password of 8+ characters signs in.
 */
export const DEMO_ERROR_PASSWORDS = Object.freeze({
  wrongCredentials: 'wrong-password',
  tooManyAttempts: 'too-many',
  serverError: 'server-error',
  networkFailure: 'offline'
});
