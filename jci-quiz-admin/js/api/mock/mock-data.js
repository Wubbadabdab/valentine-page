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

/**
 * Demo-only searches that make the quiz list fail, so its error state can be
 * tested: search for one of these on the Quizzes page.
 */
export const DEMO_LIST_ERRORS = Object.freeze({
  serverError: 'simulate:server-error',
  networkFailure: 'simulate:offline'
});

// Quizzes (Stage 2) ------------------------------------------------------------
// Twelve demo quizzes covering every status, availability and lock state.
// Dates are relative to the moment the demo data is first created, so
// "closes in 2 days" and "opens next week" stay true when you try it.

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** @param {string} prefix @param {number} n */
const id = (prefix, n) => `${prefix}-0000-4000-8000-${String(n).padStart(12, '0')}`;

/**
 * Question builders (API shape). Option ids are derived from the question id.
 * @typedef {{ type: string, text: string, marks: number, options?: string[], correct?: number[], accepted?: string[], notes?: string }} QuestionSpec
 */
/** @param {string} text @param {number} marks @param {string[]} options @param {number | null} correct @returns {QuestionSpec} */
const mc = (text, marks, options, correct) => ({ type: 'multiple_choice', text, marks, options, correct: correct === null ? [] : [correct] });
/** @param {string} text @param {number} marks @param {string[]} options @param {number[]} correct @returns {QuestionSpec} */
const cb = (text, marks, options, correct) => ({ type: 'checkboxes', text, marks, options, correct });
/** @param {string} text @param {number} marks @param {string[]} accepted @returns {QuestionSpec} */
const sa = (text, marks, accepted) => ({ type: 'short_answer', text, marks, accepted });
/** @param {string} text @param {number} marks @param {string} [notes] @returns {QuestionSpec} */
const pa = (text, marks, notes = '') => ({ type: 'paragraph', text, marks, notes });

/**
 * @typedef {Object} QuizSpec
 * @property {string} title
 * @property {string} description
 * @property {'draft' | 'published' | 'archived'} status
 * @property {number} attempts
 * @property {number} created     days ago
 * @property {number} updated     days ago (fractions allowed)
 * @property {number | null} [opens]   days from now
 * @property {number | null} [closes]  days from now
 * @property {number | null} [duration]
 * @property {number | null} [maxAttempts]
 * @property {QuestionSpec[]} questions
 */

/** @type {QuizSpec[]} */
const QUIZ_SPECS = [
  {
    title: 'JCI Mission & Creed',
    description: 'The JCI Mission, Vision and Creed — what every member should know.',
    status: 'published', attempts: 48, created: 21, updated: 10, opens: -10, closes: 14, duration: 20, maxAttempts: 1,
    questions: [
      mc('What does JCI stand for?', 2, ['Junior Chamber International', 'Joint Council of Innovators', 'Junior Citizens Initiative', 'Journal of Community Impact'], 0),
      mc('Complete the JCI Mission: “To provide development opportunities that empower young people to create …”', 2, ['positive change', 'global wealth', 'new businesses', 'better schools'], 0),
      cb('Which of these lines appear in the JCI Creed?', 3, ['That faith in God gives meaning and purpose to human life', 'That the brotherhood of man transcends the sovereignty of nations', 'That profit is the highest goal of enterprise', 'That service to humanity is the best work of life'], [0, 1, 3]),
      sa('In what year did the JCI movement begin?', 2, ['1915']),
      mc('In which city did the JCI movement begin?', 2, ['St. Louis, USA', 'London, UK', 'Lagos, Nigeria', 'Geneva, Switzerland'], 0),
      pa('In your own words, explain what “active citizenship” means to you as a JCI member.', 5, 'Look for a clear definition and at least one practical example.')
    ]
  },
  {
    title: 'New Member Orientation',
    description: 'Getting started with JCI Uniben: membership, areas of opportunity and chapter basics.',
    status: 'published', attempts: 112, created: 45, updated: 12, opens: -30, closes: 30, duration: 30, maxAttempts: 2,
    questions: [
      mc('What is the age range for active JCI membership?', 2, ['18 to 40', '16 to 30', '21 to 45', 'Any age'], 0),
      mc('What is the JCI Vision?', 2, ['To be the leading global network of young active citizens', 'To be the largest student union in Africa', 'To fund every community project worldwide', 'To train every member as an entrepreneur'], 0),
      cb('Which are the four JCI Areas of Opportunity?', 4, ['Individual', 'Community', 'Business', 'International', 'Political'], [0, 1, 2, 3]),
      sa('What is the short name of the JCI chapter at the University of Benin?', 2, ['JCI Uniben', 'JCI University of Benin']),
      mc('Which document sets out the rules your local chapter follows?', 1, ['The chapter constitution', 'The quiz guidelines', 'The campus timetable', 'The membership card'], 0),
      pa('Why did you join JCI, and what do you hope to gain in your first year?', 5)
    ]
  },
  {
    title: 'Leadership Essentials',
    description: 'Leadership styles, listening, goal setting and feedback.',
    status: 'published', attempts: 27, created: 14, updated: 6, opens: -5, closes: 2, duration: 25, maxAttempts: 1,
    questions: [
      mc('Which leadership style involves the team in making decisions?', 2, ['Democratic', 'Autocratic', 'Laissez-faire', 'Transactional'], 0),
      cb('Which of these are signs of active listening?', 3, ['Summarising what the speaker said', 'Asking clarifying questions', 'Checking your phone while they speak', 'Interrupting to share your view'], [0, 1]),
      mc('What does the “S” in SMART goals stand for?', 1, ['Specific', 'Simple', 'Shared', 'Strategic'], 0),
      sa('Name the feedback model that describes the Situation, the Behaviour and its Impact.', 2, ['SBI', 'Situation-Behaviour-Impact', 'Situation Behaviour Impact']),
      pa('Describe a time you led a group through a disagreement. What did you learn?', 6)
    ]
  },
  {
    title: 'Public Speaking Basics',
    description: 'Confidence, structure and delivery for your first speeches.',
    status: 'published', attempts: 0, created: 9, updated: 1, opens: 7, closes: 21, duration: 15, maxAttempts: 1,
    questions: [
      mc('What is the best way to reduce nerves before a speech?', 2, ['Practise out loud several times', 'Memorise every word and never look up', 'Avoid thinking about it until you speak', 'Speak as fast as possible'], 0),
      cb('Which of these help hold an audience’s attention?', 3, ['Eye contact', 'Varying your pace and tone', 'Reading slides word for word', 'A clear story or example'], [0, 1, 3]),
      mc('Roughly how many main points should a five-minute speech have?', 1, ['Two or three', 'Ten', 'One sentence', 'As many as possible'], 0),
      pa('Write a 30-second opening for a speech about why young people should volunteer.', 5)
    ]
  },
  {
    title: 'UN Sustainable Development Goals',
    description: 'The 17 Global Goals and how local projects can support them.',
    status: 'published', attempts: 86, created: 60, updated: 40, opens: -40, closes: -3, duration: 30, maxAttempts: 1,
    questions: [
      mc('How many Sustainable Development Goals are there?', 2, ['17', '10', '12', '21'], 0),
      mc('By which year are the SDGs meant to be achieved?', 2, ['2030', '2025', '2040', '2050'], 0),
      mc('Which SDG is about quality education?', 2, ['Goal 4', 'Goal 1', 'Goal 7', 'Goal 13'], 0),
      cb('Which of these are Sustainable Development Goals?', 3, ['Zero Hunger', 'Climate Action', 'Clean Water and Sanitation', 'Fastest Internet'], [0, 1, 2]),
      sa('What is the name of SDG 13?', 2, ['Climate Action']),
      pa('Choose one SDG and propose a small project our chapter could run in Benin City to support it.', 6)
    ]
  },
  {
    title: 'Project Management 101',
    description: 'Planning, budgeting and running chapter projects.',
    status: 'draft', attempts: 0, created: 3, updated: 2 / 24, duration: 20, maxAttempts: 1,
    questions: [
      mc('What is the first phase of a typical project life cycle?', 2, ['Initiation', 'Closing', 'Execution', 'Monitoring'], 0),
      cb('Which of these belong in a project plan?', 3, ['Goals', 'Timeline', 'Budget', 'Members’ passwords'], [0, 1, 2]),
      sa('What does the abbreviation “KPI” stand for?', 2, ['Key Performance Indicator', 'Key Performance Indicators']),
      pa('List the main risks of a community clean-up project and how you would reduce each one.', 5)
    ]
  },
  {
    // Deliberately unfinished: publishing it shows the server's "not ready" checks.
    title: 'Effective Meetings',
    description: 'Running short, focused meetings with clear outcomes.',
    status: 'draft', attempts: 0, created: 6, updated: 1, duration: null, maxAttempts: 1,
    questions: [
      mc('What should every meeting have before it starts?', 2, ['A clear agenda', 'A long guest list', 'Refreshments', 'A projector'], null),
      mc('Who usually records the minutes of a meeting?', 1, ['The secretary', 'The newest member', 'The guest speaker', 'Nobody'], 0),
      pa('', 3)
    ]
  },
  {
    // Was published, then unpublished after students took it: still locked.
    title: 'Community Impact Projects',
    description: 'Planning projects that create lasting positive change.',
    status: 'draft', attempts: 15, created: 35, updated: 4, opens: -25, closes: -10, duration: 30, maxAttempts: 1,
    questions: [
      mc('What is the first step in planning a community project?', 2, ['Assess the community’s needs', 'Buy the materials', 'Announce the date', 'Print T-shirts'], 0),
      cb('Which of these help a project last after the chapter steps back?', 3, ['Training local volunteers', 'Partnering with local groups', 'Doing everything ourselves', 'Planning maintenance'], [0, 1, 3]),
      mc('Which JCI framework guides members through planning community projects step by step?', 2, ['The Active Citizen Framework', 'The Ten Year Plan', 'The Global Goals Index', 'The Impact Ladder'], 0),
      sa('What word describes measuring a project’s results against its goals?', 2, ['Evaluation', 'Impact assessment']),
      pa('Describe one community project you would like to lead and how you would measure its impact.', 6)
    ]
  },
  {
    title: 'Teamwork & Collaboration',
    description: 'How strong teams form, build trust and share work.',
    status: 'published', attempts: 9, created: 20, updated: 15, opens: -15, closes: null, duration: null, maxAttempts: null,
    questions: [
      mc('Which stage of team development comes after “Forming”?', 2, ['Storming', 'Norming', 'Performing', 'Adjourning'], 0),
      cb('Which behaviours build trust in a team?', 3, ['Keeping commitments', 'Sharing credit', 'Hiding mistakes', 'Giving honest feedback'], [0, 1, 3]),
      mc('What is the main benefit of giving everyone a clear role?', 2, ['Everyone knows who is responsible for what', 'Meetings become longer', 'Fewer people need to attend', 'It removes the need for a leader'], 0),
      pa('How would you help a quiet team member contribute more?', 4)
    ]
  },
  {
    title: 'Uniben Chapter History',
    description: 'Where the chapter fits in JCI Nigeria and the wider JCI movement.',
    status: 'archived', attempts: 64, created: 150, updated: 80, opens: -120, closes: -90, duration: 20, maxAttempts: 1,
    questions: [
      mc('Which university is home to the JCI Uniben chapter?', 2, ['University of Benin', 'University of Lagos', 'University of Ibadan', 'University of Nigeria'], 0),
      mc('In which city is the University of Benin?', 2, ['Benin City', 'Abuja', 'Port Harcourt', 'Enugu'], 0),
      sa('Which country’s national JCI organisation is the chapter part of?', 2, ['Nigeria', 'JCI Nigeria']),
      cb('Which of these are good ways to preserve a chapter’s history?', 3, ['Keeping meeting minutes', 'Archiving project photos', 'Deleting old records', 'Writing a yearly report'], [0, 1, 3]),
      pa('Which past chapter project would you most like to repeat, and why?', 5)
    ]
  },
  {
    title: '2025 Induction Quiz',
    description: 'End-of-induction check for the 2025 intake.',
    status: 'archived', attempts: 130, created: 330, updated: 300, opens: -320, closes: -310, duration: 30, maxAttempts: 1,
    questions: [
      mc('What is the JCI Creed?', 2, ['A statement of the beliefs JCI members share', 'The chapter’s bank account', 'A training certificate', 'A meeting schedule'], 0),
      mc('Which color is used in the JCI logo?', 1, ['Blue', 'Green', 'Red', 'Orange'], 0),
      cb('Which of these are responsibilities of a JCI member?', 3, ['Attending meetings', 'Taking part in projects', 'Paying dues on time', 'Speaking for JCI in the press without approval'], [0, 1, 2]),
      sa('Complete the JCI Vision: “To be the leading global network of young …”', 2, ['active citizens']),
      pa('What does being inducted into JCI mean to you?', 4)
    ]
  },
  {
    title: 'Untitled quiz',
    description: '',
    status: 'draft', attempts: 0, created: 0.5 / 24, updated: 0.5 / 24, duration: null, maxAttempts: 1,
    questions: []
  }
];

/**
 * @param {QuestionSpec} spec
 * @param {number} number   unique number used to derive the question and option ids
 * @param {number} order
 */
function buildQuestion(spec, number, order) {
  const questionId = id('20000000', number);
  /** @type {Record<string, any>} */
  const question = {
    id: questionId,
    type: spec.type,
    order,
    text: spec.text,
    explanation: null,
    marks: spec.marks,
    image: null,
    appearance: {},
    source: null
  };
  if (spec.options) {
    question.options = spec.options.map((text, index) => ({
      id: id('30000000', number * 10 + index + 1),
      text,
      image: null,
      isCorrect: (spec.correct || []).includes(index)
    }));
  }
  if (spec.type === 'short_answer') {
    question.acceptedAnswers = spec.accepted || [];
    question.caseSensitive = false;
    question.maxLength = 200;
  }
  if (spec.type === 'paragraph') {
    question.maxLength = 2000;
    question.gradingNotes = spec.notes || '';
  }
  return question;
}

/**
 * Build the demo quizzes in the backend's proposed JSON shape.
 * @param {number} [now] epoch ms
 */
export function createDemoQuizzes(now = Date.now()) {
  /**
   * A whole hour in the browser's time zone, so dates read naturally:
   * quizzes open at 09:00 and close at 17:00.
   * @param {number} days
   * @param {number} hour
   */
  const at = (days, hour) => {
    const date = new Date(now + days * DAY);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };
  return QUIZ_SPECS.map((spec, quizIndex) => {
    const quizId = id('10000000', quizIndex + 1);
    const questions = spec.questions.map((questionSpec, index) =>
      buildQuestion(questionSpec, (quizIndex + 1) * 100 + index + 1, index + 1));
    return {
      id: quizId,
      title: spec.title,
      description: spec.description,
      instructions: spec.questions.length ? 'Answer every question. You can change your answers until you submit.' : '',
      status: spec.status,
      settings: {
        durationMinutes: spec.duration ?? null,
        opensAt: spec.opens === undefined || spec.opens === null ? null : at(spec.opens, 9),
        closesAt: spec.closes === undefined || spec.closes === null ? null : at(spec.closes, 17),
        maxAttempts: spec.maxAttempts === undefined ? 1 : spec.maxAttempts,
        attemptScoring: 'highest',
        checkboxScoring: 'all_or_nothing',
        resultVisibility: 'after_close',
        showCorrectAnswers: false
      },
      appearance: {
        fontFamily: 'Inter', fontSize: 18, textColor: '#130F2D', pageBackground: '#EEF6FB',
        cardBackground: '#FFFFFF', bold: false, italic: false, underline: false, align: 'left'
      },
      questions,
      attemptCount: spec.attempts,
      version: 1 + Math.round(spec.created / 7),
      createdAt: new Date(now - spec.created * DAY).toISOString(),
      updatedAt: new Date(now - spec.updated * DAY).toISOString(),
      publishedAt: spec.status === 'published' && spec.opens !== undefined && spec.opens !== null
        ? new Date(now - Math.max(1, -spec.opens) * DAY).toISOString()
        : null
    };
  });
}
