import { EventEmitter } from "node:events";
import type { AgentSession, SessionStatus, SessionResult } from "../types.js";

/**
 * Base class for all adapter sessions.
 * Manages the result promise lifecycle and status transitions.
 * Concrete subclasses implement cancel() and process management.
 */
export abstract class BaseAgentSession
  extends EventEmitter
  implements AgentSession
{
  readonly id: string;
  readonly adapterId: string;
  protected _status: SessionStatus = "pending";
  readonly result: Promise<SessionResult>;
  protected _resolveResult!: (r: SessionResult) => void;
  protected _rejectResult!: (e: Error) => void;
  private _settled = false;

  constructor(id: string, adapterId: string) {
    super();
    this.id = id;
    this.adapterId = adapterId;
    this.result = new Promise<SessionResult>((resolve, reject) => {
      this._resolveResult = resolve;
      this._rejectResult = reject;
    });
    // Prevent "Unhandled 'error' event" crash when no listener is attached.
    // Callers can add their own error listener to handle stderr errors.
    this.on("error", () => {});
  }

  get status(): SessionStatus {
    return this._status;
  }

  protected setStatus(s: SessionStatus): void {
    this._status = s;
    this.emit("status", s);
  }

  /**
   * Settle the result promise exactly once.
   * Subsequent calls are no-ops (guards against race conditions between
   * normal exit, timeout, and cancel).
   */
  protected settle(value: SessionResult | Error): void {
    if (this._settled) return;
    this._settled = true;
    if (value instanceof Error) {
      this._rejectResult(value);
    } else {
      this._resolveResult(value);
    }
  }

  abstract cancel(): Promise<void>;
}

/** Thrown when a session is cancelled via cancel(). */
export class CancelledError extends Error {
  constructor(sessionId: string) {
    super(`Session ${sessionId} was cancelled.`);
    this.name = "CancelledError";
  }
}

/** Thrown (or used for settling) when a session times out. */
export class TimeoutError extends Error {
  constructor(sessionId: string) {
    super(`Session ${sessionId} timed out.`);
    this.name = "TimeoutError";
  }
}
