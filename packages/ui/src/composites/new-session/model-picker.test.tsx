import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { ModelPicker } from "./ModelPicker";

const models = ["claude-4-sonnet", "gpt-5", "gemini-2.5-pro"];

describe("ModelPicker", () => {
  test("renders all model options", () => {
    render(<ModelPicker models={models} selectedModel="claude-4-sonnet" onSelect={mock(() => {})} />);
    expect(screen.getByText("claude-4-sonnet")).toBeTruthy();
    expect(screen.getByText("gpt-5")).toBeTruthy();
    expect(screen.getByText("gemini-2.5-pro")).toBeTruthy();
  });

  test("highlights selected model with primary border", () => {
    render(<ModelPicker models={models} selectedModel="gpt-5" onSelect={mock(() => {})} />);
    const gptBtn = screen.getByText("gpt-5");
    expect(gptBtn.className).toContain("border-primary");
  });

  test("non-selected models have default border", () => {
    render(<ModelPicker models={models} selectedModel="gpt-5" onSelect={mock(() => {})} />);
    const claudeBtn = screen.getByText("claude-4-sonnet");
    expect(claudeBtn.className).toContain("border-border");
  });

  test("calls onSelect when model clicked", () => {
    const onSelect = mock((_model: string) => {});
    render(<ModelPicker models={models} selectedModel="claude-4-sonnet" onSelect={onSelect} />);
    fireEvent.click(screen.getByText("gemini-2.5-pro"));
    expect(onSelect).toHaveBeenCalledWith("gemini-2.5-pro");
  });

  test("renders empty when no models", () => {
    const { container } = render(<ModelPicker models={[]} selectedModel="" onSelect={mock(() => {})} />);
    expect(container.querySelector("button")).toBeNull();
  });
});
