import { describe, it, expect } from 'vitest';
import { BUILT_IN_TEMPLATES } from '../templates-data.js';
import type { GoalTemplate } from '../types.js';

describe('BUILT_IN_TEMPLATES', () => {
  it('is a non-empty readonly array', () => {
    expect(Array.isArray(BUILT_IN_TEMPLATES)).toBe(true);
    expect(BUILT_IN_TEMPLATES.length).toBeGreaterThan(0);
  });

  it('has exactly 5 templates', () => {
    expect(BUILT_IN_TEMPLATES).toHaveLength(5);
  });

  it('each template has required fields', () => {
    for (const template of BUILT_IN_TEMPLATES) {
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('goal');
      expect(template).toHaveProperty('estimatedTasks');
    }
  });

  it('each template has correct types', () => {
    for (const template of BUILT_IN_TEMPLATES) {
      expect(typeof template.id).toBe('string');
      expect(typeof template.name).toBe('string');
      expect(typeof template.description).toBe('string');
      expect(typeof template.goal).toBe('string');
      expect(typeof template.estimatedTasks).toBe('number');
    }
  });

  it('has unique template ids', () => {
    const ids = BUILT_IN_TEMPLATES.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('has non-empty string fields', () => {
    for (const template of BUILT_IN_TEMPLATES) {
      expect(template.id.length).toBeGreaterThan(0);
      expect(template.name.length).toBeGreaterThan(0);
      expect(template.description.length).toBeGreaterThan(0);
      expect(template.goal.length).toBeGreaterThan(0);
    }
  });

  it('estimatedTasks are positive numbers', () => {
    for (const template of BUILT_IN_TEMPLATES) {
      expect(template.estimatedTasks).toBeGreaterThan(0);
    }
  });

  it('contains expected template ids', () => {
    const ids = BUILT_IN_TEMPLATES.map((t) => t.id);
    expect(ids).toContain('fullstack-app');
    expect(ids).toContain('cli-tool');
    expect(ids).toContain('api-integration');
    expect(ids).toContain('refactor');
    expect(ids).toContain('documentation');
  });

  it('fullstack-app template has correct structure', () => {
    const template = BUILT_IN_TEMPLATES.find((t) => t.id === 'fullstack-app');
    expect(template).toBeDefined();
    expect(template?.name).toBe('Full-stack web app');
    expect(template?.description).toContain('Next.js');
    expect(template?.estimatedTasks).toBe(8);
  });

  it('cli-tool template has correct structure', () => {
    const template = BUILT_IN_TEMPLATES.find((t) => t.id === 'cli-tool');
    expect(template).toBeDefined();
    expect(template?.name).toBe('CLI tool');
    expect(template?.estimatedTasks).toBe(5);
  });

  it('api-integration template has correct structure', () => {
    const template = BUILT_IN_TEMPLATES.find((t) => t.id === 'api-integration');
    expect(template).toBeDefined();
    expect(template?.name).toBe('API integration');
    expect(template?.estimatedTasks).toBe(4);
  });

  it('refactor template has correct structure', () => {
    const template = BUILT_IN_TEMPLATES.find((t) => t.id === 'refactor');
    expect(template).toBeDefined();
    expect(template?.name).toBe('Code refactor');
    expect(template?.estimatedTasks).toBe(6);
  });

  it('documentation template has correct structure', () => {
    const template = BUILT_IN_TEMPLATES.find((t) => t.id === 'documentation');
    expect(template).toBeDefined();
    expect(template?.name).toBe('Documentation');
    expect(template?.estimatedTasks).toBe(3);
  });
});
