import { describe, expect, it } from 'vitest';

import {
  countTreeItems,
  findFileNodeByPath,
  inferTypes,
  interestingTranscriptEvent,
  toFileNode,
  toManagedAgents,
  toMemoryEntries,
  toTimelineMessages,
  toWorkspaceSession,
} from './transforms';
import type {
  AgentRecord,
  MessageRecord,
  RuntimeFileNode,
  SessionMemoryResponse,
  TranscriptEvent,
} from './types';
import type { SessionSummary } from '../runtime-context';

const mockSession: SessionSummary = {
  id: 'session-1',
  sessionMode: 'native',
  tuiType: 'native',
  workingDir: '/tmp/project',
  status: 'created',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  metadata: {},
};

const mockFileTree: RuntimeFileNode[] = [
  {
    name: 'src',
    path: '/tmp/src',
    nodeType: 'folder',
    children: [
      {
        name: 'main.ts',
        path: '/tmp/src/main.ts',
        nodeType: 'file',
        children: [],
      },
      {
        name: 'utils.ts',
        path: '/tmp/src/utils.ts',
        nodeType: 'file',
        children: [],
      },
    ],
  },
  {
    name: 'README.md',
    path: '/tmp/README.md',
    nodeType: 'file',
    children: [],
  },
];

const mockAgents: AgentRecord[] = [
  {
    id: 'agent-main',
    parentAgentId: null,
    agentType: 'Primary Engineer',
    model: 'claude-sonnet-4',
    status: 'thinking',
    division: 'engineering',
    collaborationStyle: 'directive',
    communicationPreference: 'structured',
    decisionWeight: 0.9,
  },
  {
    id: 'agent-sub-1',
    parentAgentId: 'agent-main',
    agentType: 'Builder',
    model: 'gpt-5-mini',
    status: 'executing',
    division: 'engineering',
    collaborationStyle: 'cooperative',
    communicationPreference: 'concise',
    decisionWeight: 0.6,
  },
];

const mockMessages: MessageRecord[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Hello',
    attachments: [],
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Hi there',
    attachments: [],
    createdAt: '2026-01-01T00:00:01Z',
  },
];

const mockMemory: SessionMemoryResponse = {
  summary: null,
  tokenBudget: { total: 100000, l0: 50, l1: 150, l2: 500 },
  entries: [
    {
      id: 'obs-1',
      title: 'User preference',
      observationType: 'user_prompt',
      category: 'preference',
      createdAt: '2026-01-01T00:00:00Z',
      l0Summary: 'Dark mode preference',
      l1Summary: 'User prefers dark mode',
      l2Content: '{"title":"Dark mode"}',
      l0Tokens: 5,
      l1Tokens: 10,
      l2Tokens: 20,
    },
  ],
};

describe('toWorkspaceSession', () => {
  it('maps session id', () => {
    const result = toWorkspaceSession(mockSession);
    expect(result.id).toBe('session-1');
  });

  it('uses last path segment as title', () => {
    const result = toWorkspaceSession(mockSession);
    expect(result.title).toBe('project');
  });

  it('falls back to id when workingDir has no segments', () => {
    const session = { ...mockSession, workingDir: '' };
    const result = toWorkspaceSession(session);
    expect(result.title).toBe('session-1');
  });

  it('sets provider to lunaria', () => {
    const result = toWorkspaceSession(mockSession);
    expect(result.provider).toBe('lunaria');
  });

  it('sets model from tuiType', () => {
    const result = toWorkspaceSession(mockSession);
    expect(result.model).toBe('native');
  });

  it('sets continueIn to local', () => {
    const result = toWorkspaceSession(mockSession);
    expect(result.continueIn).toBe('local');
  });
});

describe('toManagedAgents', () => {
  it('returns only root agents at top level', () => {
    const result = toManagedAgents(mockAgents);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Primary Engineer');
  });

  it('nests child agents under parent', () => {
    const result = toManagedAgents(mockAgents);
    expect(result[0]!.children).toHaveLength(1);
    expect(result[0]!.children![0]!.name).toBe('Builder');
  });

  it('sets type to Main for root agents', () => {
    const result = toManagedAgents(mockAgents);
    expect(result[0]!.type).toBe('Main');
  });

  it('sets type to Sub for child agents', () => {
    const result = toManagedAgents(mockAgents);
    expect(result[0]!.children![0]!.type).toBe('Sub');
  });

  it('normalizes active status to executing', () => {
    const agents: AgentRecord[] = [
      { id: 'a1', agentType: 'Worker', model: 'gpt-5', status: 'active' },
    ];
    const result = toManagedAgents(agents);
    expect(result[0]!.status).toBe('executing');
  });

  it('normalizes completed status to complete', () => {
    const agents: AgentRecord[] = [
      { id: 'a1', agentType: 'Worker', model: 'gpt-5', status: 'completed' },
    ];
    const result = toManagedAgents(agents);
    expect(result[0]!.status).toBe('complete');
  });

  it('normalizes failed status to error', () => {
    const agents: AgentRecord[] = [
      { id: 'a1', agentType: 'Worker', model: 'gpt-5', status: 'failed' },
    ];
    const result = toManagedAgents(agents);
    expect(result[0]!.status).toBe('error');
  });

  it('normalizes created status to thinking', () => {
    const agents: AgentRecord[] = [
      { id: 'a1', agentType: 'Worker', model: 'gpt-5', status: 'created' },
    ];
    const result = toManagedAgents(agents);
    expect(result[0]!.status).toBe('thinking');
  });

  it('normalizes unknown status to idle', () => {
    const agents: AgentRecord[] = [
      { id: 'a1', agentType: 'Worker', model: 'gpt-5', status: 'bogus' },
    ];
    const result = toManagedAgents(agents);
    expect(result[0]!.status).toBe('idle');
  });

  it('maps division and collaboration fields', () => {
    const result = toManagedAgents(mockAgents);
    expect(result[0]!.division).toBe('engineering');
    expect(result[0]!.collaborationStyle).toBe('directive');
    expect(result[0]!.decisionWeight).toBe(0.9);
  });

  it('returns empty array for no agents', () => {
    expect(toManagedAgents([])).toEqual([]);
  });
});

describe('inferTypes', () => {
  it('returns file extension for a file node', () => {
    const node: RuntimeFileNode = {
      name: 'main.ts',
      path: '/tmp/main.ts',
      nodeType: 'file',
      children: [],
    };
    expect(inferTypes(node)).toEqual(['ts']);
  });

  it('collects extensions recursively from folder', () => {
    const result = inferTypes(mockFileTree[0]!);
    expect(result).toContain('ts');
  });

  it('deduplicates extensions', () => {
    const folder: RuntimeFileNode = {
      name: 'src',
      path: '/src',
      nodeType: 'folder',
      children: [
        { name: 'a.ts', path: '/src/a.ts', nodeType: 'file', children: [] },
        { name: 'b.ts', path: '/src/b.ts', nodeType: 'file', children: [] },
      ],
    };
    const result = inferTypes(folder);
    expect(result.filter((e) => e === 'ts')).toHaveLength(1);
  });

  it('returns the full filename as extension when no dot separator exists', () => {
    // split(".").pop() on "Makefile" returns "Makefile" itself (truthy), so it is added as the type
    const node: RuntimeFileNode = {
      name: 'Makefile',
      path: '/Makefile',
      nodeType: 'file',
      children: [],
    };
    expect(inferTypes(node)).toEqual(['Makefile']);
  });
});

describe('findFileNodeByPath', () => {
  it('finds a top-level file node', () => {
    const node = findFileNodeByPath(mockFileTree, '/tmp/README.md');
    expect(node).not.toBeNull();
    expect(node!.name).toBe('README.md');
  });

  it('finds a nested file node', () => {
    const node = findFileNodeByPath(mockFileTree, '/tmp/src/main.ts');
    expect(node).not.toBeNull();
    expect(node!.name).toBe('main.ts');
  });

  it('returns null for missing path', () => {
    const node = findFileNodeByPath(mockFileTree, '/tmp/missing.ts');
    expect(node).toBeNull();
  });

  it('returns null for empty array', () => {
    const node = findFileNodeByPath([], '/tmp/any.ts');
    expect(node).toBeNull();
  });
});

describe('countTreeItems', () => {
  it('counts 1 for a file node', () => {
    const node: RuntimeFileNode = { name: 'a.ts', path: '/a.ts', nodeType: 'file', children: [] };
    expect(countTreeItems(node)).toBe(1);
  });

  it('counts all nested files in a folder', () => {
    // mockFileTree[0] is src/ with 2 files
    expect(countTreeItems(mockFileTree[0]!)).toBe(2);
  });

  it('returns 0 for empty folder', () => {
    const folder: RuntimeFileNode = {
      name: 'empty',
      path: '/empty',
      nodeType: 'folder',
      children: [],
    };
    expect(countTreeItems(folder)).toBe(0);
  });
});

describe('toFileNode', () => {
  it('maps name, path, type', () => {
    const node = toFileNode(mockFileTree[1]!); // README.md
    expect(node.name).toBe('README.md');
    expect(node.path).toBe('/tmp/README.md');
    expect(node.type).toBe('file');
  });

  it('sets itemCount for folder nodes', () => {
    const node = toFileNode(mockFileTree[0]!); // src/
    expect(node.itemCount).toBe(2);
  });

  it('itemCount is undefined for file nodes', () => {
    const node = toFileNode(mockFileTree[1]!);
    expect(node.itemCount).toBeUndefined();
  });

  it('maps children recursively', () => {
    const node = toFileNode(mockFileTree[0]!);
    expect(node.children).toHaveLength(2);
    expect(node.children![0]!.name).toBe('main.ts');
  });

  it('sets truncated to false', () => {
    const node = toFileNode(mockFileTree[0]!);
    expect(node.truncated).toBe(false);
  });
});

describe('interestingTranscriptEvent', () => {
  const interesting = [
    'tool.start',
    'tool.result',
    'permission.requested',
    'permission.resolved',
    'agent.mailbox',
    'agent.spawned',
    'agent.status',
    'usage',
  ];

  for (const eventType of interesting) {
    it(`returns true for ${eventType}`, () => {
      const event: TranscriptEvent = { id: 'e1', eventType, occurredAt: '', payload: {} };
      expect(interestingTranscriptEvent(event)).toBe(true);
    });
  }

  it('returns false for message.created', () => {
    const event: TranscriptEvent = {
      id: 'e1',
      eventType: 'message.created',
      occurredAt: '',
      payload: {},
    };
    expect(interestingTranscriptEvent(event)).toBe(false);
  });

  it('returns false for unknown event types', () => {
    const event: TranscriptEvent = { id: 'e1', eventType: 'unknown', occurredAt: '', payload: {} };
    expect(interestingTranscriptEvent(event)).toBe(false);
  });
});

describe('toTimelineMessages', () => {
  it('maps user messages', () => {
    const result = toTimelineMessages(mockMessages, []);
    const userMsg = result.find((m) => m.id === 'msg-1');
    expect(userMsg).toBeTruthy();
    expect(userMsg!.role).toBe('user');
    expect(userMsg!.content).toBe('Hello');
  });

  it('maps assistant messages', () => {
    const result = toTimelineMessages(mockMessages, []);
    const assistantMsg = result.find((m) => m.id === 'msg-2');
    expect(assistantMsg).toBeTruthy();
    expect(assistantMsg!.role).toBe('assistant');
  });

  it('appends streaming message as assistant when provided', () => {
    const result = toTimelineMessages([], [], 'Streaming content...');
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('streaming-assistant');
    expect(result[0]!.content).toBe('Streaming content...');
  });

  it('does not append streaming message when empty string', () => {
    const result = toTimelineMessages(mockMessages, [], '');
    expect(result.find((m) => m.id === 'streaming-assistant')).toBeUndefined();
  });

  it('includes permission.requested transcript events as permission role', () => {
    const events: TranscriptEvent[] = [
      {
        id: 'perm-1',
        eventType: 'permission.requested',
        occurredAt: '2026-01-01T00:00:02Z',
        payload: { message: 'Allow bash execution?', requestId: 'req-1' },
      },
    ];
    const result = toTimelineMessages([], events);
    const permMsg = result.find((m) => m.id === 'perm-1');
    expect(permMsg).toBeTruthy();
    expect(permMsg!.role).toBe('permission');
    expect(permMsg!.content).toBe('Allow bash execution?');
  });

  it('falls back to toolName in permission event when no message', () => {
    const events: TranscriptEvent[] = [
      {
        id: 'perm-2',
        eventType: 'permission.requested',
        occurredAt: '2026-01-01T00:00:02Z',
        payload: { toolName: 'bash', requestId: 'req-2' },
      },
    ];
    const result = toTimelineMessages([], events);
    expect(result[0]!.content).toBe('bash');
  });

  it('ignores non-permission transcript events', () => {
    const events: TranscriptEvent[] = [
      {
        id: 'tool-1',
        eventType: 'tool.start',
        occurredAt: '2026-01-01T00:00:02Z',
        payload: {},
      },
    ];
    const result = toTimelineMessages([], events);
    expect(result).toHaveLength(0);
  });
});

describe('toMemoryEntries', () => {
  it('returns empty array when memory is null', () => {
    expect(toMemoryEntries(null)).toEqual([]);
  });

  it('maps memory entries to MemoryTabEntry shape', () => {
    const result = toMemoryEntries(mockMemory);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('obs-1');
    expect(result[0]!.title).toBe('User preference');
    expect(result[0]!.type).toBe('user_prompt');
    expect(result[0]!.category).toBe('preference');
    expect(result[0]!.l0Summary).toBe('Dark mode preference');
    expect(result[0]!.l1Summary).toBe('User prefers dark mode');
    expect(result[0]!.l2Content).toBe('{"title":"Dark mode"}');
  });

  it('returns empty array for memory with no entries', () => {
    const memory: SessionMemoryResponse = {
      summary: null,
      tokenBudget: { total: 1000, l0: 0, l1: 0, l2: 0 },
      entries: [],
    };
    expect(toMemoryEntries(memory)).toEqual([]);
  });
});
