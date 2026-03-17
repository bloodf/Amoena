import { describe, expect, it, vi } from "vitest";

vi.mock("../client-context", () => ({
  useClient: () => ({
    auth: null,
    client: null,
  }),
}));

describe("useTerminalEvents", () => {
  it("exports the hook", async () => {
    const mod = await import("./use-terminal-events");
    expect(typeof mod.useTerminalEvents).toBe("function");
  });
});
