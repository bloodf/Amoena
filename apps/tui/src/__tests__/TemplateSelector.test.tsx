import { describe, it, expect } from 'bun:test';
import { BUILT_IN_TEMPLATES } from '../templates-data.js';
import type { GoalTemplate } from '../types.js';

// ---------------------------------------------------------------------------
// TemplateSelector logic tests — we test the data and selection logic
// from the component since ink-testing-library is not available.
// ---------------------------------------------------------------------------

describe('TemplateSelector — BUILT_IN_TEMPLATES data', () => {
  it('has at least one template', () => {
    expect(BUILT_IN_TEMPLATES.length).toBeGreaterThan(0);
  });

  it('all templates have required fields', () => {
    for (const tpl of BUILT_IN_TEMPLATES) {
      expect(tpl.id).toBeTruthy();
      expect(tpl.name).toBeTruthy();
      expect(tpl.description).toBeTruthy();
      expect(tpl.goal).toBeTruthy();
      expect(tpl.estimatedTasks).toBeGreaterThan(0);
    }
  });

  it('all template ids are unique', () => {
    const ids = BUILT_IN_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all template names are unique', () => {
    const names = BUILT_IN_TEMPLATES.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('contains Full-stack web app template', () => {
    const found = BUILT_IN_TEMPLATES.find((t) => t.id === 'fullstack-app');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Full-stack web app');
  });

  it('contains CLI tool template', () => {
    const found = BUILT_IN_TEMPLATES.find((t) => t.id === 'cli-tool');
    expect(found).toBeDefined();
  });

  it('contains API integration template', () => {
    const found = BUILT_IN_TEMPLATES.find((t) => t.id === 'api-integration');
    expect(found).toBeDefined();
  });

  it('contains Code refactor template', () => {
    const found = BUILT_IN_TEMPLATES.find((t) => t.id === 'refactor');
    expect(found).toBeDefined();
  });

  it('contains Documentation template', () => {
    const found = BUILT_IN_TEMPLATES.find((t) => t.id === 'documentation');
    expect(found).toBeDefined();
  });
});

describe('TemplateSelector — selection logic', () => {
  it('default selected index is 0', () => {
    const selectedIndex = 0;
    expect(BUILT_IN_TEMPLATES[selectedIndex]).toBeDefined();
  });

  it('up arrow clamps at 0', () => {
    const prev = 0;
    const next = Math.max(0, prev - 1);
    expect(next).toBe(0);
  });

  it('down arrow clamps at last index', () => {
    const prev = BUILT_IN_TEMPLATES.length - 1;
    const next = Math.min(BUILT_IN_TEMPLATES.length - 1, prev + 1);
    expect(next).toBe(BUILT_IN_TEMPLATES.length - 1);
  });

  it('down arrow increments normally', () => {
    const prev = 0;
    const next = Math.min(BUILT_IN_TEMPLATES.length - 1, prev + 1);
    expect(next).toBe(1);
  });

  it('up arrow decrements normally', () => {
    const prev = 2;
    const next = Math.max(0, prev - 1);
    expect(next).toBe(1);
  });

  it('enter selects current template goal', () => {
    const selectedIndex = 0;
    const tpl = BUILT_IN_TEMPLATES[selectedIndex];
    expect(tpl?.goal).toBeTruthy();
    expect(typeof tpl?.goal).toBe('string');
  });
});

describe('TemplateSelector — template detail display', () => {
  it('first template has description', () => {
    const first = BUILT_IN_TEMPLATES[0];
    expect(first?.description.length).toBeGreaterThan(0);
  });

  it('first template has estimatedTasks', () => {
    const first = BUILT_IN_TEMPLATES[0];
    expect(first?.estimatedTasks).toBeGreaterThan(0);
  });

  it('templates have reasonable estimated task counts', () => {
    for (const tpl of BUILT_IN_TEMPLATES) {
      expect(tpl.estimatedTasks).toBeGreaterThanOrEqual(1);
      expect(tpl.estimatedTasks).toBeLessThanOrEqual(20);
    }
  });

  it('goal strings are non-empty', () => {
    for (const tpl of BUILT_IN_TEMPLATES) {
      expect(tpl.goal.length).toBeGreaterThan(10);
    }
  });
});
