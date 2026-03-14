import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  test("renders with placeholder", () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeDefined();
  });

  test("renders as a textarea element", () => {
    render(<Textarea placeholder="Note" />);
    const el = screen.getByPlaceholderText("Note");
    expect(el.tagName).toBe("TEXTAREA");
  });

  test("accepts typed input", () => {
    render(<Textarea placeholder="Type here" />);
    const textarea = screen.getByPlaceholderText("Type here") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Hello world" } });
    expect(textarea.value).toBe("Hello world");
  });

  test("supports disabled state", () => {
    render(<Textarea disabled placeholder="Disabled" />);
    const textarea = screen.getByPlaceholderText("Disabled") as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  test("applies custom className", () => {
    render(<Textarea className="h-40" placeholder="Custom" />);
    expect(screen.getByPlaceholderText("Custom").className).toContain("h-40");
  });

  test("supports readonly state", () => {
    render(<Textarea readOnly placeholder="Read only" />);
    const textarea = screen.getByPlaceholderText("Read only") as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(true);
  });

  test("supports aria-invalid", () => {
    render(<Textarea placeholder="err" aria-invalid="true" />);
    expect(screen.getByPlaceholderText("err").getAttribute("aria-invalid")).toBe("true");
  });

  test("supports aria-required", () => {
    render(<Textarea placeholder="req" aria-required="true" />);
    expect(screen.getByPlaceholderText("req").getAttribute("aria-required")).toBe("true");
  });

  test("supports aria-describedby", () => {
    render(<Textarea placeholder="desc" aria-describedby="help" />);
    expect(screen.getByPlaceholderText("desc").getAttribute("aria-describedby")).toBe("help");
  });

  test("has focus-visible ring class", () => {
    render(<Textarea placeholder="focus" />);
    expect(screen.getByPlaceholderText("focus").className).toContain("focus-visible:ring-2");
  });

  test("applies base classes", () => {
    render(<Textarea placeholder="base" />);
    const el = screen.getByPlaceholderText("base");
    expect(el.className).toContain("rounded-md");
    expect(el.className).toContain("border");
    expect(el.className).toContain("border-input");
  });

  test("supports rows attribute", () => {
    render(<Textarea placeholder="rows" rows={10} />);
    expect(screen.getByPlaceholderText("rows").getAttribute("rows")).toBe("10");
  });
});
