import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  test("renders placeholder", () => {
    render(<Input placeholder="Search memory" />);
    expect(screen.getByPlaceholderText("Search memory")).not.toBeNull();
  });

  test("renders as an input element", () => {
    render(<Input placeholder="test" />);
    expect(screen.getByPlaceholderText("test").tagName).toBe("INPUT");
  });

  test("applies custom className", () => {
    render(<Input placeholder="cls" className="w-64" />);
    expect(screen.getByPlaceholderText("cls").className).toContain("w-64");
  });

  test("supports type attribute", () => {
    render(<Input type="password" placeholder="pw" />);
    expect(screen.getByPlaceholderText("pw").getAttribute("type")).toBe("password");
  });

  test("supports email type", () => {
    render(<Input type="email" placeholder="email" />);
    expect(screen.getByPlaceholderText("email").getAttribute("type")).toBe("email");
  });

  test("disabled state", () => {
    render(<Input disabled placeholder="disabled" />);
    const input = screen.getByPlaceholderText("disabled") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.className).toContain("disabled:opacity-50");
  });

  test("readonly state", () => {
    render(<Input readOnly placeholder="ro" />);
    const input = screen.getByPlaceholderText("ro") as HTMLInputElement;
    expect(input.readOnly).toBe(true);
  });

  test("accepts typed input via change", () => {
    render(<Input placeholder="type" />);
    const input = screen.getByPlaceholderText("type") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "hello" } });
    expect(input.value).toBe("hello");
  });

  test("supports aria-invalid", () => {
    render(<Input placeholder="err" aria-invalid="true" />);
    expect(screen.getByPlaceholderText("err").getAttribute("aria-invalid")).toBe("true");
  });

  test("supports aria-required", () => {
    render(<Input placeholder="req" aria-required="true" />);
    expect(screen.getByPlaceholderText("req").getAttribute("aria-required")).toBe("true");
  });

  test("supports aria-describedby", () => {
    render(<Input placeholder="desc" aria-describedby="help-text" />);
    expect(screen.getByPlaceholderText("desc").getAttribute("aria-describedby")).toBe("help-text");
  });

  test("has focus-visible ring class", () => {
    render(<Input placeholder="focus" />);
    expect(screen.getByPlaceholderText("focus").className).toContain("focus-visible:ring-2");
  });

  test("applies base classes", () => {
    render(<Input placeholder="base" />);
    const el = screen.getByPlaceholderText("base");
    expect(el.className).toContain("rounded-md");
    expect(el.className).toContain("border");
    expect(el.className).toContain("border-input");
  });
});
