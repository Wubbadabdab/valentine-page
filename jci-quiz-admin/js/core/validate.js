// @ts-check
/**
 * Reusable validation rules with consistent, friendly messages.
 * Browser validation is for usability only — the backend validates again.
 * Each rule is a function (value) => message | null.
 */

/** @typedef {(value: string) => string | null} Rule */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @param {unknown} value */
export function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

export const rules = {
  /**
   * @param {string} message e.g. "Enter your email address"
   * @returns {Rule}
   */
  required: (message) => (value) => (isBlank(value) ? message : null),

  /** @returns {Rule} */
  email: () => (value) =>
    isBlank(value) || EMAIL_PATTERN.test(value.trim()) ? null : 'Enter a valid email address, like name@example.com',

  /**
   * @param {number} max
   * @param {string} label e.g. "Title"
   * @returns {Rule}
   */
  maxLength: (max, label) => (value) =>
    value && value.length > max ? `${label} must be ${max} characters or fewer (currently ${value.length})` : null,

  /**
   * @param {number} min
   * @param {string} label
   * @returns {Rule}
   */
  minLength: (min, label) => (value) =>
    !isBlank(value) && value.trim().length < min ? `${label} must be at least ${min} characters` : null
};

/**
 * Run rules in order and return the first message, or null if the value is valid.
 * @param {string} value
 * @param {Rule[]} ruleList
 * @returns {string | null}
 */
export function validateValue(value, ruleList) {
  for (const rule of ruleList) {
    const message = rule(value);
    if (message) return message;
  }
  return null;
}

/**
 * Validate several fields at once.
 * @param {Record<string, string>} values
 * @param {Record<string, Rule[]>} schema
 * @returns {Record<string, string>} messages for invalid fields only
 */
export function validateFields(values, schema) {
  /** @type {Record<string, string>} */
  const errors = {};
  for (const [name, ruleList] of Object.entries(schema)) {
    const message = validateValue(values[name] ?? '', ruleList);
    if (message) errors[name] = message;
  }
  return errors;
}
