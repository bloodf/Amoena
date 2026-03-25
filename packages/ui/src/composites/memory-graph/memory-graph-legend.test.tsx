import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { MemoryGraphLegend } from "./MemoryGraphLegend";

const sourceColors = {
  auto: "#3B82F6",
  manual: "#22C55E",
  agent: "#A855F7",
};

describe("MemoryGraphLegend", () => {
  test("renders all source labels", () => {
    render(<MemoryGraphLegend sourceColors={sourceColors} />);
    expect(screen.getByText("auto")).toBeTruthy();
    expect(screen.getByText("manual")).toBeTruthy();
    expect(screen.getByText("agent")).toBeTruthy();
  });

  test("renders color indicators for each source", () => {
    const { container } = render(<MemoryGraphLegend sourceColors={sourceColors} />);
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots.length).toBe(3);
  });

  test("applies correct background color to dots", () => {
    const { container } = render(<MemoryGraphLegend sourceColors={sourceColors} />);
    const dots = container.querySelectorAll(".rounded-full");
    expect((dots[0] as HTMLElement).style.backgroundColor).toBeTruthy();
  });

  test("renders empty when no sources", () => {
    const { container } = render(<MemoryGraphLegend sourceColors={{}} />);
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots.length).toBe(0);
  });
});
