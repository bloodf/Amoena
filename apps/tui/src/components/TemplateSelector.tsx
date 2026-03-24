import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { GoalTemplate } from '../types.js';
import { BUILT_IN_TEMPLATES } from '../templates-data.js';

interface TemplateSelectorProps {
  readonly onSelect: (goal: string) => void;
  readonly onBack: () => void;
}

export function TemplateSelector({ onSelect, onBack }: TemplateSelectorProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const templates: readonly GoalTemplate[] = BUILT_IN_TEMPLATES;

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(templates.length - 1, prev + 1));
    }
    if (key.return) {
      const tpl = templates[selectedIndex];
      if (tpl) onSelect(tpl.goal);
    }
    if (key.escape || key.tab) {
      onBack();
    }
  });

  const selected = templates[selectedIndex];

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold>Goal Templates</Text>
      </Box>

      <Box flexDirection="row" gap={2} flexGrow={1}>
        <Box flexDirection="column" width={30}>
          {templates.map((tpl, i) => (
            <Box key={tpl.id} paddingLeft={i === selectedIndex ? 0 : 2}>
              {i === selectedIndex ? (
                <Text color="cyan" bold>{'> '}{tpl.name}</Text>
              ) : (
                <Text dimColor>  {tpl.name}</Text>
              )}
            </Box>
          ))}
        </Box>

        {selected ? (
          <Box flexDirection="column" flexGrow={1} paddingLeft={2} borderStyle="single" borderColor="gray">
            <Box marginBottom={1}>
              <Text bold>{selected.name}</Text>
            </Box>
            <Box marginBottom={1}>
              <Text>{selected.description}</Text>
            </Box>
            <Box marginBottom={1}>
              <Text dimColor>Estimated tasks: </Text>
              <Text>{selected.estimatedTasks}</Text>
            </Box>
            <Box>
              <Text dimColor wrap="wrap">{selected.goal}</Text>
            </Box>
          </Box>
        ) : null}
      </Box>

      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>↑↓: navigate  Enter: select  Esc/Tab: back</Text>
      </Box>
    </Box>
  );
}
