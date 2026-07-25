/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
