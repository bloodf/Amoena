import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { TitleBar } from "./TitleBar";

describe("TitleBar", () => {
  test("renders project name", () => {
    render(<TitleBar />);
    expect(screen.getByText("amoena-frontend")).toBeTruthy();
  });

  test("renders on separator", () => {
    render(<TitleBar />);
    expect(screen.getByText("on")).toBeTruthy();
  });

  test("renders branch name", () => {
    render(<TitleBar />);
    expect(screen.getByText("feature/redesign")).toBeTruthy();
  });

  test("renders window control buttons", () => {
    const { container } = render(<TitleBar />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(3);
  });
});
