import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

describe("ToggleGroup", () => {
  test("renders without crashing", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByText("A")).not.toBeNull();
    expect(screen.getByText("B")).not.toBeNull();
  });

  test("renders items as buttons", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="x">X</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole("radio")).not.toBeNull();
  });

  test("selects item on click in single mode", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByText("A"));
    expect(screen.getByText("A").closest("[data-state]")?.getAttribute("data-state")).toBe("on");
    expect(screen.getByText("B").closest("[data-state]")?.getAttribute("data-state")).toBe("off");
  });

  test("supports multiple selection", () => {
    render(
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("B"));
    expect(screen.getByText("A").closest("[data-state]")?.getAttribute("data-state")).toBe("on");
    expect(screen.getByText("B").closest("[data-state]")?.getAttribute("data-state")).toBe("on");
  });

  test("applies variant from group context", () => {
    render(
      <ToggleGroup type="single" variant="outline">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const item = screen.getByText("A").closest("[data-state]") as HTMLElement;
    expect(item.className).toContain("border");
    expect(item.className).toContain("border-input");
  });

  test("applies size from group context", () => {
    render(
      <ToggleGroup type="single" size="sm">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const item = screen.getByText("A").closest("[data-state]") as HTMLElement;
    expect(item.className).toContain("h-9");
  });

  test("applies base flex classes to root", () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("flex");
    expect(root.className).toContain("gap-1");
  });

  test("calls onValueChange when selection changes", () => {
    let value: string | undefined;
    render(
      <ToggleGroup type="single" onValueChange={(v) => (value = v)}>
        <ToggleGroupItem value="picked">Pick</ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByText("Pick"));
    expect(value).toBe("picked");
  });

  test("single mode deselects previously selected item", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("B"));
    expect(screen.getByText("A").closest("[data-state]")?.getAttribute("data-state")).toBe("off");
    expect(screen.getByText("B").closest("[data-state]")?.getAttribute("data-state")).toBe("on");
  });

  test("multiple mode allows deselection", () => {
    render(
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByText("A"));
    expect(screen.getByText("A").closest("[data-state]")?.getAttribute("data-state")).toBe("on");
    fireEvent.click(screen.getByText("A"));
    expect(screen.getByText("A").closest("[data-state]")?.getAttribute("data-state")).toBe("off");
  });

  test("applies size lg from group context", () => {
    render(
      <ToggleGroup type="single" size="lg">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const item = screen.getByText("A").closest("[data-state]") as HTMLElement;
    expect(item.className).toContain("h-11");
  });

  test("disabled item cannot be selected", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a" disabled>A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const item = screen.getByText("A").closest("[data-state]") as HTMLElement;
    expect(item.getAttribute("disabled")).not.toBeNull();
  });

  test("applies custom className to group", () => {
    const { container } = render(
      <ToggleGroup type="single" className="custom-gap">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("custom-gap");
  });

  test("multiple mode onValueChange returns array", () => {
    let values: string[] | undefined;
    render(
      <ToggleGroup type="multiple" onValueChange={(v) => (values = v)}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByText("A"));
    expect(values).toEqual(["a"]);
    fireEvent.click(screen.getByText("B"));
    expect(values).toEqual(["a", "b"]);
  });
});
