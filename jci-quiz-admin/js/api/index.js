// @ts-check
/**
 * Pages import the API from here. CONFIG.USE_MOCK decides whether calls go to
 * the real backend (endpoints.js) or to the demo mock (mock/mock-api.js).
 */
import { CONFIG } from '../config.js';
import * as realApi from './endpoints.js';
import * as mockApi from './mock/mock-api.js';

export const api = CONFIG.USE_MOCK ? mockApi : realApi;
export const isDemoMode = CONFIG.USE_MOCK;
