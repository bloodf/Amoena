import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  test("renders without crashing", () => {
    render(<Checkbox aria-label="Accept terms" />);
    expect(screen.getByRole("checkbox")).not.toBeNull();
  });

  test("is unchecked by default", () => {
    render(<Checkbox aria-label="Accept" />);
    const cb = screen.getByRole("checkbox");
    expect(cb.getAttribute("data-state")).toBe("unchecked");
  });

  test("toggles on click", () => {
    render(<Checkbox aria-label="Toggle" />);
    const cb = screen.getByRole("checkbox");
    fireEvent.click(cb);
    expect(cb.getAttribute("data-state")).toBe("checked");
  });

  test("supports disabled state", () => {
    render(<Checkbox aria-label="Disabled" disabled />);
    const cb = screen.getByRole("checkbox");
    expect(cb.getAttribute("disabled")).not.toBeNull();
    expect(cb.className).toContain("disabled:opacity-50");
  });

  test("applies custom className", () => {
    render(<Checkbox aria-label="Custom" className="border-red-500" />);
    const cb = screen.getByRole("checkbox");
    expect(cb.className).toContain("border-red-500");
  });

  test("calls onCheckedChange when toggled", () => {
    let changed = false;
    render(<Checkbox aria-label="Change" onCheckedChange={() => (changed = true)} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(changed).toBe(true);
  });

  test("renders as checked when defaultChecked", () => {
    render(<Checkbox aria-label="Default checked" defaultChecked />);
    expect(screen.getByRole("checkbox").getAttribute("data-state")).toBe("checked");
  });

  test("does not toggle when disabled", () => {
    render(<Checkbox aria-label="Disabled toggle" disabled />);
    const cb = screen.getByRole("checkbox");
    fireEvent.click(cb);
    expect(cb.getAttribute("data-state")).toBe("unchecked");
  });

  test("supports aria-required", () => {
    render(<Checkbox aria-label="Required" aria-required="true" />);
    expect(screen.getByRole("checkbox").getAttribute("aria-required")).toBe("true");
  });

  test("supports aria-invalid", () => {
    render(<Checkbox aria-label="Invalid" aria-invalid="true" />);
    expect(screen.getByRole("checkbox").getAttribute("aria-invalid")).toBe("true");
  });

  test("can toggle back to unchecked", () => {
    render(<Checkbox aria-label="Re-toggle" />);
    const cb = screen.getByRole("checkbox");
    fireEvent.click(cb);
    expect(cb.getAttribute("data-state")).toBe("checked");
    fireEvent.click(cb);
    expect(cb.getAttribute("data-state")).toBe("unchecked");
  });

  test("has focus-visible ring class", () => {
    render(<Checkbox aria-label="Focus" />);
    expect(screen.getByRole("checkbox").className).toContain("focus-visible:ring-2");
  });

  test("applies base border class", () => {
    render(<Checkbox aria-label="Border" />);
    expect(screen.getByRole("checkbox").className).toContain("border");
    expect(screen.getByRole("checkbox").className).toContain("border-primary");
  });
});
