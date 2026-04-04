import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { MemoryFilters } from "./MemoryFilters";

function makeProps(overrides: Partial<Parameters<typeof MemoryFilters>[0]> = {}) {
  return {
    searchQuery: "",
    filterType: "all",
    filterSource: "all",
    filterScope: "all",
    onSearchChange: vi.fn((_v: string) => {}),
    onTypeChange: vi.fn((_v: string) => {}),
    onSourceChange: vi.fn((_v: string) => {}),
    onScopeChange: vi.fn((_v: string) => {}),
    ...overrides,
  };
}

describe("MemoryFilters", () => {
  test("renders search input", () => {
    render(<MemoryFilters {...makeProps()} />);
    expect(screen.getByPlaceholderText("Search memory...")).toBeTruthy();
  });

  test("calls onSearchChange when typing", () => {
    const onSearchChange = vi.fn((_v: string) => {});
    render(<MemoryFilters {...makeProps({ onSearchChange })} />);
    fireEvent.change(screen.getByPlaceholderText("Search memory..."), { target: { value: "jwt" } });
    expect(onSearchChange).toHaveBeenCalledWith("jwt");
  });

  test("displays current search query", () => {
    render(<MemoryFilters {...makeProps({ searchQuery: "auth" })} />);
    const input = screen.getByPlaceholderText("Search memory...") as HTMLInputElement;
    expect(input.value).toBe("auth");
  });

  test("renders type, source, and scope filter dropdowns", () => {
    const { container } = render(<MemoryFilters {...makeProps()} />);
    // There should be 3 select triggers for filters
    const triggers = container.querySelectorAll("button");
    expect(triggers.length).toBeGreaterThanOrEqual(3);
  });
});
