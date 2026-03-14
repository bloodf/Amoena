import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { TodoPanel } from "./TodoPanel";

const tasks = [
  { id: "1", title: "Implement auth", status: "completed" as const, priority: 1 },
  { id: "2", title: "Write tests", status: "in_progress" as const, priority: 2 },
  { id: "3", title: "Deploy", status: "pending" as const, priority: 3 },
  { id: "4", title: "Unit tests", status: "pending" as const, priority: 1, parentTaskId: "2" },
  { id: "5", title: "E2E tests", status: "blocked" as const, priority: 2, parentTaskId: "2" },
];

function makeHandlers() {
  return {
    onUpdateStatus: mock(() => {}),
    onReorder: mock(() => {}),
  };
}

describe("TodoPanel", () => {
  test("shows empty state when no tasks", () => {
    render(<TodoPanel tasks={[]} {...makeHandlers()} />);
    const paras = document.querySelectorAll("p");
    expect(paras.length).toBeGreaterThan(0);
  });

  test("renders task list with status icons", () => {
    render(<TodoPanel tasks={tasks} {...makeHandlers()} />);
    expect(screen.getByText("Implement auth")).toBeTruthy();
    expect(screen.getByText("Write tests")).toBeTruthy();
    expect(screen.getByText("Deploy")).toBeTruthy();
    // status icons rendered as buttons
    expect(screen.getByText("●")).toBeTruthy(); // completed
    expect(screen.getByText("◑")).toBeTruthy(); // in_progress
  });

  test("shows completion count", () => {
    render(<TodoPanel tasks={tasks} {...makeHandlers()} />);
    // 1 completed out of 5 total
    expect(screen.getByText(/1\/5/)).toBeTruthy();
  });

  test("renders nested child tasks", () => {
    render(<TodoPanel tasks={tasks} {...makeHandlers()} />);
    expect(screen.getByText("Unit tests")).toBeTruthy();
    expect(screen.getByText("E2E tests")).toBeTruthy();
  });

  test("calls onUpdateStatus when status icon toggled", () => {
    const handlers = makeHandlers();
    render(<TodoPanel tasks={tasks} {...handlers} />);
    // Click the completed task icon (●) to toggle it back to pending
    fireEvent.click(screen.getByText("●"));
    expect(handlers.onUpdateStatus).toHaveBeenCalledWith("1", "pending");
  });

  test("calls onUpdateStatus with completed when pending task toggled", () => {
    const handlers = makeHandlers();
    render(<TodoPanel tasks={tasks} {...handlers} />);
    // ○ is for pending tasks; task 4 (child of 2) renders before task 3 (root),
    // so index 1 is task 3
    const pendingIcons = screen.getAllByText("○");
    fireEvent.click(pendingIcons[1]);
    expect(handlers.onUpdateStatus).toHaveBeenCalledWith("3", "completed");
  });
});
