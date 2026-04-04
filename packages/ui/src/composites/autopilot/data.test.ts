import { describe, expect, test } from "vitest";

import {
  initialAutopilotActivityLog,
  initialAutopilotRunHistory,
  initialAutopilotStorySteps,
  initialAutopilotSubAgents,
} from './data';

describe('initialAutopilotActivityLog', () => {
  test('has multiple activity items', () => {
    expect(initialAutopilotActivityLog.length).toBeGreaterThan(0);
  });

  test('each item has time, action, target, and status', () => {
    for (const item of initialAutopilotActivityLog) {
      expect(item.time).toBeTruthy();
      expect(item.action).toBeTruthy();
      expect(item.target).toBeTruthy();
      expect(['completed', 'pending_approval']).toContain(item.status);
    }
  });

  test('includes at least one pending_approval item', () => {
    const pending = initialAutopilotActivityLog.filter((i) => i.status === 'pending_approval');
    expect(pending.length).toBeGreaterThan(0);
  });
});

describe('initialAutopilotStorySteps', () => {
  test('has multiple steps', () => {
    expect(initialAutopilotStorySteps.length).toBeGreaterThan(0);
  });

  test('each step has label, status, and tokens', () => {
    for (const step of initialAutopilotStorySteps) {
      expect(step.label).toBeTruthy();
      expect(['done', 'in_progress', 'pending', 'blocked']).toContain(step.status);
      expect(step.tokens).toBeTruthy();
    }
  });

  test('includes multiple statuses', () => {
    const statuses = new Set(initialAutopilotStorySteps.map((s) => s.status));
    expect(statuses.size).toBeGreaterThan(2);
  });
});

describe('initialAutopilotSubAgents', () => {
  test('has multiple sub-agents', () => {
    expect(initialAutopilotSubAgents.length).toBeGreaterThan(0);
  });

  test('each sub-agent has required fields', () => {
    for (const agent of initialAutopilotSubAgents) {
      expect(agent.id).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.role).toBeTruthy();
      expect(agent.emoji).toBeTruthy();
      expect(agent.tokensUsed).toBeTruthy();
      expect(typeof agent.stepsCompleted).toBe('number');
      expect(typeof agent.stepsTotal).toBe('number');
    }
  });

  test('sub-agent ids are unique', () => {
    const ids = initialAutopilotSubAgents.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('stepsCompleted never exceeds stepsTotal', () => {
    for (const agent of initialAutopilotSubAgents) {
      expect(agent.stepsCompleted).toBeLessThanOrEqual(agent.stepsTotal);
    }
  });
});

describe('initialAutopilotRunHistory', () => {
  test('has multiple runs', () => {
    expect(initialAutopilotRunHistory.length).toBeGreaterThan(0);
  });

  test('each run has required fields', () => {
    for (const run of initialAutopilotRunHistory) {
      expect(run.id).toBeTruthy();
      expect(run.goal).toBeTruthy();
      expect(run.state).toBeTruthy();
      expect(typeof run.steps).toBe('number');
      expect(typeof run.completed).toBe('number');
      expect(run.tokens).toBeTruthy();
      expect(run.duration).toBeTruthy();
      expect(run.startedAt).toBeTruthy();
    }
  });

  test('run ids are unique', () => {
    const ids = initialAutopilotRunHistory.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('completed runs have a summary', () => {
    const completeRuns = initialAutopilotRunHistory.filter((r) => r.state === 'complete');
    for (const run of completeRuns) {
      expect(run.summary).toBeDefined();
    }
  });

  test('completed never exceeds total steps', () => {
    for (const run of initialAutopilotRunHistory) {
      expect(run.completed).toBeLessThanOrEqual(run.steps);
    }
  });
});
