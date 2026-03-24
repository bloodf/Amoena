import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { StandaloneEngine, detectAvailableAdapters } from '../engine/standalone-engine.js';
import type { MCServerEvent } from '../types.js';

describe('detectAvailableAdapters', () => {
  it('returns false for all adapters when no env vars set', () => {
    const orig = {
      ANTHROPIC_API_KEY: process.env['ANTHROPIC_API_KEY'],
      OPENAI_API_KEY: process.env['OPENAI_API_KEY'],
      GOOGLE_API_KEY: process.env['GOOGLE_API_KEY'],
      CLAUDE_API_KEY: process.env['CLAUDE_API_KEY'],
      GEMINI_API_KEY: process.env['GEMINI_API_KEY'],
    };
    delete process.env['ANTHROPIC_API_KEY'];
    delete process.env['OPENAI_API_KEY'];
    delete process.env['GOOGLE_API_KEY'];
    delete process.env['CLAUDE_API_KEY'];
    delete process.env['GEMINI_API_KEY'];

    const result = detectAvailableAdapters();
    expect(result.claude).toBe(false);
    expect(result.codex).toBe(false);
    expect(result.gemini).toBe(false);

    // Restore
    Object.assign(process.env, orig);
  });

  it('detects claude when ANTHROPIC_API_KEY is set', () => {
    const orig = process.env['ANTHROPIC_API_KEY'];
    process.env['ANTHROPIC_API_KEY'] = 'test-key';
    const result = detectAvailableAdapters();
    expect(result.claude).toBe(true);
    if (orig === undefined) delete process.env['ANTHROPIC_API_KEY'];
    else process.env['ANTHROPIC_API_KEY'] = orig;
  });

  it('detects codex when OPENAI_API_KEY is set', () => {
    const orig = process.env['OPENAI_API_KEY'];
    process.env['OPENAI_API_KEY'] = 'test-key';
    const result = detectAvailableAdapters();
    expect(result.codex).toBe(true);
    if (orig === undefined) delete process.env['OPENAI_API_KEY'];
    else process.env['OPENAI_API_KEY'] = orig;
  });

  it('detects gemini when GOOGLE_API_KEY is set', () => {
    const orig = process.env['GOOGLE_API_KEY'];
    process.env['GOOGLE_API_KEY'] = 'test-key';
    const result = detectAvailableAdapters();
    expect(result.gemini).toBe(true);
    if (orig === undefined) delete process.env['GOOGLE_API_KEY'];
    else process.env['GOOGLE_API_KEY'] = orig;
  });
});

describe('StandaloneEngine', () => {
  let engine: StandaloneEngine;

  beforeEach(() => {
    // Clear API keys so engine uses simulation path (fast)
    delete process.env['ANTHROPIC_API_KEY'];
    delete process.env['OPENAI_API_KEY'];
    delete process.env['GOOGLE_API_KEY'];
    delete process.env['CLAUDE_API_KEY'];
    delete process.env['GEMINI_API_KEY'];
    engine = new StandaloneEngine();
  });

  it('emits run.started event', async () => {
    const events: MCServerEvent[] = [];
    engine.on('event', (e) => events.push(e));
    await engine.run('test goal');
    const started = events.find((e) => e.type === 'run.started');
    expect(started).toBeDefined();
    expect((started as Extract<MCServerEvent, { type: 'run.started' }>).goal).toBe('test goal');
  });

  it('emits task.queued events', async () => {
    const events: MCServerEvent[] = [];
    engine.on('event', (e) => events.push(e));
    await engine.run('test goal');
    const queued = events.filter((e) => e.type === 'task.queued');
    expect(queued.length).toBeGreaterThan(0);
  });

  it('emits task.started and task.completed for each task', async () => {
    const events: MCServerEvent[] = [];
    engine.on('event', (e) => events.push(e));
    await engine.run('test goal');
    const started = events.filter((e) => e.type === 'task.started');
    const completed = events.filter((e) => e.type === 'task.completed');
    expect(started.length).toBeGreaterThan(0);
    expect(completed.length).toBe(started.length);
  });

  it('emits run.completed as final event', async () => {
    const events: MCServerEvent[] = [];
    engine.on('event', (e) => events.push(e));
    await engine.run('test goal');
    const last = events[events.length - 1];
    expect(last?.type).toBe('run.completed');
  });

  it('does not run concurrently', async () => {
    const events: MCServerEvent[] = [];
    engine.on('event', (e) => events.push(e));
    // First run + immediate second run (should be ignored)
    const p1 = engine.run('goal 1');
    void engine.run('goal 2'); // should be no-op
    await p1;
    const started = events.filter((e) => e.type === 'run.started');
    expect(started.length).toBe(1);
  });
});
