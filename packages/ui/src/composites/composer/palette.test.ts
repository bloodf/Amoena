import { describe, expect, test } from 'vitest';

import {
  buildComposerPaletteGroups,
  buildComposerPaletteItems,
  getNextComposerAgentId,
} from './palette';
import type { PaletteItem } from './types';
import { ArrowRight } from 'lucide-react';

const mockAgents = [
  { id: 'agent-1', name: 'Claude', role: 'Primary Engineer' },
  { id: 'agent-2', name: 'Reviewer', role: 'Code Reviewer' },
  { id: 'agent-3', name: 'Tester', role: 'QA Engineer' },
];

describe('buildComposerPaletteItems', () => {
  test('returns items when filter is empty', () => {
    const items = buildComposerPaletteItems({
      filter: '',
      agents: mockAgents,
      activeAgentId: 'agent-1',
    });
    expect(items.length).toBeGreaterThan(0);
  });

  test('includes agents in results', () => {
    const items = buildComposerPaletteItems({
      filter: '',
      agents: mockAgents,
      activeAgentId: 'agent-1',
    });
    const agentItems = items.filter((i) => i.category === 'agents');
    expect(agentItems.length).toBe(3);
  });

  test('marks active agent with meta', () => {
    const items = buildComposerPaletteItems({
      filter: '',
      agents: mockAgents,
      activeAgentId: 'agent-1',
    });
    const activeAgent = items.find((i) => i.id === 'agent-agent-1');
    expect(activeAgent?.meta).toBe('active');
  });

  test('non-active agents have no meta', () => {
    const items = buildComposerPaletteItems({
      filter: '',
      agents: mockAgents,
      activeAgentId: 'agent-1',
    });
    const otherAgent = items.find((i) => i.id === 'agent-agent-2');
    expect(otherAgent?.meta).toBeUndefined();
  });

  test('filters agents by name', () => {
    const items = buildComposerPaletteItems({
      filter: 'claude',
      agents: mockAgents,
      activeAgentId: 'agent-1',
    });
    const agentItems = items.filter((i) => i.category === 'agents');
    expect(agentItems.length).toBe(1);
    expect(agentItems[0]!.name).toBe('Claude');
  });

  test('filters agents by role', () => {
    const items = buildComposerPaletteItems({
      filter: 'reviewer',
      agents: mockAgents,
      activeAgentId: 'agent-1',
    });
    const agentItems = items.filter((i) => i.category === 'agents');
    expect(agentItems.length).toBe(1);
  });

  test('includes commands in results', () => {
    const items = buildComposerPaletteItems({
      filter: '',
      agents: [],
      activeAgentId: '',
    });
    const commandItems = items.filter((i) => i.category === 'commands');
    expect(commandItems.length).toBeGreaterThan(0);
  });

  test('command items start with /', () => {
    const items = buildComposerPaletteItems({
      filter: '',
      agents: [],
      activeAgentId: '',
    });
    const commandItems = items.filter((i) => i.category === 'commands');
    for (const item of commandItems) {
      expect(item.name.startsWith('/')).toBe(true);
    }
  });

  test('filters commands by name', () => {
    const items = buildComposerPaletteItems({
      filter: 'edit',
      agents: [],
      activeAgentId: '',
    });
    const commandItems = items.filter((i) => i.category === 'commands');
    expect(commandItems.length).toBeGreaterThanOrEqual(1);
    expect(commandItems.some((i) => i.name === '/edit')).toBe(true);
  });

  test('includes skills in results', () => {
    const items = buildComposerPaletteItems({
      filter: '',
      agents: [],
      activeAgentId: '',
    });
    const skillItems = items.filter((i) => i.category === 'skills');
    expect(skillItems.length).toBeGreaterThan(0);
  });

  test('includes files in results', () => {
    const items = buildComposerPaletteItems({
      filter: '',
      agents: [],
      activeAgentId: '',
    });
    const fileItems = items.filter((i) => i.category === 'files');
    expect(fileItems.length).toBeGreaterThan(0);
  });

  test('returns empty results for non-matching filter', () => {
    const items = buildComposerPaletteItems({
      filter: 'zzzzzzzznonexistent',
      agents: [],
      activeAgentId: '',
    });
    expect(items.length).toBe(0);
  });
});

describe('buildComposerPaletteGroups', () => {
  test('groups items by category', () => {
    const items: PaletteItem[] = [
      {
        category: 'commands',
        id: 'cmd-edit',
        name: '/edit',
        desc: 'Edit',
        Icon: ArrowRight,
      },
      {
        category: 'agents',
        id: 'agent-1',
        name: 'Claude',
        desc: 'Agent',
        Icon: ArrowRight,
      },
    ];
    const groups = buildComposerPaletteGroups(items);
    expect(groups.length).toBe(2);
  });

  test('omits empty categories', () => {
    const items: PaletteItem[] = [
      {
        category: 'commands',
        id: 'cmd-edit',
        name: '/edit',
        desc: 'Edit',
        Icon: ArrowRight,
      },
    ];
    const groups = buildComposerPaletteGroups(items);
    expect(groups.length).toBe(1);
    expect(groups[0]!.category).toBe('commands');
  });

  test('returns empty array for no items', () => {
    const groups = buildComposerPaletteGroups([]);
    expect(groups).toEqual([]);
  });

  test('group labels are human-readable', () => {
    const items: PaletteItem[] = [
      {
        category: 'commands',
        id: 'cmd-1',
        name: '/test',
        desc: 'd',
        Icon: ArrowRight,
      },
      {
        category: 'skills',
        id: 'skill-1',
        name: '/sk',
        desc: 'd',
        Icon: ArrowRight,
      },
      {
        category: 'agents',
        id: 'agent-1',
        name: 'A',
        desc: 'd',
        Icon: ArrowRight,
      },
      {
        category: 'files',
        id: 'file-1',
        name: 'f',
        desc: 'd',
        Icon: ArrowRight,
      },
    ];
    const groups = buildComposerPaletteGroups(items);
    const labels = groups.map((g) => g.label);
    expect(labels).toContain('Commands');
    expect(labels).toContain('Skills');
    expect(labels).toContain('Agents');
    expect(labels).toContain('Files');
  });

  test('preserves category order: commands, skills, agents, files', () => {
    const items: PaletteItem[] = [
      {
        category: 'files',
        id: 'file-1',
        name: 'f',
        desc: 'd',
        Icon: ArrowRight,
      },
      {
        category: 'commands',
        id: 'cmd-1',
        name: '/c',
        desc: 'd',
        Icon: ArrowRight,
      },
      {
        category: 'agents',
        id: 'agent-1',
        name: 'a',
        desc: 'd',
        Icon: ArrowRight,
      },
      {
        category: 'skills',
        id: 'skill-1',
        name: '/s',
        desc: 'd',
        Icon: ArrowRight,
      },
    ];
    const groups = buildComposerPaletteGroups(items);
    const categories = groups.map((g) => g.category);
    expect(categories).toEqual(['commands', 'skills', 'agents', 'files']);
  });
});

describe('getNextComposerAgentId', () => {
  const agents = [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }];

  test('returns next agent id', () => {
    expect(getNextComposerAgentId('a1', agents)).toBe('a2');
  });

  test('wraps around to first agent', () => {
    expect(getNextComposerAgentId('a3', agents)).toBe('a1');
  });

  test('returns same id when agent not found', () => {
    expect(getNextComposerAgentId('unknown', agents)).toBe('a1');
  });

  test('returns current id for single agent', () => {
    expect(getNextComposerAgentId('only', [{ id: 'only' }])).toBe('only');
  });

  test('returns current id for empty agents', () => {
    expect(getNextComposerAgentId('a1', [])).toBe('a1');
  });
});
