/**
 * 6-phase autonomous execution pipeline (Autopilot).
 *
 * An `AutopilotRun` progresses through phases sequentially.  Each phase has
 * a configurable timeout (default 10 minutes).  Phases can be rolled back to
 * the previous one when a recoverable error is detected.
 */

import { randomUUID } from 'crypto';

/** The ordered phases of an autopilot run. */
export enum AutopilotPhase {
  Analysis = 'Analysis',
  Planning = 'Planning',
  Implementation = 'Implementation',
  Testing = 'Testing',
  Review = 'Review',
  Merge = 'Merge',
}

/** Ordered array used for phase advancement / rollback arithmetic. */
const PHASE_ORDER: ReadonlyArray<AutopilotPhase> = [
  AutopilotPhase.Analysis,
  AutopilotPhase.Planning,
  AutopilotPhase.Implementation,
  AutopilotPhase.Testing,
  AutopilotPhase.Review,
  AutopilotPhase.Merge,
];

/** Default per-phase timeout in milliseconds (10 minutes). */
const DEFAULT_PHASE_TIMEOUT_MS = 10 * 60 * 1000;

/** Runtime status of an autopilot run. */
export type AutopilotStatus = 'running' | 'paused' | 'completed' | 'failed' | 'timed_out';

/** Metadata recorded for each phase. */
export interface PhaseRecord {
  readonly phase: AutopilotPhase;
  /** Wall-clock time when the phase started. */
  readonly startedAt: Date;
  /** Wall-clock time when the phase ended (null if still active). */
  readonly endedAt: Date | null;
  /** Per-phase timeout in milliseconds. */
  readonly timeoutMs: number;
}

/** A running or completed autopilot session. */
export interface AutopilotRun {
  readonly id: string;
  /** The high-level goal provided by the user. */
  readonly goal: string;
  /** Ordered history of phase records. */
  readonly phases: ReadonlyArray<PhaseRecord>;
  /** The phase currently being executed. */
  readonly currentPhase: AutopilotPhase;
  readonly status: AutopilotStatus;
  /** Per-phase timeout overrides in milliseconds (used when advancing phases). */
  readonly phaseTimeouts: PhaseTimeouts;
}

/** Per-phase timeout overrides.  Missing phases use the default. */
export type PhaseTimeouts = Partial<Record<AutopilotPhase, number>>;

/** Options for `startAutopilot`. */
export interface AutopilotOptions {
  /** Per-phase timeout overrides in milliseconds. */
  phaseTimeouts?: PhaseTimeouts;
}

/** Error thrown when phase operations are performed on a terminal run. */
export class AutopilotTerminalError extends Error {
  constructor(runId: string, status: AutopilotStatus) {
    super(`Run "${runId}" is in terminal state "${status}" and cannot be advanced.`);
    this.name = 'AutopilotTerminalError';
  }
}

/** Error thrown when attempting to roll back from the first phase. */
export class AutopilotRollbackError extends Error {
  constructor(phase: AutopilotPhase) {
    super(`Cannot roll back from the first phase "${phase}".`);
    this.name = 'AutopilotRollbackError';
  }
}

/** Error thrown when a phase execution exceeds its timeout. */
export class PhaseTimeoutError extends Error {
  constructor(phase: AutopilotPhase, timeoutMs: number) {
    super(`Phase "${phase}" timed out after ${timeoutMs}ms.`);
    this.name = 'PhaseTimeoutError';
  }
}

/** In-memory store: runId → AutopilotRun. */
const runStore = new Map<string, AutopilotRun>();

function resolveTimeout(phase: AutopilotPhase, overrides: PhaseTimeouts = {}): number {
  return overrides[phase] ?? DEFAULT_PHASE_TIMEOUT_MS;
}

function isTerminal(status: AutopilotStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'timed_out';
}

function indexOfPhase(phase: AutopilotPhase): number {
  return PHASE_ORDER.indexOf(phase);
}

/**
 * Runs a phase execution with timeout enforcement.
 *
 * @param phaseExecution - The async function to execute for the phase.
 * @param timeoutMs - Timeout in milliseconds.
 * @returns Promise that resolves with the result or rejects on timeout.
 */
async function runPhaseWithTimeout<T>(
  phaseExecution: () => Promise<T>,
  timeoutMs: number,
  phase: AutopilotPhase,
): Promise<{ timedOut: boolean }> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new PhaseTimeoutError(phase, timeoutMs)), timeoutMs),
  );

  try {
    await Promise.race([phaseExecution(), timeoutPromise]);
    return { timedOut: false };
  } catch (error) {
    if (error instanceof PhaseTimeoutError) {
      return { timedOut: true };
    }
    throw error;
  }
}

/**
 * Creates a new autopilot run starting at the Analysis phase.
 *
 * @param goal - High-level natural-language goal for the run.
 * @param options - Optional per-phase timeout overrides.
 * @returns The newly created `AutopilotRun`.
 *
 * @example
 * ```ts
 * const run = await startAutopilot("Refactor the auth module");
 * ```
 */
export async function startAutopilot(
  goal: string,
  options: AutopilotOptions = {},
): Promise<AutopilotRun> {
  const firstPhase = AutopilotPhase.Analysis;
  const initialPhaseRecord: PhaseRecord = {
    phase: firstPhase,
    startedAt: new Date(),
    endedAt: null,
    timeoutMs: resolveTimeout(firstPhase, options.phaseTimeouts),
  };

  const run: AutopilotRun = {
    id: randomUUID(),
    goal,
    phases: [initialPhaseRecord],
    currentPhase: firstPhase,
    status: 'running',
    phaseTimeouts: options.phaseTimeouts ?? {},
  };

  runStore.set(run.id, run);
  return run;
}

/**
 * Advances the run to the next phase.
 *
 * If the run is already at the final phase (Merge) and it is advanced,
 * the run transitions to `completed`.
 *
 * When phaseExecution is provided, it is raced against the current phase's
 * timeout. If the timeout expires before phaseExecution completes, the run
 * transitions to `timed_out` and returns without advancing.
 *
 * @param runId - ID of the run to advance.
 * @param phaseExecution - Optional async function representing phase work.
 * @returns Updated `AutopilotRun`.
 * @throws {AutopilotTerminalError} If the run is in a terminal state.
 *
 * @example
 * ```ts
 * const updated = await advancePhase(run.id);
 * ```
 */
export async function advancePhase(
  runId: string,
  phaseExecution?: () => Promise<unknown>,
): Promise<AutopilotRun> {
  const run = runStore.get(runId);
  if (!run) {
    throw new Error(`No autopilot run found with id "${runId}".`);
  }
  if (isTerminal(run.status)) {
    throw new AutopilotTerminalError(runId, run.status);
  }

  const currentIndex = indexOfPhase(run.currentPhase);
  const now = new Date();

  // If phaseExecution is provided, race it against the current phase's timeout.
  if (phaseExecution) {
    const currentPhaseTimeoutMs = run.phases[run.phases.length - 1]!.timeoutMs;

    const { timedOut } = await runPhaseWithTimeout(
      phaseExecution,
      currentPhaseTimeoutMs,
      run.currentPhase,
    );

    if (timedOut) {
      // Timeout expired before phase execution completed.
      const timedOutRun: AutopilotRun = {
        ...run,
        status: 'timed_out',
      };
      runStore.set(runId, timedOutRun);
      return timedOutRun;
    }
  }

  // Close the current phase record.
  const closedPhases: PhaseRecord[] = run.phases.map((p) =>
    p.phase === run.currentPhase && p.endedAt === null ? { ...p, endedAt: now } : p,
  );

  // Check if this was the last phase.
  if (currentIndex === PHASE_ORDER.length - 1) {
    const completed: AutopilotRun = {
      ...run,
      phases: closedPhases,
      status: 'completed',
    };
    runStore.set(runId, completed);
    return completed;
  }

  const nextPhase = PHASE_ORDER[currentIndex + 1]!;
  const nextPhaseRecord: PhaseRecord = {
    phase: nextPhase,
    startedAt: now,
    endedAt: null,
    timeoutMs: resolveTimeout(nextPhase, run.phaseTimeouts),
  };

  const advanced: AutopilotRun = {
    ...run,
    phases: [...closedPhases, nextPhaseRecord],
    currentPhase: nextPhase,
  };

  runStore.set(runId, advanced);
  return advanced;
}

/**
 * Rolls back the run to the previous phase.
 *
 * The current phase record is removed from the history and a fresh record
 * for the previous phase is appended so timing is reset.
 *
 * @param runId - ID of the run to roll back.
 * @returns Updated `AutopilotRun`.
 * @throws {AutopilotTerminalError} If the run is in a terminal state.
 * @throws {AutopilotRollbackError} If the run is already at the first phase.
 *
 * @example
 * ```ts
 * const rolled = await rollbackPhase(run.id);
 * ```
 */
export async function rollbackPhase(runId: string): Promise<AutopilotRun> {
  const run = runStore.get(runId);
  if (!run) {
    throw new Error(`No autopilot run found with id "${runId}".`);
  }
  if (isTerminal(run.status)) {
    throw new AutopilotTerminalError(runId, run.status);
  }

  const currentIndex = indexOfPhase(run.currentPhase);
  if (currentIndex === 0) {
    throw new AutopilotRollbackError(run.currentPhase);
  }

  const previousPhase = PHASE_ORDER[currentIndex - 1]!;

  // Drop the current (incomplete) phase record and re-open the previous one.
  const truncated = run.phases.filter((p) => p.phase !== run.currentPhase);
  const now = new Date();
  const reopened: PhaseRecord = {
    phase: previousPhase,
    startedAt: now,
    endedAt: null,
    timeoutMs: DEFAULT_PHASE_TIMEOUT_MS,
  };

  const rolledBack: AutopilotRun = {
    ...run,
    phases: [...truncated, reopened],
    currentPhase: previousPhase,
  };

  runStore.set(runId, rolledBack);
  return rolledBack;
}
