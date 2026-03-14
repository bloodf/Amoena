import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, mock } from "bun:test";
import { SearchField } from "./search-field";

describe("SearchField", () => {
  test("renders with placeholder", () => {
    render(<SearchField value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("Search…")).not.toBeNull();
  });

  test("renders custom placeholder", () => {
    render(<SearchField value="" onChange={() => {}} placeholder="Filter…" />);
    expect(screen.getByPlaceholderText("Filter…")).not.toBeNull();
  });

  test("calls onChange when typing", () => {
    const handleChange = mock(() => {});
    render(<SearchField value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText("Search…");
    fireEvent.change(input, { target: { value: "hello" } });
    expect(handleChange).toHaveBeenCalledWith("hello");
  });

  test("shows clear button when value is present", () => {
    render(<SearchField value="test" onChange={() => {}} />);
    expect(screen.getByLabelText("Clear search")).not.toBeNull();
  });

  test("hides clear button when value is empty", () => {
    render(<SearchField value="" onChange={() => {}} />);
    expect(screen.queryByLabelText("Clear search")).toBeNull();
  });

  test("clear button calls onChange with empty string", () => {
    const handleChange = mock(() => {});
    render(<SearchField value="test" onChange={handleChange} />);
    fireEvent.click(screen.getByLabelText("Clear search"));
    expect(handleChange).toHaveBeenCalledWith("");
  });

  test("clear button calls onClear when provided", () => {
    const handleClear = mock(() => {});
    render(<SearchField value="test" onChange={() => {}} onClear={handleClear} />);
    fireEvent.click(screen.getByLabelText("Clear search"));
    expect(handleClear).toHaveBeenCalled();
  });

  test("input has search role or type", () => {
    render(<SearchField value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText("Search…");
    expect(input.tagName).toBe("INPUT");
  });

  test("applies custom className", () => {
    const { container } = render(<SearchField value="" onChange={() => {}} className="w-96" />);
    expect((container.firstChild as HTMLElement).className).toContain("w-96");
  });

  test("clear button has type button to prevent form submission", () => {
    render(<SearchField value="test" onChange={() => {}} />);
    const clearBtn = screen.getByLabelText("Clear search");
    expect(clearBtn.getAttribute("type")).toBe("button");
  });

  test("renders search icon", () => {
    const { container } = render(<SearchField value="" onChange={() => {}} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  test("input has correct padding for icon", () => {
    render(<SearchField value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText("Search…");
    expect(input.className).toContain("pl-9");
  });

  test("empty value does not render clear button", () => {
    render(<SearchField value="" onChange={() => {}} />);
    expect(screen.queryByLabelText("Clear search")).toBeNull();
  });

  test("whitespace value shows clear button", () => {
    render(<SearchField value=" " onChange={() => {}} />);
    expect(screen.getByLabelText("Clear search")).toBeDefined();
  });
});
