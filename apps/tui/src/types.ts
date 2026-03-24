// Shared types for the TUI — mirrors the @lunaria/contracts MCServerEvent shape
// but defined locally since the contracts package is not yet published.

export type AgentProvider = 'claude' | 'codex' | 'gemini' | 'unknown';

export type TaskStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface TaskNode {
  readonly id: string;
  readonly name: string;
  readonly agent: AgentProvider;
  readonly status: TaskStatus;
  readonly dependsOn: readonly string[];
  readonly cost: number;
  readonly durationMs: number;
  readonly output: readonly string[];
  readonly routingReason?: string;
}

export interface GoalRun {
  readonly id: string;
  readonly goal: string;
  readonly status: 'pending' | 'running' | 'completed' | 'failed';
  readonly tasks: readonly TaskNode[];
  readonly totalCost: number;
  readonly startedAt: number;
  readonly finishedAt?: number;
}

// WebSocket message types (subset of MCServerEvent)
export type MCServerEvent =
  | { type: 'run.started'; runId: string; goal: string; ts: number }
  | { type: 'task.queued'; runId: string; task: TaskNode }
  | { type: 'task.started'; runId: string; taskId: string; ts: number }
  | { type: 'task.output'; runId: string; taskId: string; line: string }
  | { type: 'task.completed'; runId: string; taskId: string; cost: number; durationMs: number }
  | { type: 'task.failed'; runId: string; taskId: string; error: string }
  | { type: 'run.completed'; runId: string; totalCost: number; ts: number }
  | { type: 'run.failed'; runId: string; error: string; ts: number };

// TUI application state
export type AppMode = 'server' | 'standalone';
export type ViewState = 'pre-run' | 'during-run' | 'post-run' | 'history' | 'templates';

export interface TuiState {
  readonly mode: AppMode;
  readonly view: ViewState;
  readonly run: GoalRun | null;
  readonly history: readonly GoalRun[];
  readonly connected: boolean;
  readonly error: string | null;
}

// Reducer actions
export type TuiAction =
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'SET_CONNECTED'; connected: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_VIEW'; view: ViewState }
  | { type: 'APPLY_EVENT'; event: MCServerEvent }
  | { type: 'FINISH_RUN' };

export interface GoalTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly goal: string;
  readonly estimatedTasks: number;
}
