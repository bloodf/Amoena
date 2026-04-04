import { describe, expect, test } from "vitest";

import { homeProviders, homeQuickTips, homeRecentSessions, homeWorkspaces } from './data';

describe('homeRecentSessions', () => {
  test('has multiple sessions', () => {
    expect(homeRecentSessions.length).toBeGreaterThan(0);
  });

  test('each session has required fields', () => {
    for (const session of homeRecentSessions) {
      expect(session.title).toBeTruthy();
      expect(session.model).toBeTruthy();
      expect(session.tuiColor).toBeTruthy();
      expect(session.time).toBeTruthy();
      expect(session.tokens).toBeTruthy();
      expect(session.branch).toBeTruthy();
    }
  });

  test('includes multiple models', () => {
    const models = new Set(homeRecentSessions.map((s) => s.model));
    expect(models.size).toBeGreaterThan(1);
  });
});

describe('homeWorkspaces', () => {
  test('has multiple workspaces', () => {
    expect(homeWorkspaces.length).toBeGreaterThan(0);
  });

  test('each workspace has name, branch, and disk', () => {
    for (const ws of homeWorkspaces) {
      expect(ws.name).toBeTruthy();
      expect(ws.branch).toBeTruthy();
      expect(ws.disk).toBeTruthy();
      expect(typeof ws.pending).toBe('boolean');
    }
  });
});

describe('homeProviders', () => {
  test('has multiple providers', () => {
    expect(homeProviders.length).toBeGreaterThan(0);
  });

  test('each provider has name, status, and color', () => {
    for (const p of homeProviders) {
      expect(p.name).toBeTruthy();
      expect(['connected', 'disconnected', 'error']).toContain(p.status);
      expect(p.color).toBeTruthy();
    }
  });

  test('includes multiple statuses', () => {
    const statuses = new Set(homeProviders.map((p) => p.status));
    expect(statuses.size).toBeGreaterThan(1);
  });
});

describe('homeQuickTips', () => {
  test('has multiple tips', () => {
    expect(homeQuickTips.length).toBeGreaterThan(0);
  });

  test('each tip has tip and shortcut fields', () => {
    for (const t of homeQuickTips) {
      expect(t.tip).toBeTruthy();
      expect(t.shortcut).toBeTruthy();
    }
  });
});
