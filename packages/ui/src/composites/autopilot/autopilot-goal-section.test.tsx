import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { AutopilotGoalSection } from "./AutopilotGoalSection";

function makeProps(overrides: Partial<Parameters<typeof AutopilotGoalSection>[0]> = {}) {
  return {
    goalText: "Refactor JWT auth module",
    editingGoal: false,
    onToggleEditing: vi.fn(() => {}),
    onChangeGoal: vi.fn((_v: string) => {}),
    ...overrides,
  };
}

describe("AutopilotGoalSection", () => {
  test("renders goal text in view mode", () => {
    render(<AutopilotGoalSection {...makeProps()} />);
    expect(screen.getByText("Refactor JWT auth module")).toBeTruthy();
  });

  test("renders Edit button when not editing", () => {
    render(<AutopilotGoalSection {...makeProps({ editingGoal: false })} />);
    expect(screen.getByText("Edit")).toBeTruthy();
  });

  test("renders Save button when editing", () => {
    render(<AutopilotGoalSection {...makeProps({ editingGoal: true })} />);
    expect(screen.getByText("Save")).toBeTruthy();
  });

  test("renders textarea when editing", () => {
    render(<AutopilotGoalSection {...makeProps({ editingGoal: true })} />);
    const textarea = document.querySelector("textarea");
    expect(textarea).toBeTruthy();
    expect(textarea?.value).toBe("Refactor JWT auth module");
  });

  test("calls onToggleEditing when Edit button clicked", () => {
    const onToggleEditing = vi.fn(() => {});
    render(<AutopilotGoalSection {...makeProps({ onToggleEditing })} />);
    fireEvent.click(screen.getByText("Edit"));
    expect(onToggleEditing).toHaveBeenCalled();
  });

  test("calls onChangeGoal when textarea value changes", () => {
    const onChangeGoal = vi.fn((_v: string) => {});
    render(<AutopilotGoalSection {...makeProps({ editingGoal: true, onChangeGoal })} />);
    const textarea = document.querySelector("textarea")!;
    fireEvent.change(textarea, { target: { value: "New goal" } });
    expect(onChangeGoal).toHaveBeenCalledWith("New goal");
  });

  test("renders Current Goal heading", () => {
    render(<AutopilotGoalSection {...makeProps()} />);
    expect(screen.getByText("Current Goal")).toBeTruthy();
  });
});
