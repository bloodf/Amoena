import type { TuiState, TuiAction, GoalRun, TaskNode, MCServerEvent } from './types.js';

export const initialState: TuiState = {
  mode: 'standalone',
  view: 'pre-run',
  run: null,
  history: [],
  connected: false,
  error: null,
};

function applyEvent(run: GoalRun | null, event: MCServerEvent): GoalRun | null {
  switch (event.type) {
    case 'run.started':
      return {
        id: event.runId,
        goal: event.goal,
        status: 'running',
        tasks: [],
        totalCost: 0,
        startedAt: event.ts,
      };

    case 'task.queued': {
      if (!run) return run;
      const already = run.tasks.some((t) => t.id === event.task.id);
      if (already) return run;
      return { ...run, tasks: [...run.tasks, event.task] };
    }

    case 'task.started': {
      if (!run) return run;
      return {
        ...run,
        tasks: run.tasks.map((t) =>
          t.id === event.taskId ? { ...t, status: 'running' as const } : t,
        ),
      };
    }

    case 'task.output': {
      if (!run) return run;
      return {
        ...run,
        tasks: run.tasks.map((t) =>
          t.id === event.taskId
            ? { ...t, output: [...t.output, event.line] }
            : t,
        ),
      };
    }

    case 'task.completed': {
      if (!run) return run;
      return {
        ...run,
        totalCost: run.totalCost + event.cost,
        tasks: run.tasks.map((t) =>
          t.id === event.taskId
            ? { ...t, status: 'completed' as const, cost: event.cost, durationMs: event.durationMs }
            : t,
        ),
      };
    }

    case 'task.failed': {
      if (!run) return run;
      return {
        ...run,
        tasks: run.tasks.map((t) =>
          t.id === event.taskId ? { ...t, status: 'failed' as const } : t,
        ),
      };
    }

    case 'run.completed': {
      if (!run) return run;
      return {
        ...run,
        status: 'completed',
        totalCost: event.totalCost,
        finishedAt: event.ts,
      };
    }

    case 'run.failed': {
      if (!run) return run;
      return { ...run, status: 'failed', finishedAt: event.ts };
    }

    default:
      return run;
  }
}

export function tuiReducer(state: TuiState, action: TuiAction): TuiState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_CONNECTED':
      return { ...state, connected: action.connected };

    case 'SET_ERROR':
      return { ...state, error: action.error };

    case 'SET_VIEW':
      return { ...state, view: action.view };

    case 'APPLY_EVENT': {
      const nextRun = applyEvent(state.run, action.event);
      const nextView =
        action.event.type === 'run.started'
          ? 'during-run'
          : action.event.type === 'run.completed' || action.event.type === 'run.failed'
          ? 'post-run'
          : state.view;
      return { ...state, run: nextRun, view: nextView };
    }

    case 'FINISH_RUN': {
      const nextHistory = state.run
        ? [state.run, ...state.history]
        : state.history;
      return { ...state, history: nextHistory, run: null, view: 'pre-run' };
    }

    default:
      return state;
  }
}
