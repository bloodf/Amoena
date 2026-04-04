import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { CommandPaletteSearch } from "./CommandPaletteSearch";

function makeProps(overrides: Partial<Parameters<typeof CommandPaletteSearch>[0]> = {}) {
  return {
    query: "",
    onQueryChange: vi.fn((_v: string) => {}),
    inputRef: { current: null },
    ...overrides,
  };
}

describe("CommandPaletteSearch", () => {
  test("renders search input with placeholder", () => {
    render(<CommandPaletteSearch {...makeProps()} />);
    const input = screen.getByPlaceholderText(/Search commands/);
    expect(input).toBeTruthy();
  });

  test("displays current query value", () => {
    render(<CommandPaletteSearch {...makeProps({ query: "hello" })} />);
    const input = screen.getByPlaceholderText(/Search commands/) as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  test("calls onQueryChange when input changes", () => {
    const onQueryChange = vi.fn((_v: string) => {});
    render(<CommandPaletteSearch {...makeProps({ onQueryChange })} />);
    const input = screen.getByPlaceholderText(/Search commands/);
    fireEvent.change(input, { target: { value: "test" } });
    expect(onQueryChange).toHaveBeenCalledWith("test");
  });

  test("renders ESC keyboard hint", () => {
    render(<CommandPaletteSearch {...makeProps()} />);
    expect(screen.getByText("ESC")).toBeTruthy();
  });

  test("sets inputRef to the input element", () => {
    const inputRef = { current: null as HTMLInputElement | null };
    render(<CommandPaletteSearch {...makeProps({ inputRef })} />);
    expect(inputRef.current).toBeTruthy();
    expect(inputRef.current?.tagName).toBe("INPUT");
  });
});
