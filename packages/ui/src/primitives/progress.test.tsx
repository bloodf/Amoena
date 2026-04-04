import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Progress } from "./progress";

describe("Progress", () => {
  test("renders without crashing", () => {
    render(<Progress aria-label="Loading" value={0} />);
    expect(screen.getByRole("progressbar")).not.toBeNull();
  });

  test("renders progressbar role", () => {
    render(<Progress aria-label="Upload" value={75} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toBeNull();
    expect(bar.getAttribute("data-state")).not.toBeNull();
  });

  test("sets indicator transform based on value", () => {
    const { container } = render(<Progress aria-label="Download" value={60} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator).not.toBeNull();
    expect(indicator.style.transform).toBe("translateX(-40%)");
  });

  test("handles zero value", () => {
    const { container } = render(<Progress aria-label="Empty" value={0} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator).not.toBeNull();
    expect(indicator.style.transform).toBe("translateX(-100%)");
  });

  test("handles full value", () => {
    const { container } = render(<Progress aria-label="Full" value={100} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator).not.toBeNull();
    expect(indicator.style.transform).toBe("translateX(-0%)");
  });

  test("applies base classes", () => {
    const { container } = render(<Progress aria-label="Styled" value={50} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("rounded-full");
    expect(root.className).toContain("bg-secondary");
  });

  test("applies custom className", () => {
    const { container } = render(<Progress aria-label="Custom" value={50} className="h-2" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("h-2");
  });

  test("tracks value via indicator transform", () => {
    const { container } = render(<Progress aria-label="Value" value={42} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator.style.transform).toBe("translateX(-58%)");
  });

  test("has aria-valuemin of 0", () => {
    render(<Progress aria-label="Min" value={50} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
  });

  test("has aria-valuemax of 100", () => {
    render(<Progress aria-label="Max" value={50} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  test("null value renders indeterminate state", () => {
    render(<Progress aria-label="Indeterminate" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBeNull();
  });

  test("clamps transform at zero value", () => {
    const { container } = render(<Progress aria-label="Zero" value={0} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator.style.transform).toBe("translateX(-100%)");
  });

  test("clamps transform at full value", () => {
    const { container } = render(<Progress aria-label="Full" value={100} />);
    const indicator = container.querySelector("[style]") as HTMLElement;
    expect(indicator.style.transform).toBe("translateX(-0%)");
  });

  test("renders accessible label", () => {
    render(<Progress aria-label="Upload progress" value={60} />);
    expect(screen.getByLabelText("Upload progress")).toBeDefined();
  });
});
