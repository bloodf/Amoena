import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CommandPaletteFooter } from "./CommandPaletteFooter";

describe("CommandPaletteFooter", () => {
  test("renders navigation hint", () => {
    render(<CommandPaletteFooter />);
    expect(screen.getByText("↑↓ navigate")).toBeTruthy();
  });

  test("renders select hint", () => {
    render(<CommandPaletteFooter />);
    expect(screen.getByText("↵ select")).toBeTruthy();
  });

  test("renders close hint", () => {
    render(<CommandPaletteFooter />);
    expect(screen.getByText("esc close")).toBeTruthy();
  });
});
