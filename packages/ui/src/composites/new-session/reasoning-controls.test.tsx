import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { ReasoningControls } from "./ReasoningControls";

const depths = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Med" },
  { id: "high", label: "High" },
];

function makeProps(overrides: Partial<Parameters<typeof ReasoningControls>[0]> = {}) {
  return {
    mode: "auto",
    depth: "medium",
    depths,
    onModeChange: vi.fn((_v: string) => {}),
    onDepthChange: vi.fn((_v: string) => {}),
    ...overrides,
  };
}

describe("ReasoningControls", () => {
  test("renders mode select", () => {
    const { container } = render(<ReasoningControls {...makeProps()} />);
    const select = container.querySelector("select")!;
    expect(select.value).toBe("auto");
  });

  test("renders all depth buttons", () => {
    render(<ReasoningControls {...makeProps()} />);
    expect(screen.getByText("Low")).toBeTruthy();
    expect(screen.getByText("Med")).toBeTruthy();
    expect(screen.getByText("High")).toBeTruthy();
  });

  test("highlights active depth", () => {
    render(<ReasoningControls {...makeProps({ depth: "medium" })} />);
    const medBtn = screen.getByText("Med");
    expect(medBtn.className).toContain("border-primary");
  });

  test("calls onModeChange when select changes", () => {
    const onModeChange = vi.fn((_v: string) => {});
    const { container } = render(<ReasoningControls {...makeProps({ onModeChange })} />);
    fireEvent.change(container.querySelector("select")!, { target: { value: "always" } });
    expect(onModeChange).toHaveBeenCalledWith("always");
  });

  test("calls onDepthChange when depth button clicked", () => {
    const onDepthChange = vi.fn((_v: string) => {});
    render(<ReasoningControls {...makeProps({ onDepthChange })} />);
    fireEvent.click(screen.getByText("High"));
    expect(onDepthChange).toHaveBeenCalledWith("high");
  });
});
