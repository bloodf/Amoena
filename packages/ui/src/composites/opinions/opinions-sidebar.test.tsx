import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { OpinionsSidebar } from "./OpinionsSidebar";

const categories = [
  { name: "Code Style", opinions: [{ title: "Indent", desc: "Spaces vs tabs", value: "spaces", scope: "global" as const }] },
  { name: "Architecture", opinions: [] },
];

describe("OpinionsSidebar", () => {
  test("renders Categories heading", () => {
    render(<OpinionsSidebar categories={categories} selectedCategory={0} onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("Categories")).toBeTruthy();
  });

  test("renders category names", () => {
    render(<OpinionsSidebar categories={categories} selectedCategory={0} onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("Code Style")).toBeTruthy();
    expect(screen.getByText("Architecture")).toBeTruthy();
  });

  test("renders opinion count per category", () => {
    render(<OpinionsSidebar categories={categories} selectedCategory={0} onSelect={vi.fn(() => {})} />);
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
  });

  test("calls onSelect with index when category clicked", () => {
    const onSelect = vi.fn((_i: number) => {});
    render(<OpinionsSidebar categories={categories} selectedCategory={0} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Architecture"));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
