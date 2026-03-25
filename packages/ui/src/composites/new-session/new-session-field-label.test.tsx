import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { NewSessionFieldLabel } from "./NewSessionFieldLabel";

describe("NewSessionFieldLabel", () => {
  test("renders label text", () => {
    render(<NewSessionFieldLabel>Provider</NewSessionFieldLabel>);
    expect(screen.getByText("Provider")).toBeTruthy();
  });

  test("renders as a label element", () => {
    const { container } = render(<NewSessionFieldLabel>Model</NewSessionFieldLabel>);
    expect(container.querySelector("label")).toBeTruthy();
  });

  test("has uppercase tracking", () => {
    const { container } = render(<NewSessionFieldLabel>Test</NewSessionFieldLabel>);
    const label = container.querySelector("label")!;
    expect(label.className).toContain("uppercase");
    expect(label.className).toContain("tracking-wider");
  });
});
