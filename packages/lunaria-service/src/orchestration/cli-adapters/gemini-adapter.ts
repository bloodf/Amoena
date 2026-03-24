import { randomUUID } from "node:crypto";
import type {
  AgentAdapter,
  AgentCapability,
  AdapterTask,
  AgentSession,
  SessionResult,
} from "./types.js";
import { BaseAgentSession } from "./utils/base-session.js";

// ---------------------------------------------------------------------------
// GeminiSession (stub — fails immediately without spawning a process)
// ---------------------------------------------------------------------------

class GeminiSession extends BaseAgentSession {
  constructor(id: string) {
    super(id, "gemini");
  }

  async cancel(): Promise<void> {
    // Stub session never spawned a process; nothing to cancel
  }
}

// ---------------------------------------------------------------------------
// GeminiAdapter (stub)
// ---------------------------------------------------------------------------

export class GeminiAdapter implements AgentAdapter {
  readonly id = "gemini";
  readonly displayName = "Google Gemini";
  readonly capabilities: readonly AgentCapability[] = [
    "code-generation",
    "analysis",
  ];
  readonly costPerToken = null;

  async isAvailable(): Promise<boolean> {
    // Stub is not yet implemented: always return false regardless of env vars
    return false;
  }

  spawn(_task: AdapterTask): AgentSession {
    const session = new GeminiSession(randomUUID());

    // Emit failure asynchronously so listeners can be attached after spawn()
    setImmediate(() => {
      session["setStatus"]("failed");
      const result: SessionResult = {
        sessionId: session.id,
        adapterId: session.adapterId,
        exitCode: null,
        stdout: "",
        stderr: "Gemini adapter not yet implemented",
        durationMs: 0,
        tokenUsage: null,
      };
      session["settle"](result);
    });

    return session;
  }
}
