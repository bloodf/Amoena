import { describe, expect, test } from "vitest";

import { autopilotStateConfig } from './config';
import type { AutopilotState } from './types';

describe('autopilotStateConfig', () => {
  const states: AutopilotState[] = [
    'idle',
    'planning',
    'executing',
    'waiting_approval',
    'blocked',
    'complete',
    'failed',
    'paused',
  ];

  test('every state has a label, color, and bgColor', () => {
    for (const state of states) {
      const config = autopilotStateConfig[state];
      expect(config).toBeDefined();
      expect(config.label).toBeTruthy();
      expect(config.color).toBeTruthy();
      expect(config.bgColor).toBeTruthy();
    }
  });

  test('idle has muted styling', () => {
    expect(autopilotStateConfig.idle.color).toContain('muted');
  });

  test('executing has green styling', () => {
    expect(autopilotStateConfig.executing.color).toContain('green');
  });

  test('failed has destructive styling', () => {
    expect(autopilotStateConfig.failed.color).toContain('destructive');
  });

  test('blocked has destructive styling', () => {
    expect(autopilotStateConfig.blocked.color).toContain('destructive');
  });

  test('waiting_approval has warning styling', () => {
    expect(autopilotStateConfig.waiting_approval.color).toContain('warning');
  });

  test('planning has primary styling', () => {
    expect(autopilotStateConfig.planning.color).toContain('primary');
  });

  test('complete has green styling', () => {
    expect(autopilotStateConfig.complete.color).toContain('green');
  });

  test('paused has warning styling', () => {
    expect(autopilotStateConfig.paused.color).toContain('warning');
  });
});
