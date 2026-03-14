import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MemoryBrowserScreen } from "./MemoryBrowserScreen";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

vi.mock("@/components/MemoryGraphView", () => ({
  MemoryGraphView: ({ onSelectNode }: { onSelectNode: (key: string) => void }) => (
    <button type="button" onClick={() => onSelectNode("agent.preferences.theme")}>
      graph node
    </button>
  ),
}));

describe("MemoryBrowserScreen", () => {
  const createObjectURL = vi.fn(() => "blob:memory");
  const revokeObjectURL = vi.fn();

  afterEach(() => {
    vi.unstubAllGlobals();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
  });

  it("adds a memory entry and can switch to graph mode", () => {
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    render(<MemoryBrowserScreen />);

    fireEvent.click(screen.getByRole("button", { name: /add memory/i }));
    fireEvent.change(screen.getByPlaceholderText("memory.key"), {
      target: { value: "workspace.note" },
    });
    fireEvent.change(screen.getByPlaceholderText("Memory content..."), {
      target: { value: "Remember the database migration." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(screen.getAllByText("workspace.note").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /graph/i }));
    fireEvent.click(screen.getByRole("button", { name: "graph node" }));

    expect(screen.getByRole("button", { name: "graph node" })).toBeTruthy();
  });
});
