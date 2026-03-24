/**
 * Standalone engine: embeds a minimal orchestration loop directly in the TUI.
 * When no Lunaria server is reachable, this runs agent tasks in-process.
 *
 * In this phase the engine is a lightweight simulation that emits MCServerEvent
 * compatible events. A full DAG scheduler integration is deferred until
 * @lunaria/lunaria-service is published to the workspace.
 */

import { EventEmitter } from 'events';
import { monotonicFactory } from 'ulid';
import type { MCServerEvent, AgentProvider, TaskNode } from '../types.js';

const ulid = monotonicFactory();

export type EngineEvent = MCServerEvent;

export interface AdapterAvailability {
  readonly claude: boolean;
  readonly codex: boolean;
  readonly gemini: boolean;
}

export function detectAvailableAdapters(): AdapterAvailability {
  return {
    claude: Boolean(
      process.env['ANTHROPIC_API_KEY'] ?? process.env['CLAUDE_API_KEY'],
    ),
    codex: Boolean(process.env['OPENAI_API_KEY']),
    gemini: Boolean(
      process.env['GOOGLE_API_KEY'] ?? process.env['GEMINI_API_KEY'],
    ),
  };
}

function pickAgent(adapters: AdapterAvailability): AgentProvider {
  if (adapters.claude) return 'claude';
  if (adapters.codex) return 'codex';
  if (adapters.gemini) return 'gemini';
  return 'unknown';
}

function decomposeTasks(goal: string, runId: string): TaskNode[] {
  // Minimal static decomposition — a real implementation delegates to the DAG scheduler.
  const steps = [
    'Plan & research',
    'Scaffold structure',
    'Implement core logic',
    'Write tests',
    'Review & refine',
  ];
  const adapters = detectAvailableAdapters();
  const agent = pickAgent(adapters);

  return steps.map((name, i) => ({
    id: `${runId}-t${i}`,
    name,
    agent,
    status: 'queued' as const,
    dependsOn: i === 0 ? [] : [`${runId}-t${i - 1}`],
    cost: 0,
    durationMs: 0,
    output: [],
    routingReason: agent === 'unknown'
      ? 'No API keys detected — set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_API_KEY'
      : `Selected ${agent} (first available adapter)`,
  }));
}

export class StandaloneEngine extends EventEmitter {
  private running = false;

  on(event: 'event', listener: (e: EngineEvent) => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  private send(event: EngineEvent): void {
    this.emit('event', event);
  }

  async run(goal: string): Promise<void> {
    if (this.running) return;
    this.running = true;

    const runId = ulid();
    const ts = Date.now();

    this.send({ type: 'run.started', runId, goal, ts });

    const tasks = decomposeTasks(goal, runId);
    for (const task of tasks) {
      this.send({ type: 'task.queued', runId, task });
    }

    const adapters = detectAvailableAdapters();
    const hasAdapter = adapters.claude || adapters.codex || adapters.gemini;

    let totalCost = 0;

    for (const task of tasks) {
      this.send({ type: 'task.started', runId, taskId: task.id, ts: Date.now() });

      if (!hasAdapter) {
        // Simulate work with a notice line
        this.send({
          type: 'task.output',
          runId,
          taskId: task.id,
          line: '[standalone] No API key — simulation only',
        });
        await sleep(300);
        this.send({
          type: 'task.completed',
          runId,
          taskId: task.id,
          cost: 0,
          durationMs: 300,
        });
      } else {
        // Real execution: delegate to the appropriate adapter CLI.
        // Full implementation will import from @lunaria/lunaria-service.
        const started = Date.now();
        this.send({
          type: 'task.output',
          runId,
          taskId: task.id,
          line: `[${task.agent}] Starting: ${task.name}`,
        });
        await sleep(500); // placeholder — real adapter call goes here
        const duration = Date.now() - started;
        const cost = 0.0002; // placeholder
        totalCost += cost;
        this.send({
          type: 'task.completed',
          runId,
          taskId: task.id,
          cost,
          durationMs: duration,
        });
      }
    }

    this.send({ type: 'run.completed', runId, totalCost, ts: Date.now() });
    this.running = false;
  }

  cancel(): void {
    this.running = false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
