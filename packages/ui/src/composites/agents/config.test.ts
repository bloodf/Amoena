import { describe, expect, test } from "vitest";

import {
  divisionColors,
  divisionLabels,
  managedStatusConfig,
  managedStatusTone,
  sourceColors,
} from './config';
import type { AgentDivision, AgentSource, AgentStatus } from './types';

describe('managedStatusTone', () => {
  test('returns success for active statuses', () => {
    const successStatuses: AgentStatus[] = [
      'active',
      'running',
      'completed',
      'complete',
      'executing',
    ];
    for (const status of successStatuses) {
      expect(managedStatusTone(status)).toBe('success');
    }
  });

  test('returns warning for paused/stopped/thinking', () => {
    const warningStatuses: AgentStatus[] = ['paused', 'stopped', 'thinking'];
    for (const status of warningStatuses) {
      expect(managedStatusTone(status)).toBe('warning');
    }
  });

  test('returns danger for failure statuses', () => {
    const dangerStatuses: AgentStatus[] = ['failed', 'cancelled', 'blocked', 'error'];
    for (const status of dangerStatuses) {
      expect(managedStatusTone(status)).toBe('danger');
    }
  });

  test('returns info for created/preparing/delegating/synthesizing', () => {
    const infoStatuses: AgentStatus[] = ['created', 'preparing', 'delegating', 'synthesizing'];
    for (const status of infoStatuses) {
      expect(managedStatusTone(status)).toBe('info');
    }
  });

  test('returns purple for awaiting_review', () => {
    expect(managedStatusTone('awaiting_review')).toBe('purple');
  });

  test('returns muted for idle', () => {
    expect(managedStatusTone('idle')).toBe('muted');
  });

  test('returns muted for unknown status', () => {
    expect(managedStatusTone('bogus' as AgentStatus)).toBe('muted');
  });
});

describe('managedStatusConfig', () => {
  test('every status has a color and label', () => {
    const statuses: AgentStatus[] = [
      'created',
      'preparing',
      'active',
      'idle',
      'running',
      'paused',
      'stopped',
      'completed',
      'failed',
      'cancelled',
      'thinking',
      'executing',
      'blocked',
      'awaiting_review',
      'complete',
      'error',
      'delegating',
      'synthesizing',
    ];
    for (const status of statuses) {
      const config = managedStatusConfig[status];
      expect(config).toBeDefined();
      expect(config.color).toBeTruthy();
      expect(config.label).toBeTruthy();
    }
  });
});

describe('sourceColors', () => {
  test('every source has a defined color class', () => {
    const sources: AgentSource[] = ['built-in', 'imported', 'marketplace', 'custom'];
    for (const source of sources) {
      expect(sourceColors[source]).toBeTruthy();
    }
  });
});

describe('divisionColors', () => {
  test('every division has a color hex value', () => {
    const divisions: AgentDivision[] = [
      'engineering',
      'design',
      'qa',
      'product',
      'security',
      'devops',
      'ai',
      'general',
    ];
    for (const div of divisions) {
      expect(divisionColors[div]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('divisionLabels', () => {
  test('every division has a human-readable label', () => {
    const divisions: AgentDivision[] = [
      'engineering',
      'design',
      'qa',
      'product',
      'security',
      'devops',
      'ai',
      'general',
    ];
    for (const div of divisions) {
      expect(divisionLabels[div]).toBeTruthy();
      expect(typeof divisionLabels[div]).toBe('string');
    }
  });
});
