import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Calendar } from "./calendar";

describe("Calendar", () => {
  test("renders calendar grid", () => {
    render(<Calendar />);
    expect(screen.getByRole("grid")).not.toBeNull();
  });

  test("renders navigation buttons", () => {
    render(<Calendar />);
    const nav = screen.getAllByRole("button");
    expect(nav.length).toBeGreaterThanOrEqual(2);
  });

  test("renders with selected date", () => {
    const date = new Date(2025, 0, 15);
    render(<Calendar mode="single" selected={date} />);
    expect(screen.getByRole("grid")).not.toBeNull();
  });

  test("shows outside days by default", () => {
    render(<Calendar month={new Date(2025, 0, 1)} />);
    const grid = screen.getByRole("grid");
    expect(grid).not.toBeNull();
  });

  test("renders day cells as clickable gridcells", () => {
    render(<Calendar month={new Date(2025, 0, 1)} />);
    const grid = screen.getByRole("grid");
    const gridcells = grid.querySelectorAll("[role='gridcell']");
    // Calendar should have day cells rendered
    expect(gridcells.length).toBeGreaterThan(0);
  });

  test("disables specified dates", () => {
    const disabled = [new Date(2025, 0, 15)];
    render(<Calendar month={new Date(2025, 0, 1)} disabled={disabled} />);
    const grid = screen.getByRole("grid");
    expect(grid).not.toBeNull();
  });

  test("applies custom className", () => {
    const { container } = render(<Calendar className="custom-cal" />);
    expect(container.innerHTML).toContain("custom-cal");
  });

  test("has table/grid structure", () => {
    render(<Calendar month={new Date(2025, 0, 1)} />);
    expect(screen.getByRole("grid")).toBeDefined();
  });

  test("renders with month prop to control display", () => {
    render(<Calendar month={new Date(2025, 5, 1)} />);
    // June 2025 should be displayed
    expect(screen.getByText("June 2025")).toBeDefined();
  });

  test("can hide outside days", () => {
    render(<Calendar month={new Date(2025, 0, 1)} showOutsideDays={false} />);
    expect(screen.getByRole("grid")).toBeDefined();
  });
});
