import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  test("renders with default variant", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("bg-primary");
  });

  test("renders secondary variant", () => {
    render(<Badge variant="secondary">Beta</Badge>);
    expect(screen.getByText("Beta").className).toContain("bg-secondary");
  });

  test("renders destructive variant", () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText("Error").className).toContain("bg-destructive");
  });

  test("renders outline variant", () => {
    render(<Badge variant="outline">Draft</Badge>);
    const badge = screen.getByText("Draft");
    expect(badge.className).toContain("text-foreground");
    expect(badge.className).not.toContain("bg-primary");
  });

  test("applies custom className", () => {
    render(<Badge className="ml-2">Custom</Badge>);
    expect(screen.getByText("Custom").className).toContain("ml-2");
  });

  test("renders as inline element", () => {
    render(<Badge>Inline</Badge>);
    expect(screen.getByText("Inline").className).toContain("inline-flex");
  });

  test("renders with text content correctly", () => {
    render(<Badge>Status: Active</Badge>);
    expect(screen.getByText("Status: Active")).toBeDefined();
  });

  test("applies base rounded and text classes", () => {
    render(<Badge>Base</Badge>);
    const badge = screen.getByText("Base");
    expect(badge.className).toContain("rounded");
    expect(badge.className).toContain("text-xs");
    expect(badge.className).toContain("font-semibold");
  });

  test("outline variant has border styling", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge.className).toContain("border");
  });
});
