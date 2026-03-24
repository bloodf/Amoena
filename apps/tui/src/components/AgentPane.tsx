import React from 'react';
import { Box, Text } from 'ink';
import type { TaskNode, AgentProvider } from '../types.js';

const OUTPUT_WINDOW = 20;

interface AgentPaneProps {
  readonly task: TaskNode;
  readonly isFocused?: boolean;
}

const AGENT_COLOR: Record<AgentProvider, string> = {
  claude: 'yellow',
  codex: 'green',
  gemini: 'blue',
  unknown: 'white',
};

const STATUS_LABEL: Record<string, string> = {
  running: '● running',
  completed: '✓ done',
  failed: '✗ failed',
  queued: '◌ queued',
  skipped: '○ skipped',
};

export function AgentPane({ task, isFocused = false }: AgentPaneProps) {
  const color = AGENT_COLOR[task.agent];
  const visibleOutput = task.output.slice(-OUTPUT_WINDOW);

  return (
    <Box
      flexDirection="column"
      borderStyle={isFocused ? 'double' : 'single'}
      borderColor={isFocused ? color : 'gray'}
      paddingX={1}
      flexGrow={1}
    >
      <Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
        <Text bold color={color}>
          {task.agent.toUpperCase()} — {task.name}
        </Text>
        <Text
          color={
            task.status === 'completed'
              ? 'green'
              : task.status === 'failed'
              ? 'red'
              : task.status === 'running'
              ? 'cyan'
              : 'gray'
          }
        >
          {STATUS_LABEL[task.status] ?? task.status}
        </Text>
      </Box>

      <Box flexDirection="column" flexGrow={1}>
        {visibleOutput.length === 0 ? (
          <Text dimColor>Waiting for output...</Text>
        ) : (
          visibleOutput.map((line, i) => (
            <Text key={i} wrap="truncate">
              {line}
            </Text>
          ))
        )}
      </Box>
    </Box>
  );
}
