import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { AgentsTab } from "@/composites/side-panel/AgentsTab";
import { MemoryTab } from "@/composites/side-panel/MemoryTab";
import { TimelineTab } from "@/composites/side-panel/TimelineTab";

describe("Lunaria side panel direct tabs", () => {
  test("agents tab collapses and expands hierarchy", () => {
    render(<AgentsTab />);

    expect(screen.getByText("Code Reviewer")).toBeTruthy();
    fireEvent.click(screen.getByText("Claude 4 Sonnet"));
    expect(screen.queryByText("Code Reviewer")).toBeNull();
    fireEvent.click(screen.getByText("Claude 4 Sonnet"));
    expect(screen.getByText("Code Reviewer")).toBeTruthy();
  });

  test("memory tab filters and shows empty state", () => {
    render(<MemoryTab />);

    fireEvent.change(screen.getByDisplayValue("All Types"), { target: { value: "session" } });
    expect(screen.getByText("Testing preference")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Pattern" }));
    expect(screen.getByText("No memories match filters")).toBeTruthy();
  });

  test("timeline tab switches checkpoints and branch children", () => {
    render(<TimelineTab />);

    fireEvent.click(screen.getByText("JWT token rotation"));
    expect(screen.getByText("Alt: Session-based auth")).toBeTruthy();
    expect(screen.getByLabelText("Restore checkpoint")).toBeTruthy();
    expect(screen.getByLabelText("Fork from checkpoint")).toBeTruthy();
  });
});
