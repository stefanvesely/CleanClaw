import { describe, expect, it } from 'vitest';
import { createConsoleLogger, createMemoryLogger, createSilentLogger } from './logger.js';

describe('CleanClaw logger', () => {
  it('captures structured records in memory', () => {
    const logger = createMemoryLogger();

    logger.info('hello', { taskId: '01' });
    logger.error('failed');

    expect(logger.records).toEqual([
      { level: 'info', message: 'hello', optionalParams: [{ taskId: '01' }] },
      { level: 'error', message: 'failed', optionalParams: [] },
    ]);
  });

  it('silent logger accepts all levels without emitting records', () => {
    const logger = createSilentLogger();

    expect(() => {
      logger.info('info');
      logger.warn('warn');
      logger.error('error');
      logger.debug('debug');
    }).not.toThrow();
  });

  it('console logger routes levels to the provided console-like object', () => {
    const calls: string[] = [];
    const logger = createConsoleLogger({
      log: (message?: unknown) => calls.push(`log:${String(message)}`),
      warn: (message?: unknown) => calls.push(`warn:${String(message)}`),
      error: (message?: unknown) => calls.push(`error:${String(message)}`),
      debug: (message?: unknown) => calls.push(`debug:${String(message)}`),
    });

    logger.info('info');
    logger.warn('warn');
    logger.error('error');
    logger.debug('debug');

    expect(calls).toEqual(['log:info', 'warn:warn', 'error:error', 'debug:debug']);
  });
});
