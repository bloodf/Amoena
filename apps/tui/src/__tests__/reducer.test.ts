import { describe, it, expect } from 'bun:test';
import { tuiReducer, initialState } from '../reducer.js';
import type { TuiState, TuiAction, TaskNode, GoalRun, MCServerEvent } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeTask = (overrides: Partial<TaskNode> = {}): TaskNode => ({
  id: 'task-1',
  name: 'Implement feature',
  agent: 'claude',
  status: 'queued',
  dependsOn: [],
  cost: 0,
  durationMs: 0,
  output: [],
  ...overrides,
});

const makeRun = (overrides: Partial<GoalRun> = {}): GoalRun => ({
  id: 'run-1',
  goal: 'Build something',
  status: 'running',
  tasks: [],
  totalCost: 0,
  startedAt: 1000,
  ...overrides,
});

// ---------------------------------------------------------------------------
// initialState
// ---------------------------------------------------------------------------

describe('initialState', () => {
  it('has expected defaults', () => {
    expect(initialState.mode).toBe('standalone');
    expect(initialState.view).toBe('pre-run');
    expect(initialState.run).toBeNull();
    expect(initialState.history).toEqual([]);
    expect(initialState.connected).toBe(false);
    expect(initialState.error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SET_MODE
// ---------------------------------------------------------------------------

describe('SET_MODE', () => {
  it('sets mode to server', () => {
    const next = tuiReducer(initialState, { type: 'SET_MODE', mode: 'server' });
    expect(next.mode).toBe('server');
  });

  it('sets mode to standalone', () => {
    const state: TuiState = { ...initialState, mode: 'server' };
    const next = tuiReducer(state, { type: 'SET_MODE', mode: 'standalone' });
    expect(next.mode).toBe('standalone');
  });

  it('does not mutate original state', () => {
    const before = { ...initialState };
    tuiReducer(initialState, { type: 'SET_MODE', mode: 'server' });
    expect(initialState).toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// SET_CONNECTED
// ---------------------------------------------------------------------------

describe('SET_CONNECTED', () => {
  it('sets connected to true', () => {
    const next = tuiReducer(initialState, { type: 'SET_CONNECTED', connected: true });
    expect(next.connected).toBe(true);
  });

  it('sets connected to false', () => {
    const state: TuiState = { ...initialState, connected: true };
    const next = tuiReducer(state, { type: 'SET_CONNECTED', connected: false });
    expect(next.connected).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SET_ERROR
// ---------------------------------------------------------------------------

describe('SET_ERROR', () => {
  it('sets error message', () => {
    const next = tuiReducer(initialState, { type: 'SET_ERROR', error: 'something broke' });
    expect(next.error).toBe('something broke');
  });

  it('clears error with null', () => {
    const state: TuiState = { ...initialState, error: 'old error' };
    const next = tuiReducer(state, { type: 'SET_ERROR', error: null });
    expect(next.error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SET_VIEW
// ---------------------------------------------------------------------------

describe('SET_VIEW', () => {
  it('switches to during-run', () => {
    const next = tuiReducer(initialState, { type: 'SET_VIEW', view: 'during-run' });
    expect(next.view).toBe('during-run');
  });

  it('switches to history', () => {
    const next = tuiReducer(initialState, { type: 'SET_VIEW', view: 'history' });
    expect(next.view).toBe('history');
  });

  it('switches to templates', () => {
    const next = tuiReducer(initialState, { type: 'SET_VIEW', view: 'templates' });
    expect(next.view).toBe('templates');
  });

  it('switches to post-run', () => {
    const next = tuiReducer(initialState, { type: 'SET_VIEW', view: 'post-run' });
    expect(next.view).toBe('post-run');
  });
});

// ---------------------------------------------------------------------------
// APPLY_EVENT — run.started
// ---------------------------------------------------------------------------

describe('APPLY_EVENT run.started', () => {
  it('creates a new run and sets view to during-run', () => {
    const event: MCServerEvent = { type: 'run.started', runId: 'r1', goal: 'test goal', ts: 5000 };
    const next = tuiReducer(initialState, { type: 'APPLY_EVENT', event });
    expect(next.run).not.toBeNull();
    expect(next.run?.id).toBe('r1');
    expect(next.run?.goal).toBe('test goal');
    expect(next.run?.status).toBe('running');
    expect(next.run?.tasks).toEqual([]);
    expect(next.run?.totalCost).toBe(0);
    expect(next.run?.startedAt).toBe(5000);
    expect(next.view).toBe('during-run');
  });
});

// ---------------------------------------------------------------------------
// APPLY_EVENT — task.queued
// ---------------------------------------------------------------------------

describe('APPLY_EVENT task.queued', () => {
  it('adds task to run', () => {
    const state: TuiState = { ...initialState, run: makeRun(), view: 'during-run' };
    const task = makeTask({ id: 't1' });
    const event: MCServerEvent = { type: 'task.queued', runId: 'run-1', task };
    const next = tuiReducer(state, { type: 'APPLY_EVENT', event });
    expect(next.run?.tasks).toHaveLength(1);
    expect(next.run?.tasks[0]?.id).toBe('t1');
  });

  it('does not add duplicate tasks', () => {
    const task = makeTask({ id: 't1' });
    const state: TuiState = { ...initialState, run: makeRun({ tasks: [task] }), view: 'during-run' };
    const event: MCServerEvent = { type: 'task.queued', runId: 'run-1', task };
    const next = tuiReducer(state, { type: 'APPLY_EVENT', event });
    expect(next.run?.tasks).toHaveLength(1);
  });

  it('returns state unchanged when no run exists', () => {
    const task = makeTask({ id: 't1' });
    const event: MCServerEvent = { type: 'task.queued', runId: 'run-1', task };
    const next = tuiReducer(initialState, { type: 'APPLY_EVENT', event });
    expect(next.run).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// APPLY_EVENT — task.started
// ---------------------------------------------------------------------------

describe('APPLY_EVENT task.started', () => {
  it('updates task status to running', () => {
    const task = makeTask({ id: 't1', status: 'queued' });
    const state: TuiState = { ...initialState, run: makeRun({ tasks: [task] }), view: 'during-run' };
    const event: MCServerEvent = { type: 'task.started', runId: 'run-1', taskId: 't1', ts: 2000 };
    const next = tuiReducer(state, { type: 'APPLY_EVENT', event });
    expect(next.run?.tasks[0]?.status).toBe('running');
  });

  it('does not affect other tasks', () => {
    const t1 = makeTask({ id: 't1', status: 'queued' });
    const t2 = makeTask({ id: 't2', status: 'queued' });
    const state: TuiState = { ...initialState, run: makeRun({ tasks: [t1, t2] }), view: 'during-run' };
    const event: MCServerEvent = { type: 'task.started', runId: 'run-1', taskId: 't1', ts: 2000 };
    const next = tuiReducer(state, { type: 'APPLY_EVENT', event });
    expect(next.run?.tasks[1]?.status).toBe('queued');
  });
});

// ---------------------------------------------------------------------------
// APPLY_EVENT — task.output
// ---------------------------------------------------------------------------

describe('APPLY_EVENT task.output', () => {
  it('appends output line to task', () => {
    const task = makeTask({ id: 't1', output: ['line 1'] });
    const state: TuiState = { ...initialState, run: makeRun({ tasks: [task] }), view: 'during-run' };
    const event: MCServerEvent = { type: 'task.output', runId: 'run-1', taskId: 't1', line: 'line 2' };
    const next = tuiReducer(state, { type: 'APPLY_EVENT', event });
    expect(next.run?.tasks[0]?.output).toEqual(['line 1', 'line 2']);
  });
});

// ---------------------------------------------------------------------------
// APPLY_EVENT — task.completed
// ---------------------------------------------------------------------------

describe('APPLY_EVENT task.completed', () => {
  it('updates task status, cost, and duration', () => {
    const task = makeTask({ id: 't1', status: 'running' });
    const state: TuiState = { ...initialState, run: makeRun({ tasks: [task] }), view: 'during-run' };
    const event: MCServerEvent = {
      type: 'task.completed', runId: 'run-1', taskId: 't1', cost: 0.01, durationMs: 500,
    };
    const next = tuiReducer(state, { type: 'APPLY_EVENT', event });
    expect(next.run?.tasks[0]?.status).toBe('completed');
    expect(next.run?.tasks[0]?.cost).toBe(0.01);
    expect(next.run?.tasks[0]?.durationMs).toBe(500);
  });

  it('accumulates totalCost on run', () => {
    const task = makeTask({ id: 't1', status: 'running' });
    const state: TuiState = { ...initialState, run: makeRun({ tasks: [task], totalCost: 0.05 }), view: 'during-run' };
    const event: MCServerEvent = {
      type: 'task.completed', runId: 'run-1', taskId: 't1', cost: 0.02, durationMs: 100,
    };
    const next = tuiReducer(state, { type: 'APPLY_EVENT', event });
    expect(next.run?.totalCost).toBeCloseTo(0.07);
  });
});

// ---------------------------------------------------------------------------
// APPLY_EVENT — task.failed
// ---------------------------------------------------------------------------

describe('APPLY_EVENT task.failed', () => {
  it('sets task status to failed', () => {
    const task = makeTask({ id: 't1', status: 'running' });
    const state: TuiState = { ...initialState, run: makeRun({ tasks: [task] }), view: 'during-run' };
    const event: MCServerEvent = { type: 'task.failed', runId: 'run-1', taskId: 't1', error: 'boom' };
    const next = tuiReducer(state, { type: 'APPLY_EVENT', event });
    expect(next.run?.tasks[0]?.status).toBe('failed');
  });
});

// ---------------------------------------------------------------------------
// APPLY_EVENT — run.completed
// ---------------------------------------------------------------------------

describe('APPLY_EVENT run.completed', () => {
  it('sets run status to completed and view to post-run', () => {
    const state: TuiState = { ...initialState, run: makeRun(), view: 'during-run' };
    const event: MCServerEvent = { type: 'run.completed', runId: 'run-1', totalCost: 0.1, ts: 9000 };
    const next = tuiReducer(state, { type: 'APPLY_EVENT', event });
    expect(next.run?.status).toBe('completed');
    expect(next.run?.totalCost).toBe(0.1);
    expect(next.run?.finishedAt).toBe(9000);
    expect(next.view).toBe('post-run');
  });
});

// ---------------------------------------------------------------------------
// APPLY_EVENT — run.failed
// ---------------------------------------------------------------------------

describe('APPLY_EVENT run.failed', () => {
  it('sets run status to failed and view to post-run', () => {
    const state: TuiState = { ...initialState, run: makeRun(), view: 'during-run' };
    const event: MCServerEvent = { type: 'run.failed', runId: 'run-1', error: 'crash', ts: 9500 };
    const next = tuiReducer(state, { type: 'APPLY_EVENT', event });
    expect(next.run?.status).toBe('failed');
    expect(next.run?.finishedAt).toBe(9500);
    expect(next.view).toBe('post-run');
  });
});

// ---------------------------------------------------------------------------
// FINISH_RUN
// ---------------------------------------------------------------------------

describe('FINISH_RUN', () => {
  it('moves run to history and resets to pre-run', () => {
    const run = makeRun({ id: 'r1' });
    const state: TuiState = { ...initialState, run, view: 'post-run', history: [] };
    const next = tuiReducer(state, { type: 'FINISH_RUN' });
    expect(next.run).toBeNull();
    expect(next.view).toBe('pre-run');
    expect(next.history).toHaveLength(1);
    expect(next.history[0]?.id).toBe('r1');
  });

  it('prepends to existing history', () => {
    const oldRun = makeRun({ id: 'r-old' });
    const currentRun = makeRun({ id: 'r-new' });
    const state: TuiState = { ...initialState, run: currentRun, history: [oldRun] };
    const next = tuiReducer(state, { type: 'FINISH_RUN' });
    expect(next.history).toHaveLength(2);
    expect(next.history[0]?.id).toBe('r-new');
    expect(next.history[1]?.id).toBe('r-old');
  });

  it('does not add to history when no run exists', () => {
    const state: TuiState = { ...initialState, run: null, history: [] };
    const next = tuiReducer(state, { type: 'FINISH_RUN' });
    expect(next.history).toHaveLength(0);
    expect(next.view).toBe('pre-run');
  });
});

// ---------------------------------------------------------------------------
// Unknown action
// ---------------------------------------------------------------------------

describe('unknown action', () => {
  it('returns state unchanged', () => {
    const next = tuiReducer(initialState, { type: 'UNKNOWN_ACTION' } as unknown as TuiAction);
    expect(next).toEqual(initialState);
  });
});
