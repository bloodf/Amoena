import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { KanbanTaskCard } from "./KanbanTaskCard";
import type { KanbanTask } from "./types";

const task: KanbanTask = {
  id: "task-1",
  title: "Implement JWT validation",
  description: "Add token validation to middleware",
  agent: "Claude",
  agentColor: "tui-claude",
  priority: "high",
  tokens: "2.4k",
  createdAt: "10:30 AM",
};

function makeProps(overrides: Partial<Parameters<typeof KanbanTaskCard>[0]> = {}) {
  return {
    task,
    isDragging: false,
    onDragStart: vi.fn(() => {}),
    ...overrides,
  };
}

describe("KanbanTaskCard", () => {
  test("renders task title", () => {
    render(<KanbanTaskCard {...makeProps()} />);
    expect(screen.getByText("Implement JWT validation")).toBeTruthy();
  });

  test("renders task description", () => {
    render(<KanbanTaskCard {...makeProps()} />);
    expect(screen.getByText("Add token validation to middleware")).toBeTruthy();
  });

  test("renders priority badge", () => {
    render(<KanbanTaskCard {...makeProps()} />);
    expect(screen.getByText("high")).toBeTruthy();
  });

  test("renders agent name", () => {
    render(<KanbanTaskCard {...makeProps()} />);
    expect(screen.getByText("Claude")).toBeTruthy();
  });

  test("renders token count", () => {
    render(<KanbanTaskCard {...makeProps()} />);
    expect(screen.getByText("2.4k")).toBeTruthy();
  });

  test("applies dragging opacity when isDragging", () => {
    const { container } = render(<KanbanTaskCard {...makeProps({ isDragging: true })} />);
    expect((container.firstChild as HTMLElement).className).toContain("opacity-40");
  });

  test("does not render description when absent", () => {
    const taskNoDesc = { ...task, description: undefined };
    render(<KanbanTaskCard {...makeProps({ task: taskNoDesc })} />);
    expect(screen.queryByText("Add token validation to middleware")).toBeNull();
  });

  test("does not render agent when absent", () => {
    const taskNoAgent = { ...task, agent: undefined };
    render(<KanbanTaskCard {...makeProps({ task: taskNoAgent })} />);
    expect(screen.queryByText("Claude")).toBeNull();
  });
});
