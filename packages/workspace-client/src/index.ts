// --- Types ---

export type TerminalInfo = {
  readonly id: string;
  readonly pid: number;
  readonly cwd: string;
};

export type SpawnTerminalOptions = {
  readonly cwd?: string;
  readonly env?: Record<string, string>;
};

export type WorkspaceClient = {
  health(): Promise<{ ok: boolean }>;
  listTerminals(): Promise<TerminalInfo[]>;
  spawnTerminal(options?: SpawnTerminalOptions): Promise<TerminalInfo>;
  killTerminal(id: string): Promise<void>;
};

// --- Factory ---

const DEFAULT_BASE_URL = "http://localhost:4879";

export function createWorkspaceClient(baseUrl: string = DEFAULT_BASE_URL): WorkspaceClient {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { "content-type": "application/json" },
      ...init,
    });
    if (!res.ok) {
      throw new Error(`workspace-client: ${init?.method ?? "GET"} ${path} → ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  return {
    health(): Promise<{ ok: boolean }> {
      return request<{ ok: boolean }>("/health");
    },

    listTerminals(): Promise<TerminalInfo[]> {
      return request<TerminalInfo[]>("/terminals");
    },

    spawnTerminal(options: SpawnTerminalOptions = {}): Promise<TerminalInfo> {
      return request<TerminalInfo>("/terminals", {
        method: "POST",
        body: JSON.stringify(options),
      });
    },

    killTerminal(id: string): Promise<void> {
      return request<void>(`/terminals/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  };
}
