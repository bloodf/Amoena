import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { TaskBoardHeader } from "./TaskBoardHeader";

describe("TaskBoardHeader", () => {
  test("renders Task Board title", () => {
    render(<TaskBoardHeader />);
    expect(screen.getByText("Task Board")).toBeTruthy();
  });

  test("renders New Task button", () => {
    render(<TaskBoardHeader />);
    expect(screen.getByText("New Task")).toBeTruthy();
  });
});
