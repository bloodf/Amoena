import { describe, expect, test } from "vitest";

import { initialWorkspaceRecords, workspaceHealthConfig } from './data';
import type { WorkspaceHealth } from './types';

describe('workspaceHealthConfig', () => {
  const healthStates: WorkspaceHealth[] = ['healthy', 'conflicts', 'orphaned', 'stale'];

  test('every health state has label, color, and bgColor', () => {
    for (const state of healthStates) {
      const config = workspaceHealthConfig[state];
      expect(config).toBeDefined();
      expect(config.label).toBeTruthy();
      expect(config.color).toBeTruthy();
      expect(config.bgColor).toBeTruthy();
    }
  });

  test('healthy uses green', () => {
    expect(workspaceHealthConfig.healthy.color).toContain('green');
  });

  test('conflicts uses destructive', () => {
    expect(workspaceHealthConfig.conflicts.color).toContain('destructive');
  });

  test('orphaned uses warning', () => {
    expect(workspaceHealthConfig.orphaned.color).toContain('warning');
  });

  test('stale uses muted', () => {
    expect(workspaceHealthConfig.stale.color).toContain('muted');
  });
});

describe('initialWorkspaceRecords', () => {
  test('has multiple workspaces', () => {
    expect(initialWorkspaceRecords.length).toBeGreaterThan(1);
  });

  test('each workspace has required fields', () => {
    for (const ws of initialWorkspaceRecords) {
      expect(ws.name).toBeTruthy();
      expect(ws.branch).toBeTruthy();
      expect(ws.source).toBeTruthy();
      expect(ws.disk).toBeTruthy();
      expect(ws.created).toBeTruthy();
      expect(typeof ws.pending).toBe('boolean');
      expect(typeof ws.conflicts).toBe('boolean');
      expect(ws.health).toBeTruthy();
      expect(Array.isArray(ws.linkedSessions)).toBe(true);
      expect(Array.isArray(ws.files)).toBe(true);
    }
  });

  test('workspace names are unique', () => {
    const names = initialWorkspaceRecords.map((ws) => ws.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test('includes multiple health states', () => {
    const states = new Set(initialWorkspaceRecords.map((ws) => ws.health));
    expect(states.size).toBeGreaterThan(1);
  });

  test('workspace with conflicts has conflicts flag set', () => {
    const conflicted = initialWorkspaceRecords.filter((ws) => ws.health === 'conflicts');
    for (const ws of conflicted) {
      expect(ws.conflicts).toBe(true);
    }
  });

  test('file entries have name, added, and removed counts', () => {
    const withFiles = initialWorkspaceRecords.filter((ws) => ws.files.length > 0);
    expect(withFiles.length).toBeGreaterThan(0);
    for (const ws of withFiles) {
      for (const file of ws.files) {
        expect(file.name).toBeTruthy();
        expect(typeof file.added).toBe('number');
        expect(typeof file.removed).toBe('number');
      }
    }
  });
});
