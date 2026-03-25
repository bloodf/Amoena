import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import type { AgentProvider, AppMode } from '../types.js';

interface GoalInputProps {
  readonly mode: AppMode;
  readonly availableAgents: readonly AgentProvider[];
  readonly onSubmit: (goal: string) => void;
  readonly onSwitchToTemplates: () => void;
}

const AGENT_LABELS: Record<AgentProvider, string> = {
  claude: 'Claude (Anthropic)',
  codex: 'Codex (OpenAI)',
  gemini: 'Gemini (Google)',
  unknown: 'No agent — set API key',
};

const AGENT_COLORS: Record<AgentProvider, string> = {
  claude: 'yellow',
  codex: 'green',
  gemini: 'blue',
  unknown: 'gray',
};

export function GoalInput({
  mode,
  availableAgents,
  onSubmit,
  onSwitchToTemplates,
}: GoalInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useInput((input, key) => {
    if (key.tab) {
      onSwitchToTemplates();
    }
  });

  function handleSubmit(submitted: string) {
    const trimmed = submitted.trim();
    if (!trimmed) {
      setError('Please enter a goal');
      return;
    }
    setError('');
    onSubmit(trimmed);
  }

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Amoena TUI
        </Text>
        <Text color="gray"> — </Text>
        <Text color={mode === 'server' ? 'green' : 'yellow'}>
          {mode === 'server' ? '[SERVER]' : '[STANDALONE]'}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>What should your agents build today?</Text>
      </Box>

      <Box borderStyle="round" borderColor="cyan" paddingX={1} marginBottom={1}>
        <Text color="cyan">{'> '}</Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder="Describe your goal..."
        />
      </Box>

      {error ? (
        <Box marginBottom={1}>
          <Text color="red">{error}</Text>
        </Box>
      ) : null}

      <Box flexDirection="column" marginBottom={1}>
        <Text dimColor>Available agents:</Text>
        {availableAgents.length === 0 ? (
          <Text color="red">  No agents available — configure API keys</Text>
        ) : (
          availableAgents.map((agent) => (
            <Text key={agent} color={AGENT_COLORS[agent]}>
              {'  '}{AGENT_LABELS[agent]}
            </Text>
          ))
        )}
      </Box>

      <Box>
        <Text dimColor>Tab: templates  Enter: submit  q: quit</Text>
      </Box>
    </Box>
  );
}
