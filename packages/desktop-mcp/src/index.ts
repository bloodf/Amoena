// --- Types ---

export type McpServer = {
  readonly name: string;
  readonly command: string;
  readonly args: readonly string[];
};

export type McpTool = {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: object;
};

export type McpToolResult = {
  readonly success: boolean;
  readonly data: unknown;
  readonly error: string | undefined;
};

// --- Stub implementations ---

/**
 * Lists all registered MCP servers.
 * Returns an empty array until native discovery is wired up.
 */
export function listMcpServers(): McpServer[] {
  return [];
}

/**
 * Lists all tools exposed by a named MCP server.
 * Returns an empty array until native discovery is wired up.
 */
export function listMcpTools(_server: string): McpTool[] {
  return [];
}

/**
 * Calls a tool on a named MCP server with the given input.
 * Returns null until the bridge protocol is implemented.
 */
export async function callMcpTool(
  _server: string,
  _tool: string,
  _input: unknown,
): Promise<McpToolResult> {
  return { success: false, data: null, error: "MCP bridge not yet implemented" };
}
