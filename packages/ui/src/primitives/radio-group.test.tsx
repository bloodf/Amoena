import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  test("renders radio items", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" aria-label="Option A" />
        <RadioGroupItem value="b" aria-label="Option B" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "Option A" })).toBeDefined();
    expect(screen.getByRole("radio", { name: "Option B" })).toBeDefined();
  });

  test("has radiogroup role", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="x" aria-label="X" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup")).toBeDefined();
  });

  test("selects default value", () => {
    render(
      <RadioGroup defaultValue="b">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>,
    );
    const radioB = screen.getByRole("radio", { name: "B" }) as HTMLButtonElement;
    expect(radioB.getAttribute("data-state")).toBe("checked");
  });

  test("changes selection on click", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" aria-label="First" />
        <RadioGroupItem value="b" aria-label="Second" />
      </RadioGroup>,
    );
    const second = screen.getByRole("radio", { name: "Second" });
    fireEvent.click(second);
    expect(second.getAttribute("data-state")).toBe("checked");
    const first = screen.getByRole("radio", { name: "First" });
    expect(first.getAttribute("data-state")).toBe("unchecked");
  });

  test("applies custom className", () => {
    render(
      <RadioGroup className="gap-4" data-testid="rg">
        <RadioGroupItem value="v" aria-label="V" />
      </RadioGroup>,
    );
    expect(screen.getByTestId("rg").className).toContain("gap-4");
  });

  test("disabled radio item cannot be selected", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" aria-label="Enabled" />
        <RadioGroupItem value="b" aria-label="Disabled" disabled />
      </RadioGroup>,
    );
    const disabled = screen.getByRole("radio", { name: "Disabled" });
    expect(disabled.getAttribute("disabled")).not.toBeNull();
    fireEvent.click(disabled);
    expect(disabled.getAttribute("data-state")).toBe("unchecked");
  });

  test("calls onValueChange when selection changes", () => {
    let value: string | undefined;
    render(
      <RadioGroup defaultValue="a" onValueChange={(v) => (value = v)}>
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "B" }));
    expect(value).toBe("b");
  });

  test("has focus-visible ring class on items", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="x" aria-label="X" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "X" }).className).toContain("focus-visible:ring-2");
  });

  test("disabled items have disabled classes", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="d" aria-label="Dis" disabled />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "Dis" }).className).toContain("disabled:opacity-50");
  });

  test("only one item is checked at a time in single mode", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
        <RadioGroupItem value="c" aria-label="C" />
      </RadioGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "C" }));
    expect(screen.getByRole("radio", { name: "A" }).getAttribute("data-state")).toBe("unchecked");
    expect(screen.getByRole("radio", { name: "B" }).getAttribute("data-state")).toBe("unchecked");
    expect(screen.getByRole("radio", { name: "C" }).getAttribute("data-state")).toBe("checked");
  });
});
