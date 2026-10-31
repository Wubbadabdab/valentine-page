// @ts-check
/**
 * Shared data shapes for the admin site (JSDoc only — no runtime code).
 * They follow the PROPOSED contract in README section "API contract".
 * If the backend's final field names differ, only js/api/adapters.js changes;
 * these shapes describe the admin site's own model.
 *
 * Other files refer to these with an import type, for example
 * import('../types.js').Quiz inside a JSDoc type.
 */

/** @typedef {'draft' | 'published' | 'archived'} QuizStatus */
/** @typedef {'scheduled' | 'open' | 'closed'} Availability */
/** @typedef {'multiple_choice' | 'checkboxes' | 'short_answer' | 'paragraph'} QuestionType */
/** @typedef {'in_progress' | 'submitted' | 'pending_grading' | 'graded'} AttemptStatus */

/**
 * @typedef {Object} Admin
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role   Default single role: 'admin' (PENDING #8)
 */

/**
 * @typedef {Object} Appearance
 * @property {string} fontFamily      One of: Inter, Poppins, Nunito, Lora, Merriweather, Roboto Slab
 * @property {number} fontSize        14 | 16 | 18 | 20 | 24 | 28
 * @property {string} textColor       Hex, e.g. "#130F2D"
 * @property {string} pageBackground
 * @property {string} cardBackground
 * @property {boolean} bold
 * @property {boolean} italic
 * @property {boolean} underline
 * @property {'left' | 'center'} align
 */

/**
 * Per-question overrides: only the properties that differ from the quiz.
 * An empty object means "inherit everything".
 * @typedef {Partial<Appearance> & { imagePlacement?: ImagePlacement, imageSize?: ImageSize }} AppearanceOverrides
 */

/** @typedef {'above' | 'below' | 'beside'} ImagePlacement */
/** @typedef {'small' | 'medium' | 'full'} ImageSize */

/**
 * @typedef {Object} QuizImage
 * @property {string} assetId       From the backend's upload endpoint — never a local file path
 * @property {string} url
 * @property {string} alt
 * @property {boolean} decorative
 * @property {ImagePlacement} [placement]
 * @property {ImageSize} [size]
 */

/**
 * @typedef {Object} Option
 * @property {string} id
 * @property {string} text
 * @property {QuizImage | null} image
 * @property {boolean} isCorrect     ADMIN-ONLY: must never reach students
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {QuestionType} type
 * @property {number} order
 * @property {string} text
 * @property {string | null} explanation
 * @property {number} marks
 * @property {QuizImage | null} image
 * @property {Option[]} [options]              Choice types only
 * @property {string[]} [acceptedAnswers]      Short answer only — ADMIN-ONLY
 * @property {boolean} [caseSensitive]         Short answer only — ADMIN-ONLY
 * @property {number | null} [maxLength]       Text types
 * @property {string} [gradingNotes]           Paragraph only — ADMIN-ONLY
 * @property {AppearanceOverrides} appearance
 * @property {{ bankQuestionId: string, bankVersion: number } | null} source
 */

/**
 * @typedef {Object} QuizSettings
 * @property {number | null} durationMinutes     null = untimed
 * @property {string | null} opensAt             ISO 8601 UTC, null = opens when published
 * @property {string | null} closesAt            ISO 8601 UTC, null = stays open
 * @property {number | null} maxAttempts         null = unlimited
 * @property {'highest' | 'latest'} attemptScoring
 * @property {'all_or_nothing' | 'partial'} checkboxScoring
 * @property {'immediately' | 'after_close' | 'manual'} resultVisibility
 * @property {boolean} showCorrectAnswers
 */

/**
 * A quiz as shown in lists: everything except questions and appearance.
 * @typedef {Object} QuizSummary
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {QuizStatus} status
 * @property {Availability | null} availability   From the backend (server time); null unless published
 * @property {QuizSettings} settings
 * @property {number} questionCount
 * @property {number} totalMarks                  From the backend
 * @property {number} attemptCount
 * @property {number} version                     For conflict detection (409)
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string | null} publishedAt
 */

/**
 * A full quiz (GET /admin/quizzes/{id}).
 * @typedef {QuizSummary & {
 *   instructions: string,
 *   appearance: Appearance,
 *   questions: Question[]
 * }} Quiz
 */

/**
 * @typedef {Omit<Question, 'order' | 'source'> & {
 *   tags: string[],
 *   status: 'active' | 'archived',
 *   version: number,
 *   usedInQuizCount: number,
 *   createdAt: string,
 *   updatedAt: string
 * }} BankQuestion
 */

/**
 * @typedef {Object} Answer
 * @property {string} questionId
 * @property {string[]} selectedOptionIds
 * @property {string | null} text            Student text: always shown as plain text, never HTML
 * @property {number | null} autoMarks
 * @property {number | null} manualMarks
 * @property {string | null} feedback
 * @property {boolean} needsManualGrading
 */

/**
 * @typedef {Object} Attempt
 * @property {string} id
 * @property {string} quizId
 * @property {{ id: string, name: string, matricNumber: string, email: string }} student   Fields PENDING #11
 * @property {number} attemptNumber
 * @property {AttemptStatus} status
 * @property {string} startedAt
 * @property {string | null} submittedAt
 * @property {number | null} score          From the backend — never calculated in the browser
 * @property {number} maxScore
 * @property {boolean} isFinal
 * @property {Answer[]} answers
 */

/**
 * @typedef {Object} ApiErrorShape
 * @property {number} status          HTTP status, or 0 for network failures/timeouts
 * @property {string} code            e.g. "VALIDATION_ERROR", "NETWORK_ERROR"
 * @property {string} message
 * @property {Record<string, string>} fieldErrors
 * @property {'http' | 'network' | 'timeout'} kind
 */

/**
 * A page of results from a list endpoint.
 * @template T
 * @typedef {Object} Page
 * @property {T[]} items
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 */

export {};
