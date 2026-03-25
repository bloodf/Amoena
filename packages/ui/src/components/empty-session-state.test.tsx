import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { EmptySessionState } from "./EmptySessionState";

describe("EmptySessionState", () => {
  test("renders known provider info", () => {
    render(<EmptySessionState provider="claude" model="sonnet-4" sessionName="Test Session" />);
    expect(screen.getByText("Test Session")).toBeTruthy();
    expect(screen.getByText("Claude Code")).toBeTruthy();
    expect(screen.getByText(/sonnet-4/)).toBeTruthy();
  });

  test("falls back to amoena info for unknown provider", () => {
    render(<EmptySessionState provider="unknown-provider" model="custom" sessionName="Fallback" />);
    expect(screen.getByText("Fallback")).toBeTruthy();
    // Unknown provider falls back to "Amoena AI"
    expect(screen.getByText("Amoena AI")).toBeTruthy();
    expect(screen.getByText(/custom/)).toBeTruthy();
  });

  test("renders suggestion cards", () => {
    render(<EmptySessionState provider="claude" model="sonnet-4" sessionName="S" />);
    expect(screen.getByText("Refactor a module")).toBeTruthy();
    expect(screen.getByText("Fix a bug")).toBeTruthy();
  });

  test("calls onSuggestionClick when suggestion clicked", () => {
    const onClick = mock(() => {});
    render(<EmptySessionState provider="claude" model="sonnet-4" sessionName="S" onSuggestionClick={onClick} />);
    fireEvent.click(screen.getByText("Refactor a module"));
    expect(onClick).toHaveBeenCalledWith("Refactor the authentication module to use JWT tokens");
  });

  test("renders without onSuggestionClick (optional callback branch)", () => {
    render(<EmptySessionState provider="claude" model="sonnet-4" sessionName="S" />);
    // Should not crash when clicking without handler
    fireEvent.click(screen.getByText("Fix a bug"));
    expect(screen.getByText("Fix a bug")).toBeTruthy();
  });
});
