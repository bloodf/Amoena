import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { RateLimitsMenu } from "./RateLimitsMenu";
import { getSeverity } from "./data";

describe("RateLimitsMenu", () => {
  test("renders toggle button with provider info", () => {
    render(
      <RateLimitsMenu
        open={false}
        onToggle={mock(() => {})}
        onClose={mock(() => {})}
      />,
    );
    // Should render some usage numbers
    expect(document.body).toBeTruthy();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  test("calls onToggle when button is clicked", () => {
    const onToggle = mock(() => {});
    render(
      <RateLimitsMenu open={false} onToggle={onToggle} onClose={mock(() => {})} />,
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onToggle).toHaveBeenCalled();
  });

  test("shows dropdown content when open=true", () => {
    render(
      <RateLimitsMenu
        open={true}
        onToggle={mock(() => {})}
        onClose={mock(() => {})}
      />,
    );
    expect(screen.getByText("Rate Limits by Provider")).toBeTruthy();
    expect(screen.getByText("Anthropic")).toBeTruthy();
    expect(screen.getByText("OpenAI")).toBeTruthy();
    expect(screen.getByText("Google")).toBeTruthy();
  });

  test("does not show dropdown content when open=false", () => {
    render(
      <RateLimitsMenu
        open={false}
        onToggle={mock(() => {})}
        onClose={mock(() => {})}
      />,
    );
    expect(screen.queryByText("Rate Limits by Provider")).toBeNull();
  });
});

describe("getSeverity", () => {
  test("returns Exhausted for percent >= 95", () => {
    expect(getSeverity(95).label).toBe("Exhausted");
    expect(getSeverity(100).label).toBe("Exhausted");
  });

  test("returns Warning for percent >= 80 and < 95", () => {
    expect(getSeverity(80).label).toBe("Warning");
    expect(getSeverity(94).label).toBe("Warning");
  });

  test("returns Caution for percent >= 50 and < 80", () => {
    expect(getSeverity(50).label).toBe("Caution");
    expect(getSeverity(79).label).toBe("Caution");
  });

  test("returns Safe for percent < 50", () => {
    expect(getSeverity(0).label).toBe("Safe");
    expect(getSeverity(49).label).toBe("Safe");
  });

  test("Exhausted uses destructive class", () => {
    expect(getSeverity(95).className).toContain("destructive");
  });

  test("Warning uses destructive class", () => {
    expect(getSeverity(80).className).toContain("destructive");
  });

  test("Caution uses warning class", () => {
    expect(getSeverity(60).className).toContain("warning");
  });

  test("Safe uses green class", () => {
    expect(getSeverity(10).className).toContain("green");
  });
});
