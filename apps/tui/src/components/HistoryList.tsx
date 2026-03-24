import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { GoalRun } from '../types.js';

interface HistoryListProps {
  readonly runs: readonly GoalRun[];
  readonly onSelect: (run: GoalRun) => void;
  readonly onBack: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString();
}

function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

export function HistoryList({ runs, onSelect, onBack }: HistoryListProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(runs.length - 1, prev + 1));
    }
    if (key.return) {
      const run = runs[selectedIndex];
      if (run) onSelect(run);
    }
    if (key.escape || key.tab) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold>Run History</Text>
      </Box>

      {runs.length === 0 ? (
        <Box>
          <Text dimColor>No past runs yet.</Text>
        </Box>
      ) : (
        runs.map((run, i) => {
          const isFocused = i === selectedIndex;
          const statusColor =
            run.status === 'completed'
              ? 'green'
              : run.status === 'failed'
              ? 'red'
              : 'gray';

          return (
            <Box
              key={run.id}
              flexDirection="row"
              gap={2}
              paddingLeft={isFocused ? 0 : 2}
            >
              {isFocused ? <Text color="cyan">{'>'}</Text> : <Text> </Text>}
              <Text color={statusColor}>
                {run.status === 'completed' ? '◉' : run.status === 'failed' ? '✗' : '◌'}
              </Text>
              <Text wrap="truncate" dimColor={!isFocused}>
                {run.goal.slice(0, 50)}{run.goal.length > 50 ? '…' : ''}
              </Text>
              <Text dimColor>{formatCost(run.totalCost)}</Text>
              <Text dimColor>{formatDate(run.startedAt)}</Text>
            </Box>
          );
        })
      )}

      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>↑↓: navigate  Enter: view report  Esc/Tab: back</Text>
      </Box>
    </Box>
  );
}
