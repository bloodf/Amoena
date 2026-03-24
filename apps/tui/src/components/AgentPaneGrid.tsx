import React, { useState } from 'react';
import { Box, useInput, useStdout } from 'ink';
import type { TaskNode } from '../types.js';
import { AgentPane } from './AgentPane.js';

interface AgentPaneGridProps {
  readonly tasks: readonly TaskNode[];
}

const SIDE_BY_SIDE_MAX = 3;
const MIN_WIDTH_FOR_SIDE_BY_SIDE = 120;

export function AgentPaneGrid({ tasks }: AgentPaneGridProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { stdout } = useStdout();
  const terminalWidth = stdout?.columns ?? 80;

  const activeTasks = tasks.filter(
    (t) => t.status === 'running' || t.status === 'completed' || t.status === 'failed',
  );

  useInput((_input, key) => {
    if (key.tab && activeTasks.length > 0) {
      setFocusedIndex((prev) => (prev + 1) % activeTasks.length);
    }
  });

  if (activeTasks.length === 0) {
    return null;
  }

  const useSideBySide =
    activeTasks.length <= SIDE_BY_SIDE_MAX &&
    terminalWidth >= MIN_WIDTH_FOR_SIDE_BY_SIDE;

  if (useSideBySide) {
    return (
      <Box flexDirection="row" flexGrow={1} gap={1}>
        {activeTasks.map((task, i) => (
          <AgentPane key={task.id} task={task} isFocused={i === focusedIndex} />
        ))}
      </Box>
    );
  }

  // Stacked layout — show focused pane at full height
  const focusedTask = activeTasks[focusedIndex] ?? activeTasks[0];
  return (
    <Box flexDirection="column" flexGrow={1}>
      {focusedTask ? (
        <AgentPane task={focusedTask} isFocused={true} />
      ) : null}
      <Box flexDirection="row" flexWrap="wrap" gap={1} marginTop={1}>
        {activeTasks.map((task, i) => (
          i !== focusedIndex ? (
            <Box key={task.id} width={30}>
              <AgentPane task={task} isFocused={false} />
            </Box>
          ) : null
        ))}
      </Box>
    </Box>
  );
}
