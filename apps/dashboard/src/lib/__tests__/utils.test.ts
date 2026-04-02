import { describe, expect, it } from 'vitest';
import type { Session } from '@/types';

const mockSession: Session = {
  id: 'session-1',
  key: 'main:sess-1',
  kind: 'direct',
  age: 'just now',
  model: 'claude-sonnet-4-6',
  tokens: '1k/35k',
  flags: [],
  active: true,
  startTime: Date.now(),
  lastActivity: Date.now(),
  messageCount: 10,
  cost: 0.001,
};

describe('cn', () => {
  it('merges class names correctly', async () => {
    const { cn } = await import('../utils');
    const result = cn('class1', 'class2');
    expect(typeof result).toBe('string');
  });

  it('handles undefined inputs gracefully', async () => {
    const { cn } = await import('../utils');
    const result = cn('class1', undefined as unknown as string, 'class2');
    expect(typeof result).toBe('string');
  });
});

describe('formatUptime', () => {
  it('formats seconds', async () => {
    const { formatUptime } = await import('../utils');
    expect(formatUptime(45000)).toBe('45s');
  });

  it('formats minutes and seconds', async () => {
    const { formatUptime } = await import('../utils');
    expect(formatUptime(90000)).toBe('1m 30s');
  });

  it('formats hours and minutes', async () => {
    const { formatUptime } = await import('../utils');
    expect(formatUptime(3600000)).toBe('1h 0m');
  });

  it('formats days and hours', async () => {
    const { formatUptime } = await import('../utils');
    expect(formatUptime(90000000)).toBe('1d 1h');
  });
});

describe('formatAge', () => {
  it('converts "just now" to "< 1m"', async () => {
    const { formatAge } = await import('../utils');
    expect(formatAge('just now')).toBe('< 1m');
  });

  it("removes ' ago' suffix", async () => {
    const { formatAge } = await import('../utils');
    expect(formatAge('2h ago')).toBe('2h');
  });

  it('passes through unaltered strings without ago', async () => {
    const { formatAge } = await import('../utils');
    expect(formatAge('unknown')).toBe('unknown');
  });
});

describe('parseTokenUsage', () => {
  it('parses standard format without k suffix', async () => {
    const { parseTokenUsage } = await import('../utils');
    const result = parseTokenUsage('28000/35000 (80%)');
    expect(result.used).toBe(28000);
    expect(result.total).toBe(35000);
    expect(result.percentage).toBe(80);
  });

  it('parses format without k suffix', async () => {
    const { parseTokenUsage } = await import('../utils');
    const result = parseTokenUsage('500/1000 (50%)');
    expect(result.used).toBe(500);
    expect(result.total).toBe(1000);
    expect(result.percentage).toBe(50);
  });

  it('returns zeros for invalid format', async () => {
    const { parseTokenUsage } = await import('../utils');
    const result = parseTokenUsage('invalid');
    expect(result).toEqual({ used: 0, total: 0, percentage: 0 });
  });
});

describe('getStatusColor', () => {
  it('returns green for active status', async () => {
    const { getStatusColor } = await import('../utils');
    expect(getStatusColor('active')).toBe('text-green-500');
  });

  it('returns yellow for idle status', async () => {
    const { getStatusColor } = await import('../utils');
    expect(getStatusColor('idle')).toBe('text-yellow-500');
  });

  it('returns red for error status', async () => {
    const { getStatusColor } = await import('../utils');
    expect(getStatusColor('error')).toBe('text-red-500');
  });

  it('returns gray for offline status', async () => {
    const { getStatusColor } = await import('../utils');
    expect(getStatusColor('offline')).toBe('text-gray-500');
  });

  it('returns gray for unknown status', async () => {
    const { getStatusColor } = await import('../utils');
    expect(getStatusColor('unknown' as 'active' | 'idle' | 'error' | 'offline')).toBe(
      'text-gray-500',
    );
  });
});

describe('getStatusBadgeColor', () => {
  it('returns active badge colors', async () => {
    const { getStatusBadgeColor } = await import('../utils');
    expect(getStatusBadgeColor('active')).toContain('green');
  });

  it('returns idle badge colors', async () => {
    const { getStatusBadgeColor } = await import('../utils');
    expect(getStatusBadgeColor('idle')).toContain('yellow');
  });

  it('returns error badge colors', async () => {
    const { getStatusBadgeColor } = await import('../utils');
    expect(getStatusBadgeColor('error')).toContain('red');
  });

  it('returns offline badge colors', async () => {
    const { getStatusBadgeColor } = await import('../utils');
    expect(getStatusBadgeColor('offline')).toContain('gray');
  });
});

describe('normalizeModel', () => {
  it('returns string model unchanged', async () => {
    const { normalizeModel } = await import('../utils');
    expect(normalizeModel('claude-sonnet-4-6')).toBe('claude-sonnet-4-6');
  });

  it('extracts primary from object format', async () => {
    const { normalizeModel } = await import('../utils');
    expect(normalizeModel({ primary: 'claude-opus-4-6' })).toBe('claude-opus-4-6');
  });

  it('returns empty string for invalid input', async () => {
    const { normalizeModel } = await import('../utils');
    expect(normalizeModel(null)).toBe('');
    expect(normalizeModel(undefined)).toBe('');
  });
});

describe('sessionToAgent', () => {
  it('converts session to agent with active status for recent sessions', async () => {
    const { sessionToAgent } = await import('../utils');
    const session: Session = { ...mockSession, age: 'just now' };
    const agent = sessionToAgent(session);
    expect(agent.status).toBe('active');
  });

  it('converts session to agent with idle status for hour-old sessions', async () => {
    const { sessionToAgent } = await import('../utils');
    const session: Session = { ...mockSession, age: '2h ago' };
    const agent = sessionToAgent(session);
    expect(agent.status).toBe('idle');
  });

  it('identifies main agent type for direct kind', async () => {
    const { sessionToAgent } = await import('../utils');
    const session: Session = { ...mockSession, kind: 'direct', key: 'main:sess' };
    const agent = sessionToAgent(session);
    expect(agent.type).toBe('main');
  });

  it('identifies subagent type when key contains subag', async () => {
    const { sessionToAgent } = await import('../utils');
    const session: Session = { ...mockSession, kind: 'direct', key: 'main:subag-1' };
    const agent = sessionToAgent(session);
    expect(agent.type).toBe('subagent');
  });

  it('identifies cron type when key contains cron', async () => {
    const { sessionToAgent } = await import('../utils');
    const session: Session = { ...mockSession, kind: 'direct', key: 'main:cron-1' };
    const agent = sessionToAgent(session);
    expect(agent.type).toBe('cron');
  });

  it('identifies group type for non-direct kind', async () => {
    const { sessionToAgent } = await import('../utils');
    const session: Session = { ...mockSession, kind: 'group' };
    const agent = sessionToAgent(session);
    expect(agent.type).toBe('group');
  });
});

describe('generateNodePosition', () => {
  it('returns x,y coordinates', async () => {
    const { generateNodePosition } = await import('../utils');
    const pos = generateNodePosition(0, 4);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
  });

  it('uses index 0 for first position', async () => {
    const { generateNodePosition } = await import('../utils');
    const pos = generateNodePosition(0, 1);
    expect(pos.x).toBeDefined();
    expect(pos.y).toBeDefined();
  });

  it('distributes nodes around center point', async () => {
    const { generateNodePosition } = await import('../utils');
    const pos0 = generateNodePosition(0, 4);
    const pos2 = generateNodePosition(2, 4);
    expect(pos0.x).not.toBe(pos2.x);
  });
});
