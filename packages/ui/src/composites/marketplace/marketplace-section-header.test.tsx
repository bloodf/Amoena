import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MarketplaceSectionHeader } from "./MarketplaceSectionHeader";

describe("MarketplaceSectionHeader", () => {
  test("renders title", () => {
    render(<MarketplaceSectionHeader title="Extensions" count={5} />);
    expect(screen.getByText("Extensions")).toBeTruthy();
  });

  test("renders count with packages plural", () => {
    render(<MarketplaceSectionHeader title="All" count={3} />);
    expect(screen.getByText("3 packages")).toBeTruthy();
  });

  test("renders singular package for count 1", () => {
    render(<MarketplaceSectionHeader title="All" count={1} />);
    expect(screen.getByText("1 package")).toBeTruthy();
  });

  test("renders zero packages", () => {
    render(<MarketplaceSectionHeader title="Empty" count={0} />);
    expect(screen.getByText("0 packages")).toBeTruthy();
  });
});
