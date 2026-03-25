import { describe, expect, test } from 'bun:test';

import {
  createImportedAgent,
  createManagedAgent,
  initialManagedAgents,
  managedAgentDivisionFilters,
  managedAgentSourceFilters,
  managedAgentStatusFilters,
} from './data';

describe('createManagedAgent', () => {
  test('creates an agent with the given index in the name', () => {
    const agent = createManagedAgent(5);
    expect(agent.name).toBe('Agent 5');
  });

  test('creates a Main type agent', () => {
    const agent = createManagedAgent(1);
    expect(agent.type).toBe('Main');
  });

  test('defaults to built-in source', () => {
    const agent = createManagedAgent(1);
    expect(agent.source).toBe('built-in');
  });

  test('defaults to created status', () => {
    const agent = createManagedAgent(1);
    expect(agent.status).toBe('created');
  });

  test('has empty mailbox', () => {
    const agent = createManagedAgent(1);
    expect(agent.mailbox.count).toBe(0);
  });

  test('uses Anthropic as provider', () => {
    const agent = createManagedAgent(1);
    expect(agent.provider).toBe('Anthropic');
  });

  test('uses cooperative collaboration style', () => {
    const agent = createManagedAgent(1);
    expect(agent.collaborationStyle).toBe('cooperative');
  });

  test('returns a new object for each call', () => {
    const agent1 = createManagedAgent(1);
    const agent2 = createManagedAgent(1);
    expect(agent1).not.toBe(agent2);
    expect(agent1).toEqual(agent2);
  });
});

describe('createImportedAgent', () => {
  test('creates an agent with imported source', () => {
    const agent = createImportedAgent();
    expect(agent.source).toBe('imported');
  });

  test('creates an agent named Imported Agent', () => {
    const agent = createImportedAgent();
    expect(agent.name).toBe('Imported Agent');
  });

  test('uses OpenAI as provider', () => {
    const agent = createImportedAgent();
    expect(agent.provider).toBe('OpenAI');
  });

  test('has read-only permission', () => {
    const agent = createImportedAgent();
    expect(agent.permission).toBe('Read only');
  });

  test('has created status', () => {
    const agent = createImportedAgent();
    expect(agent.status).toBe('created');
  });

  test('includes terminal in tools', () => {
    const agent = createImportedAgent();
    expect(agent.tools).toContain('terminal');
  });
});

describe('initialManagedAgents', () => {
  test('contains multiple agents', () => {
    expect(initialManagedAgents.length).toBeGreaterThan(5);
  });

  test('first agent has children (sub-agents)', () => {
    const first = initialManagedAgents[0]!;
    expect(first.children).toBeDefined();
    expect(first.children!.length).toBeGreaterThan(0);
  });

  test('all agents have required fields', () => {
    for (const agent of initialManagedAgents) {
      expect(agent.name).toBeTruthy();
      expect(agent.type).toBe('Main');
      expect(agent.source).toBeTruthy();
      expect(agent.provider).toBeTruthy();
      expect(agent.model).toBeTruthy();
      expect(agent.status).toBeTruthy();
      expect(agent.role).toBeTruthy();
      expect(agent.tools.length).toBeGreaterThan(0);
      expect(agent.mailbox).toBeDefined();
    }
  });

  test('sub-agents have required fields', () => {
    const withChildren = initialManagedAgents.filter((a) => a.children && a.children.length > 0);
    for (const parent of withChildren) {
      for (const child of parent.children!) {
        expect(child.name).toBeTruthy();
        expect(child.type).toBe('Sub');
        expect(child.source).toBeTruthy();
        expect(child.model).toBeTruthy();
      }
    }
  });

  test('agents span multiple divisions', () => {
    const divisions = new Set(initialManagedAgents.map((a) => a.division).filter(Boolean));
    expect(divisions.size).toBeGreaterThan(3);
  });

  test('agents span multiple statuses', () => {
    const statuses = new Set(initialManagedAgents.map((a) => a.status));
    expect(statuses.size).toBeGreaterThan(3);
  });
});

describe('filter arrays', () => {
  test('source filters start with all', () => {
    expect(managedAgentSourceFilters[0]!.id).toBe('all');
  });

  test('status filters start with all', () => {
    expect(managedAgentStatusFilters[0]!.id).toBe('all');
  });

  test('division filters start with all', () => {
    expect(managedAgentDivisionFilters[0]!.id).toBe('all');
  });

  test('source filters include built-in', () => {
    expect(managedAgentSourceFilters.some((f) => f.id === 'built-in')).toBe(true);
  });

  test('status filters include active', () => {
    expect(managedAgentStatusFilters.some((f) => f.id === 'active')).toBe(true);
  });

  test('division filters include engineering', () => {
    expect(managedAgentDivisionFilters.some((f) => f.id === 'engineering')).toBe(true);
  });

  test('all filter items have id and label', () => {
    for (const filter of managedAgentSourceFilters) {
      expect(filter.id).toBeTruthy();
      expect(filter.label).toBeTruthy();
    }
    for (const filter of managedAgentStatusFilters) {
      expect(filter.id).toBeTruthy();
      expect(filter.label).toBeTruthy();
    }
    for (const filter of managedAgentDivisionFilters) {
      expect(filter.id).toBeTruthy();
      expect(filter.label).toBeTruthy();
    }
  });
});
