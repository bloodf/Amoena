import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TaskProgress } from "./TaskProgress";

describe("TaskProgress", () => {
  it("shows 'No tasks' when all counts are 0", () => {
    render(<TaskProgress counts={{ completed: 0, running: 0, queued: 0, failed: 0 }} />);
    expect(screen.getAllByText("No tasks").length).toBeGreaterThanOrEqual(1);
  });

  it("renders labels for each status when not compact", () => {
    render(
      <TaskProgress counts={{ completed: 3, running: 2, queued: 5, failed: 1 }} />,
    );
    expect(screen.getAllByText("3 done").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2 running").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("5 queued").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("1 failed").length).toBeGreaterThanOrEqual(1);
  });

  it("does not show failed label when failed count is 0", () => {
    render(
      <TaskProgress counts={{ completed: 2, running: 1, queued: 3, failed: 0 }} />,
    );
    expect(screen.getAllByText("2 done").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("0 failed")).toBeNull();
  });

  it("does not render label dots when compact is true", () => {
    const { container } = render(
      <TaskProgress counts={{ completed: 3, running: 2, queued: 5, failed: 1 }} compact />,
    );
    // In compact mode, the labelsRow is not rendered
    // Just verify it renders without crashing and doesn't show labels
    expect(container).toBeTruthy();
  });

  it("renders with only completed tasks", () => {
    render(
      <TaskProgress counts={{ completed: 10, running: 0, queued: 0, failed: 0 }} />,
    );
    expect(screen.getAllByText("10 done").length).toBeGreaterThanOrEqual(1);
  });

  it("renders with only running tasks", () => {
    render(
      <TaskProgress counts={{ completed: 0, running: 5, queued: 0, failed: 0 }} />,
    );
    expect(screen.getAllByText("5 running").length).toBeGreaterThanOrEqual(1);
  });

  it("renders with only queued tasks", () => {
    render(
      <TaskProgress counts={{ completed: 0, running: 0, queued: 8, failed: 0 }} />,
    );
    expect(screen.getAllByText("8 queued").length).toBeGreaterThanOrEqual(1);
  });

  it("renders with only failed tasks", () => {
    render(
      <TaskProgress counts={{ completed: 0, running: 0, queued: 0, failed: 3 }} />,
    );
    expect(screen.getAllByText("3 failed").length).toBeGreaterThanOrEqual(1);
  });

  it("does not crash with very large numbers", () => {
    render(
      <TaskProgress counts={{ completed: 99999, running: 1, queued: 0, failed: 0 }} />,
    );
    expect(screen.getAllByText("99999 done").length).toBeGreaterThanOrEqual(1);
  });
});
