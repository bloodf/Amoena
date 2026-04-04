import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { AgentStatusDot } from "./AgentStatusDot";

describe("AgentStatusDot — status colors", () => {
  test("applies green color for active status", () => {
    const { container } = render(<AgentStatusDot status="active" />);
    const dot = container.querySelector(".bg-green-500");
    expect(dot).not.toBeNull();
  });

  test("applies amber color for paused status", () => {
    const { container } = render(<AgentStatusDot status="paused" />);
    const dot = container.querySelector(".bg-amber-400");
    expect(dot).not.toBeNull();
  });

  test("applies red color for failed status", () => {
    const { container } = render(<AgentStatusDot status="failed" />);
    const dot = container.querySelector(".bg-red-500");
    expect(dot).not.toBeNull();
  });

  test("applies zinc color for idle status", () => {
    const { container } = render(<AgentStatusDot status="idle" />);
    const dot = container.querySelector(".bg-zinc-500");
    expect(dot).not.toBeNull();
  });
});

describe("AgentStatusDot — pulse animation", () => {
  test("renders animate-ping element when status is active", () => {
    const { container } = render(<AgentStatusDot status="active" />);
    expect(container.querySelector(".animate-ping")).not.toBeNull();
  });

  test("does not render animate-ping element when status is paused", () => {
    const { container } = render(<AgentStatusDot status="paused" />);
    expect(container.querySelector(".animate-ping")).toBeNull();
  });

  test("does not render animate-ping element when status is failed", () => {
    const { container } = render(<AgentStatusDot status="failed" />);
    expect(container.querySelector(".animate-ping")).toBeNull();
  });

  test("does not render animate-ping element when status is idle", () => {
    const { container } = render(<AgentStatusDot status="idle" />);
    expect(container.querySelector(".animate-ping")).toBeNull();
  });
});

describe("AgentStatusDot — size variants", () => {
  test("applies sm size class", () => {
    const { container } = render(<AgentStatusDot status="idle" size="sm" />);
    expect(container.querySelector(".size-1\\.5")).not.toBeNull();
  });

  test("applies md size class by default", () => {
    const { container } = render(<AgentStatusDot status="idle" />);
    expect(container.querySelector(".size-2\\.5")).not.toBeNull();
  });

  test("applies lg size class", () => {
    const { container } = render(<AgentStatusDot status="idle" size="lg" />);
    expect(container.querySelector(".size-3\\.5")).not.toBeNull();
  });
});

describe("AgentStatusDot — accessibility", () => {
  test("renders status role with default label for active", () => {
    render(<AgentStatusDot status="active" />);
    expect(screen.getByRole("status", { name: "Active" })).not.toBeNull();
  });

  test("renders status role with default label for failed", () => {
    render(<AgentStatusDot status="failed" />);
    expect(screen.getByRole("status", { name: "Failed" })).not.toBeNull();
  });

  test("uses custom aria-label when provided", () => {
    render(<AgentStatusDot status="idle" aria-label="Worker offline" />);
    expect(screen.getByRole("status", { name: "Worker offline" })).not.toBeNull();
  });
});
