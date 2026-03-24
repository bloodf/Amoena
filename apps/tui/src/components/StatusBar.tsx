import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import type { GoalRun, AppMode } from '../types.js';

interface StatusBarProps {
  readonly run: GoalRun | null;
  readonly mode: AppMode;
  readonly connected: boolean;
}

function formatElapsed(startedAt: number): string {
  const ms = Date.now() - startedAt;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function StatusBar({ run, mode, connected }: StatusBarProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!run || run.status !== 'running') return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [run]);

  const completed = run?.tasks.filter((t) => t.status === 'completed').length ?? 0;
  const total = run?.tasks.length ?? 0;
  const active = run?.tasks.filter((t) => t.status === 'running').length ?? 0;
  const cost = run?.totalCost ?? 0;
  const elapsed = run ? formatElapsed(run.startedAt) : '—';

  const modeLabel = mode === 'server'
    ? connected ? '[SERVER ●]' : '[SERVER ○]'
    : '[STANDALONE]';

  const modeColor = mode === 'server'
    ? connected ? 'green' : 'red'
    : 'yellow';

  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      flexDirection="row"
      justifyContent="space-between"
    >
      <Box gap={2}>
        <Text>
          <Text dimColor>Tasks: </Text>
          <Text color="green">{completed}</Text>
          <Text dimColor>/{total}</Text>
        </Text>
        <Text>
          <Text dimColor>Active: </Text>
          <Text color="cyan">{active}</Text>
        </Text>
        <Text>
          <Text dimColor>Cost: </Text>
          <Text color="yellow">${cost.toFixed(4)}</Text>
        </Text>
        <Text>
          <Text dimColor>Elapsed: </Text>
          <Text>{elapsed}</Text>
        </Text>
      </Box>
      <Text color={modeColor}>{modeLabel}</Text>
    </Box>
  );
}
