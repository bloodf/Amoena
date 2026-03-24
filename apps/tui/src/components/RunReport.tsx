import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { GoalRun } from '../types.js';

interface RunReportProps {
  readonly run: GoalRun;
  readonly onNewGoal: () => void;
  readonly onHistory: () => void;
  readonly onTemplates: () => void;
  readonly onQuit: () => void;
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function RunReport({
  run,
  onNewGoal,
  onHistory,
  onTemplates,
  onQuit,
}: RunReportProps) {
  useInput((input) => {
    if (input === 'n') onNewGoal();
    if (input === 'h') onHistory();
    if (input === 't') onTemplates();
    if (input === 'q') onQuit();
  });

  const totalDuration = run.finishedAt ? run.finishedAt - run.startedAt : 0;
  const statusColor = run.status === 'completed' ? 'green' : 'red';
  const statusLabel = run.status === 'completed' ? '✓ Completed' : '✗ Failed';

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold color={statusColor}>{statusLabel}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text bold>Goal: </Text>
        <Text>{run.goal}</Text>
      </Box>

      <Box gap={4} marginBottom={2}>
        <Text>
          <Text dimColor>Duration: </Text>
          <Text>{formatDuration(totalDuration)}</Text>
        </Text>
        <Text>
          <Text dimColor>Total cost: </Text>
          <Text color="yellow">${run.totalCost.toFixed(4)}</Text>
        </Text>
        <Text>
          <Text dimColor>Tasks: </Text>
          <Text>{run.tasks.filter((t) => t.status === 'completed').length}/{run.tasks.length}</Text>
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text bold underline>Task breakdown</Text>
      </Box>

      {run.tasks.map((task) => (
        <Box key={task.id} flexDirection="column" marginBottom={1} paddingLeft={2}>
          <Box flexDirection="row" gap={2}>
            <Text
              color={
                task.status === 'completed'
                  ? 'green'
                  : task.status === 'failed'
                  ? 'red'
                  : 'gray'
              }
            >
              {task.status === 'completed' ? '◉' : task.status === 'failed' ? '✗' : '○'}
            </Text>
            <Text bold>{task.name}</Text>
            <Text dimColor>[{task.agent}]</Text>
            <Text dimColor>{formatDuration(task.durationMs)}</Text>
            {task.cost > 0 ? <Text dimColor>${task.cost.toFixed(4)}</Text> : null}
          </Box>
          {task.routingReason ? (
            <Box paddingLeft={2}>
              <Text dimColor>Why: {task.routingReason}</Text>
            </Box>
          ) : null}
        </Box>
      ))}

      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>n: new goal  h: history  t: templates  q: quit</Text>
      </Box>
    </Box>
  );
}
