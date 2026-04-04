import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { SessionOptionGrid } from "./SessionOptionGrid";
import { Monitor, Cloud, GitBranch } from "lucide-react";

const options = [
  { id: "local", label: "Local", desc: "Run locally", icon: Monitor },
  { id: "cloud", label: "Cloud", desc: "Run in cloud", icon: Cloud },
  { id: "worktree", label: "Worktree", desc: "Run in worktree", icon: GitBranch },
];

describe("SessionOptionGrid", () => {
  test("renders all option labels", () => {
    render(<SessionOptionGrid options={options} selected="local" onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("Local")).toBeTruthy();
    expect(screen.getByText("Cloud")).toBeTruthy();
    expect(screen.getByText("Worktree")).toBeTruthy();
  });

  test("renders descriptions", () => {
    render(<SessionOptionGrid options={options} selected="local" onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("Run locally")).toBeTruthy();
    expect(screen.getByText("Run in cloud")).toBeTruthy();
  });

  test("highlights selected option with primary border", () => {
    render(<SessionOptionGrid options={options} selected="cloud" onSelect={vi.fn(() => {})} />);
    const cloudBtn = screen.getByText("Cloud").closest("button")!;
    expect(cloudBtn.className).toContain("border-primary");
  });

  test("non-selected options have default border", () => {
    render(<SessionOptionGrid options={options} selected="cloud" onSelect={vi.fn(() => {})} />);
    const localBtn = screen.getByText("Local").closest("button")!;
    expect(localBtn.className).toContain("border-border");
  });

  test("calls onSelect with option id when clicked", () => {
    const onSelect = vi.fn((_id: string) => {});
    render(<SessionOptionGrid options={options} selected="local" onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Worktree"));
    expect(onSelect).toHaveBeenCalledWith("worktree");
  });

  test("applies custom columns class", () => {
    const { container } = render(<SessionOptionGrid options={options} selected="local" columns="grid-cols-2" onSelect={vi.fn(() => {})} />);
    expect((container.firstChild as HTMLElement).className).toContain("grid-cols-2");
  });
});
