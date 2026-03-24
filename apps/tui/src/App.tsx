import React, { useCallback } from 'react';
import { Box, useApp, useInput } from 'ink';
import { useGoalRun } from './hooks/use-goal-run.js';
import { GoalInput } from './components/GoalInput.js';
import { TaskDag } from './components/TaskDag.js';
import { AgentPaneGrid } from './components/AgentPaneGrid.js';
import { StatusBar } from './components/StatusBar.js';
import { RunReport } from './components/RunReport.js';
import { TemplateSelector } from './components/TemplateSelector.js';
import { HistoryList } from './components/HistoryList.js';
import { detectAvailableAdapters } from './engine/standalone-engine.js';
import type { AgentProvider } from './types.js';

interface AppProps {
  readonly serverUrl?: string;
  readonly forceStandalone?: boolean;
}

function resolveAvailableAgents(): AgentProvider[] {
  const a = detectAvailableAdapters();
  const agents: AgentProvider[] = [];
  if (a.claude) agents.push('claude');
  if (a.codex) agents.push('codex');
  if (a.gemini) agents.push('gemini');
  return agents;
}

export function App({ serverUrl, forceStandalone }: AppProps) {
  const { exit } = useApp();
  const { state, dispatch, submitGoal, cancelRun } = useGoalRun({
    serverUrl,
    forceStandalone,
  });

  const availableAgents = resolveAvailableAgents();

  useInput((input, key) => {
    if (input === 'q' && state.view !== 'pre-run') {
      exit();
    }
    if (input === 'q' && state.view === 'pre-run') {
      exit();
    }
    if (input === 'c' && state.view === 'during-run') {
      cancelRun();
    }
  });

  const handleGoalSubmit = useCallback(
    (goal: string) => {
      submitGoal(goal);
    },
    [submitGoal],
  );

  const handleSelectTemplate = useCallback(
    (goal: string) => {
      dispatch({ type: 'SET_VIEW', view: 'pre-run' });
      submitGoal(goal);
    },
    [dispatch, submitGoal],
  );

  const handleNewGoal = useCallback(() => {
    dispatch({ type: 'FINISH_RUN' });
  }, [dispatch]);

  const handleViewHistory = useCallback(() => {
    dispatch({ type: 'SET_VIEW', view: 'history' });
  }, [dispatch]);

  const handleViewTemplates = useCallback(() => {
    dispatch({ type: 'SET_VIEW', view: 'templates' });
  }, [dispatch]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'SET_VIEW', view: 'pre-run' });
  }, [dispatch]);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box flexDirection="column" flexGrow={1}>
        {state.view === 'pre-run' && (
          <GoalInput
            mode={state.mode}
            availableAgents={availableAgents}
            onSubmit={handleGoalSubmit}
            onSwitchToTemplates={handleViewTemplates}
          />
        )}

        {state.view === 'during-run' && state.run && (
          <Box flexDirection="row" flexGrow={1}>
            <Box flexDirection="column" width={35}>
              <TaskDag tasks={state.run.tasks} />
            </Box>
            <AgentPaneGrid tasks={state.run.tasks} />
          </Box>
        )}

        {state.view === 'post-run' && state.run && (
          <RunReport
            run={state.run}
            onNewGoal={handleNewGoal}
            onHistory={handleViewHistory}
            onTemplates={handleViewTemplates}
            onQuit={exit}
          />
        )}

        {state.view === 'templates' && (
          <TemplateSelector
            onSelect={handleSelectTemplate}
            onBack={handleBack}
          />
        )}

        {state.view === 'history' && (
          <HistoryList
            runs={state.history}
            onSelect={(run) => {
              // Re-display the run report for a historical run
              dispatch({ type: 'APPLY_EVENT', event: { type: 'run.started', runId: run.id, goal: run.goal, ts: run.startedAt } });
            }}
            onBack={handleBack}
          />
        )}
      </Box>

      <StatusBar
        run={state.run}
        mode={state.mode}
        connected={state.connected}
      />
    </Box>
  );
}
