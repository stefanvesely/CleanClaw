export type CleanClawLogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface CleanClawLogger {
  info(message?: unknown, ...optionalParams: unknown[]): void;
  warn(message?: unknown, ...optionalParams: unknown[]): void;
  error(message?: unknown, ...optionalParams: unknown[]): void;
  debug(message?: unknown, ...optionalParams: unknown[]): void;
}

export interface CleanClawLogRecord {
  level: CleanClawLogLevel;
  message?: unknown;
  optionalParams: unknown[];
}

export interface ConsoleLike {
  log(message?: unknown, ...optionalParams: unknown[]): void;
  warn(message?: unknown, ...optionalParams: unknown[]): void;
  error(message?: unknown, ...optionalParams: unknown[]): void;
  debug?(message?: unknown, ...optionalParams: unknown[]): void;
}

export function createConsoleLogger(consoleLike: ConsoleLike = console): CleanClawLogger {
  return {
    info: (message?: unknown, ...optionalParams: unknown[]) => consoleLike.log(message, ...optionalParams),
    warn: (message?: unknown, ...optionalParams: unknown[]) => consoleLike.warn(message, ...optionalParams),
    error: (message?: unknown, ...optionalParams: unknown[]) => consoleLike.error(message, ...optionalParams),
    debug: (message?: unknown, ...optionalParams: unknown[]) => {
      if (typeof consoleLike.debug === 'function') {
        consoleLike.debug(message, ...optionalParams);
      } else {
        consoleLike.log(message, ...optionalParams);
      }
    },
  };
}

export function createSilentLogger(): CleanClawLogger {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  };
}

export function createMemoryLogger(records: CleanClawLogRecord[] = []): CleanClawLogger & { records: CleanClawLogRecord[] } {
  const push = (level: CleanClawLogLevel) => (message?: unknown, ...optionalParams: unknown[]) => {
    records.push({ level, message, optionalParams });
  };

  return {
    records,
    info: push('info'),
    warn: push('warn'),
    error: push('error'),
    debug: push('debug'),
  };
}
