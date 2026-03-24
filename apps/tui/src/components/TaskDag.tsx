import React from 'react';
import { Box, Text } from 'ink';
import type { TaskNode, TaskStatus } from '../types.js';

interface TaskDagProps {
  readonly tasks: readonly TaskNode[];
}

const STATUS_ICON: Record<TaskStatus, string> = {
  completed: '◉',
  running: '⟳',
  queued: '◌',
  failed: '✗',
  skipped: '○',
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  completed: 'green',
  running: 'cyan',
  queued: 'gray',
  failed: 'red',
  skipped: 'gray',
};

function taskDepth(task: TaskNode, tasks: readonly TaskNode[]): number {
  if (task.dependsOn.length === 0) return 0;
  const parentDepths = task.dependsOn.map((depId) => {
    const parent = tasks.find((t) => t.id === depId);
    return parent ? taskDepth(parent, tasks) + 1 : 1;
  });
  return Math.max(...parentDepths);
}

export function TaskDag({ tasks }: TaskDagProps) {
  if (tasks.length === 0) {
    return (
      <Box paddingX={2}>
        <Text dimColor>Waiting for tasks...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2}>
      <Box marginBottom={1}>
        <Text bold>Task Graph</Text>
      </Box>
      {tasks.map((task) => {
        const depth = taskDepth(task, tasks);
        const indent = '  '.repeat(depth);
        const connector = depth > 0 ? '└─ ' : '';
        const icon = STATUS_ICON[task.status];
        const color = STATUS_COLOR[task.status];

        return (
          <Box key={task.id} flexDirection="row">
            <Text dimColor>{indent}{connector}</Text>
            <Text color={color}>{icon} </Text>
            <Text>{task.name}</Text>
            <Text dimColor> [{task.agent}]</Text>
            {task.status === 'completed' && task.cost > 0 ? (
              <Text dimColor> ${task.cost.toFixed(4)}</Text>
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
