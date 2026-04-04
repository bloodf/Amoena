import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Toggle } from "./toggle";

describe("Toggle", () => {
  test("renders without crashing", () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    expect(screen.getByText("B")).not.toBeNull();
  });

  test("has button role", () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    expect(screen.getByRole("button")).not.toBeNull();
  });

  test("is unpressed by default", () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    expect(screen.getByRole("button").getAttribute("data-state")).toBe("off");
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("false");
  });

  test("toggles pressed state on click", () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(btn.getAttribute("data-state")).toBe("on");
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  test("applies default variant class", () => {
    render(<Toggle aria-label="Default">D</Toggle>);
    expect(screen.getByRole("button").className).toContain("bg-transparent");
  });

  test("applies outline variant class", () => {
    render(
      <Toggle aria-label="Outline" variant="outline">
        O
      </Toggle>,
    );
    expect(screen.getByRole("button").className).toContain("border");
    expect(screen.getByRole("button").className).toContain("border-input");
  });

  test("applies size sm class", () => {
    render(
      <Toggle aria-label="Small" size="sm">
        S
      </Toggle>,
    );
    expect(screen.getByRole("button").className).toContain("h-9");
  });

  test("applies size lg class", () => {
    render(
      <Toggle aria-label="Large" size="lg">
        L
      </Toggle>,
    );
    expect(screen.getByRole("button").className).toContain("h-11");
  });

  test("supports disabled state", () => {
    render(
      <Toggle aria-label="Disabled" disabled>
        X
      </Toggle>,
    );
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("disabled")).not.toBeNull();
    expect(btn.className).toContain("disabled:opacity-50");
  });

  test("calls onPressedChange when toggled", () => {
    let pressed: boolean | undefined;
    render(
      <Toggle aria-label="Callback" onPressedChange={(v) => (pressed = v)}>
        C
      </Toggle>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(pressed).toBe(true);
  });

  test("does not toggle when disabled", () => {
    render(
      <Toggle aria-label="No toggle" disabled>
        N
      </Toggle>,
    );
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(btn.getAttribute("data-state")).toBe("off");
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  test("applies custom className", () => {
    render(
      <Toggle aria-label="Custom" className="bg-red-500">
        R
      </Toggle>,
    );
    expect(screen.getByRole("button").className).toContain("bg-red-500");
  });

  test("supports controlled pressed prop", () => {
    render(
      <Toggle aria-label="Controlled" pressed>
        On
      </Toggle>,
    );
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button").getAttribute("data-state")).toBe("on");
  });

  test("has focus-visible ring class", () => {
    render(<Toggle aria-label="Focus">F</Toggle>);
    expect(screen.getByRole("button").className).toContain("focus-visible:ring-2");
  });

  test("toggle off fires callback with false", () => {
    let pressed: boolean | undefined;
    render(
      <Toggle aria-label="Off" defaultPressed onPressedChange={(v) => (pressed = v)}>
        T
      </Toggle>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(pressed).toBe(false);
  });
});
