import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { Label } from "./label";

describe("Label", () => {
  test("renders with text content", () => {
    render(<Label>Email</Label>);
    expect(screen.getByText("Email")).not.toBeNull();
  });

  test("renders as a label element", () => {
    render(<Label>Name</Label>);
    expect(screen.getByText("Name").tagName).toBe("LABEL");
  });

  test("applies base variant classes", () => {
    render(<Label>Field</Label>);
    expect(screen.getByText("Field").className).toContain("text-sm");
    expect(screen.getByText("Field").className).toContain("font-medium");
  });

  test("applies custom className", () => {
    render(<Label className="text-red-500">Custom</Label>);
    expect(screen.getByText("Custom").className).toContain("text-red-500");
  });

  test("associates with input via htmlFor", () => {
    render(<Label htmlFor="email-input">Email</Label>);
    expect(screen.getByText("Email").getAttribute("for")).toBe("email-input");
  });

  test("supports peer-disabled opacity class", () => {
    render(<Label>Peer</Label>);
    expect(screen.getByText("Peer").className).toContain("peer-disabled:opacity-70");
  });

  test("supports nested children", () => {
    render(
      <Label>
        <span>Nested</span> Label
      </Label>,
    );
    expect(screen.getByText("Nested")).toBeDefined();
  });

  test("combines base and custom classes", () => {
    render(<Label className="text-red-500">Combined</Label>);
    const el = screen.getByText("Combined");
    expect(el.className).toContain("text-sm");
    expect(el.className).toContain("text-red-500");
  });
});
