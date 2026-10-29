// @ts-check
/**
 * TEMPORARY — used by pages whose real screens arrive in later build stages
 * (dashboard, quizzes, question bank, results). It runs the normal shell and
 * session check and shows an honest "coming in Stage N" note.
 * Each page switches to its own script (js/pages/<page>.js) when it's built,
 * and this file is deleted after Stage 10.
 */
import { bootPage } from '../components/shell.js';

const page = /** @type {import('../components/shell.js').PageId} */ (document.body.dataset.page);
bootPage({ page, title: document.body.dataset.title || '' });
