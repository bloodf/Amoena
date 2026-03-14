import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { SearchField, ToolbarGroup, FilterGroup, CompactSelect, ViewModeToggle } from "./control-bar";

describe("SearchField", () => {
  test("renders input with placeholder", () => {
    render(<SearchField value="" onChange={() => {}} placeholder="Search..." />);
    expect(screen.getByPlaceholderText("Search...")).not.toBeNull();
  });

  test("displays current value", () => {
    render(<SearchField value="hello" onChange={() => {}} placeholder="Search..." />);
    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  test("shows clear button when value and onClear provided", () => {
    render(<SearchField value="test" onChange={() => {}} placeholder="Search..." onClear={() => {}} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  test("hides clear button when value is empty", () => {
    const { container } = render(<SearchField value="" onChange={() => {}} placeholder="Search..." onClear={() => {}} />);
    const clearButton = container.querySelector("button");
    expect(clearButton).toBeNull();
  });
});

describe("ToolbarGroup", () => {
  test("renders children", () => {
    render(<ToolbarGroup>toolbar content</ToolbarGroup>);
    expect(screen.getByText("toolbar content")).not.toBeNull();
  });

  test("applies flex layout", () => {
    render(<ToolbarGroup>inner</ToolbarGroup>);
    expect(screen.getByText("inner").className).toContain("flex");
  });
});

describe("FilterGroup", () => {
  test("renders label and children", () => {
    render(
      <FilterGroup label="Sort:">
        <span>options</span>
      </FilterGroup>,
    );
    expect(screen.getByText("Sort:")).not.toBeNull();
    expect(screen.getByText("options")).not.toBeNull();
  });
});

describe("CompactSelect", () => {
  test("renders select with options", () => {
    render(
      <CompactSelect value="a" onChange={() => {}}>
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </CompactSelect>,
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("a");
    expect(screen.getByText("Alpha")).not.toBeNull();
    expect(screen.getByText("Beta")).not.toBeNull();
  });
});

describe("ViewModeToggle", () => {
  test("renders all options as buttons", () => {
    render(
      <ViewModeToggle
        options={[
          { id: "grid", icon: <span>G</span>, label: "Grid" },
          { id: "list", icon: <span>L</span>, label: "List" },
        ]}
        value="grid"
        onChange={() => {}}
      />,
    );
    expect(screen.getByTitle("Grid")).not.toBeNull();
    expect(screen.getByTitle("List")).not.toBeNull();
  });

  test("applies active variant to selected option", () => {
    render(
      <ViewModeToggle
        options={[
          { id: "grid", icon: <span>G</span>, label: "Grid" },
          { id: "list", icon: <span>L</span>, label: "List" },
        ]}
        value="grid"
        onChange={() => {}}
      />,
    );
    const activeButton = screen.getByTitle("Grid");
    const inactiveButton = screen.getByTitle("List");
    expect(activeButton.className).toContain("shadow-sm");
    expect(inactiveButton.className).toContain("text-muted-foreground");
  });
});

describe("SearchField — keyboard behavior", () => {
  test("input is focusable and responds to typing", () => {
    let value = "";
    render(<SearchField value={value} onChange={(val) => { value = val; }} placeholder="Search..." />);
    const input = screen.getByPlaceholderText("Search...");
    input.focus();
    expect(document.activeElement).toBe(input);
    fireEvent.change(input, { target: { value: "hello" } });
    expect(value).toBe("hello");
  });

  test("clear button calls onClear", () => {
    let cleared = false;
    render(<SearchField value="test" onChange={() => {}} placeholder="Search..." onClear={() => { cleared = true; }} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(cleared).toBe(true);
  });
});

describe("CompactSelect — state management", () => {
  test("select value changes on user interaction", () => {
    let value = "a";
    render(
      <CompactSelect value={value} onChange={(val) => { value = val; }}>
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </CompactSelect>,
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "b" } });
    expect(value).toBe("b");
  });
});

describe("ViewModeToggle — keyboard interaction", () => {
  test("clicking a toggle option calls onChange with id", () => {
    let selected = "grid";
    render(
      <ViewModeToggle
        options={[
          { id: "grid", icon: <span>G</span>, label: "Grid" },
          { id: "list", icon: <span>L</span>, label: "List" },
        ]}
        value={selected}
        onChange={(id) => { selected = id; }}
      />,
    );
    fireEvent.click(screen.getByTitle("List"));
    expect(selected).toBe("list");
  });
});
