import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Slider } from "./slider";

describe("Slider", () => {
  test("renders without crashing", () => {
    render(<Slider aria-label="Volume" defaultValue={[50]} />);
    expect(screen.getByRole("slider")).not.toBeNull();
  });

  test("renders with default value", () => {
    render(<Slider aria-label="Volume" defaultValue={[25]} />);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-valuenow")).toBe("25");
  });

  test("respects min and max", () => {
    render(<Slider aria-label="Range" defaultValue={[5]} min={0} max={10} />);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-valuemin")).toBe("0");
    expect(slider.getAttribute("aria-valuemax")).toBe("10");
  });

  test("supports disabled state", () => {
    render(<Slider aria-label="Disabled" defaultValue={[50]} disabled />);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("data-disabled")).not.toBeNull();
  });

  test("applies custom className", () => {
    const { container } = render(<Slider aria-label="Custom" defaultValue={[50]} className="w-64" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("w-64");
  });

  test("applies base classes", () => {
    const { container } = render(<Slider aria-label="Base" defaultValue={[50]} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("flex");
    expect(root.className).toContain("touch-none");
  });

  test("has aria-orientation horizontal by default", () => {
    render(<Slider aria-label="Orientation" defaultValue={[50]} />);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-orientation")).toBe("horizontal");
  });

  test("has aria-valuenow matching value", () => {
    render(<Slider aria-label="Value" defaultValue={[75]} />);
    expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("75");
  });

  test("default min is 0 and max is 100", () => {
    render(<Slider aria-label="Defaults" defaultValue={[50]} />);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("aria-valuemin")).toBe("0");
    expect(slider.getAttribute("aria-valuemax")).toBe("100");
  });

  test("has focus-visible ring class on thumb", () => {
    render(<Slider aria-label="Focus" defaultValue={[50]} />);
    const slider = screen.getByRole("slider");
    expect(slider.className).toContain("focus-visible:ring");
  });

  test("disabled slider cannot be interacted with", () => {
    render(<Slider aria-label="Disabled interaction" defaultValue={[50]} disabled />);
    const slider = screen.getByRole("slider");
    expect(slider.getAttribute("data-disabled")).not.toBeNull();
  });
});
