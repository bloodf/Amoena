import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { ErrorBoundary } from "./ErrorBoundary";

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test render error");
  return <div>Normal content</div>;
}

describe("ErrorBoundary", () => {
  test("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>child content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("child content")).toBeTruthy();
  });

  test("renders error message when child throws", () => {
    // Suppress console.error for expected error
    const spy = mock(() => {});
    const orig = console.error;
    console.error = spy;

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("Test render error")).toBeTruthy();

    console.error = orig;
  });

  test("renders custom fallback when provided", () => {
    const spy = mock(() => {});
    const orig = console.error;
    console.error = spy;

    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Custom fallback")).toBeTruthy();

    console.error = orig;
  });

  test("renders Try Again button", () => {
    const spy = mock(() => {});
    const orig = console.error;
    console.error = spy;

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Try Again")).toBeTruthy();

    console.error = orig;
  });
});
