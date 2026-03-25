import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock pino module before importing logger
vi.mock('pino', () => ({
  default: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  })),
}));

describe('logger', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('creates a pino logger instance', async () => {
    const { logger } = await import('../logger');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('logger has child method for creating child loggers', async () => {
    const { logger } = await import('../logger');
    expect(typeof logger.child).toBe('function');
    const child = logger.child({ name: 'test' });
    expect(child).toBeDefined();
  });
});
