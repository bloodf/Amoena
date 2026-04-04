import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  test("renders without crashing", () => {
    render(<Switch aria-label="Toggle" />);
    expect(screen.getByRole("switch")).not.toBeNull();
  });

  test("is unchecked by default", () => {
    render(<Switch aria-label="Theme" />);
    const sw = screen.getByRole("switch");
    expect(sw.getAttribute("data-state")).toBe("unchecked");
  });

  test("toggles on click", () => {
    render(<Switch aria-label="Toggle" />);
    const sw = screen.getByRole("switch");
    fireEvent.click(sw);
    expect(sw.getAttribute("data-state")).toBe("checked");
  });

  test("supports disabled state", () => {
    render(<Switch aria-label="Disabled" disabled />);
    const sw = screen.getByRole("switch");
    expect(sw.getAttribute("disabled")).not.toBeNull();
    expect(sw.className).toContain("disabled:opacity-50");
  });

  test("applies custom className", () => {
    render(<Switch aria-label="Custom" className="bg-green-500" />);
    const sw = screen.getByRole("switch");
    expect(sw.className).toContain("bg-green-500");
  });

  test("calls onCheckedChange when toggled", () => {
    let value: boolean | undefined;
    render(<Switch aria-label="Callback" onCheckedChange={(v) => (value = v)} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(value).toBe(true);
  });

  test("renders as checked when defaultChecked", () => {
    render(<Switch aria-label="Default on" defaultChecked />);
    expect(screen.getByRole("switch").getAttribute("data-state")).toBe("checked");
  });

  test("does not toggle when disabled", () => {
    render(<Switch aria-label="Disabled toggle" disabled />);
    const sw = screen.getByRole("switch");
    fireEvent.click(sw);
    expect(sw.getAttribute("data-state")).toBe("unchecked");
  });

  test("can toggle back to unchecked", () => {
    render(<Switch aria-label="Re-toggle" />);
    const sw = screen.getByRole("switch");
    fireEvent.click(sw);
    expect(sw.getAttribute("data-state")).toBe("checked");
    fireEvent.click(sw);
    expect(sw.getAttribute("data-state")).toBe("unchecked");
  });

  test("supports aria-required", () => {
    render(<Switch aria-label="Required" aria-required="true" />);
    expect(screen.getByRole("switch").getAttribute("aria-required")).toBe("true");
  });

  test("supports aria-invalid", () => {
    render(<Switch aria-label="Invalid" aria-invalid="true" />);
    expect(screen.getByRole("switch").getAttribute("aria-invalid")).toBe("true");
  });

  test("has focus-visible ring class", () => {
    render(<Switch aria-label="Focus" />);
    expect(screen.getByRole("switch").className).toContain("focus-visible:ring-2");
  });

  test("fires callback with false when toggling off", () => {
    let value: boolean | undefined;
    render(<Switch aria-label="Off callback" defaultChecked onCheckedChange={(v) => (value = v)} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(value).toBe(false);
  });
});
