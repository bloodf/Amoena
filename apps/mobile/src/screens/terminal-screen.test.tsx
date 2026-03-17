import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TerminalScreen } from "./terminal-screen";

vi.mock("@lunaria/i18n", () => ({
  useLunariaTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/runtime/hooks/use-terminal-events", () => ({
  useTerminalEvents: () => ({
    data: [],
    error: null,
    isLoading: false,
    refresh: vi.fn(),
  }),
}));

describe("TerminalScreen", () => {
  it("renders terminal title", () => {
    render(<TerminalScreen terminalSessionId="t1" />);
    expect(screen.getByText("mobile.terminal")).toBeTruthy();
  });

  it("shows empty state when no output", () => {
    render(<TerminalScreen terminalSessionId="t1" />);
    expect(screen.getAllByText("mobile.noTerminalOutput").length).toBeGreaterThan(0);
  });
});
