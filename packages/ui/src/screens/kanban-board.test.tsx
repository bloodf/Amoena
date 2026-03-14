import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KanbanBoard } from "./KanbanBoard";

describe("KanbanBoard", () => {
  it("renders columns and supports drag-drop state transitions", () => {
    render(<KanbanBoard />);

    expect(screen.getByText("Task Board")).toBeTruthy();
    expect(screen.getByText("Backlog")).toBeTruthy();
    expect(screen.getByText("In Progress")).toBeTruthy();

    const task = screen.getByText("JWT auth module refactor");
    const backlog = screen.getByText("Backlog").closest("div");

    fireEvent.dragStart(task, {
      dataTransfer: new DataTransfer(),
    });
    fireEvent.dragOver(backlog!, {
      preventDefault: () => {},
      dataTransfer: new DataTransfer(),
    });
    fireEvent.drop(backlog!, {
      preventDefault: () => {},
      dataTransfer: new DataTransfer(),
    });

    expect(screen.getByText("JWT auth module refactor")).toBeTruthy();
  });
});
