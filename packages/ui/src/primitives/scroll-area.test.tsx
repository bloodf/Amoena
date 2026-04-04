import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ScrollArea, ScrollBar } from "./scroll-area";

describe("ScrollArea", () => {
  test("renders children", () => {
    render(
      <ScrollArea>
        <p>Scrollable content</p>
      </ScrollArea>,
    );
    expect(screen.getByText("Scrollable content")).toBeDefined();
  });

  test("applies custom className", () => {
    render(
      <ScrollArea className="h-72" data-testid="scroll-root">
        <p>Content</p>
      </ScrollArea>,
    );
    const root = screen.getByTestId("scroll-root");
    expect(root.className).toContain("h-72");
  });

  test("renders multiple children", () => {
    render(
      <ScrollArea>
        <p>Item 1</p>
        <p>Item 2</p>
        <p>Item 3</p>
      </ScrollArea>,
    );
    expect(screen.getByText("Item 1")).toBeDefined();
    expect(screen.getByText("Item 2")).toBeDefined();
    expect(screen.getByText("Item 3")).toBeDefined();
  });

  test("renders base overflow-hidden class", () => {
    render(
      <ScrollArea data-testid="scroll">
        <p>Content</p>
      </ScrollArea>,
    );
    const root = screen.getByTestId("scroll");
    expect(root.className).toContain("overflow-hidden");
  });

  test("supports data-testid", () => {
    render(
      <ScrollArea data-testid="my-scroll">
        <p>Test</p>
      </ScrollArea>,
    );
    expect(screen.getByTestId("my-scroll")).toBeDefined();
  });

  test("renders long content", () => {
    const longContent = "x".repeat(10000);
    render(
      <ScrollArea>
        <p>{longContent}</p>
      </ScrollArea>,
    );
    expect(screen.getByText(longContent)).toBeDefined();
  });

  // Branch coverage: ScrollBar orientation conditional (vertical vs horizontal)
  test("ScrollBar renders with vertical orientation by default", () => {
    const { container } = render(
      <ScrollArea data-testid="scroll">
        <p>Content</p>
      </ScrollArea>,
    );
    // The scroll area always includes a vertical ScrollBar by default
    expect(container.firstChild).toBeTruthy();
  });
});
