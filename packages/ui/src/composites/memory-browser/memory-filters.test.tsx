import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { MemoryFilters } from "./MemoryFilters";

function makeProps(overrides: Partial<Parameters<typeof MemoryFilters>[0]> = {}) {
  return {
    searchQuery: "",
    filterType: "all",
    filterSource: "all",
    filterScope: "all",
    onSearchChange: mock((_v: string) => {}),
    onTypeChange: mock((_v: string) => {}),
    onSourceChange: mock((_v: string) => {}),
    onScopeChange: mock((_v: string) => {}),
    ...overrides,
  };
}

describe("MemoryFilters", () => {
  test("renders search input", () => {
    render(<MemoryFilters {...makeProps()} />);
    expect(screen.getByPlaceholderText("Search memory...")).toBeTruthy();
  });

  test("calls onSearchChange when typing", () => {
    const onSearchChange = mock((_v: string) => {});
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
