import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";

import { TimelineTab } from "./TimelineTab";

describe("TimelineTab rendering", () => {
  test("renders the Timeline header", () => {
    render(<TimelineTab />);
    expect(screen.getByText("Timeline")).toBeDefined();
  });

  test("renders all checkpoint labels", () => {
    render(<TimelineTab />);
    expect(screen.getByText("Session start")).toBeDefined();
    expect(screen.getByText("Initial auth scaffold")).toBeDefined();
    expect(screen.getByText("JWT token rotation")).toBeDefined();
    expect(screen.getByText("Middleware integration")).toBeDefined();
    // cp5 is the current checkpoint and also appears in the detail panel
    expect(screen.getAllByText("Error handling + tests").length).toBeGreaterThan(0);
  });

  test("renders child branch checkpoint", () => {
    render(<TimelineTab />);
    expect(screen.getByText("Alt: Session-based auth")).toBeDefined();
  });

  test("renders Checkpoint button in header", () => {
    render(<TimelineTab />);
    expect(screen.getByText("Checkpoint")).toBeDefined();
  });
});

describe("TimelineTab initial selected state (cp5 is default)", () => {
  test("shows detail panel for cp5 (Error handling + tests) since it has filesChanged > 0", () => {
    render(<TimelineTab />);
    // The detail panel shows the selected checkpoint label and file count
    // cp5 has filesChanged: 8
    const detailLabels = screen.getAllByText("Error handling + tests");
    // Should appear at least twice: once in list, once in detail
    expect(detailLabels.length).toBeGreaterThan(1);
  });

  test("shows file count in detail panel for default selection", () => {
    render(<TimelineTab />);
    expect(screen.getByText(/8 files/)).toBeDefined();
  });

  test("renders changed file paths in detail panel", () => {
    render(<TimelineTab />);
    expect(screen.getByText("src/auth/jwt.rs")).toBeDefined();
    expect(screen.getByText("src/auth/middleware.rs")).toBeDefined();
  });
});

describe("TimelineTab checkpoint selection", () => {
  test("clicking a checkpoint selects it", () => {
    render(<TimelineTab />);
    fireEvent.click(screen.getByText("Middleware integration"));
    // Middleware integration has filesChanged: 6, so detail panel should now show it
    const labels = screen.getAllByText("Middleware integration");
    expect(labels.length).toBeGreaterThan(1);
  });

  test("clicking cp1 (Session start, 0 files) hides detail panel", () => {
    render(<TimelineTab />);
    fireEvent.click(screen.getByText("Session start"));
    // Session start has filesChanged: 0 — detail panel should not render
    expect(screen.queryByText(/0 files/)).toBeNull();
    // The changed files list should not be visible
    expect(screen.queryByText("src/auth/jwt.rs")).toBeNull();
  });

  test("restore and fork buttons appear when non-current checkpoint is selected", () => {
    render(<TimelineTab />);
    // Select a non-current, non-cp5 checkpoint
    fireEvent.click(screen.getByText("Middleware integration"));
    expect(screen.getByLabelText("Restore checkpoint")).toBeDefined();
    expect(screen.getByLabelText("Fork from checkpoint")).toBeDefined();
  });

  test("restore and fork buttons do not appear for the current checkpoint (cp5)", () => {
    render(<TimelineTab />);
    // cp5 is the current checkpoint — isCurrent: true — no restore/fork buttons
    // It's selected by default
    expect(screen.queryByLabelText("Restore checkpoint")).toBeNull();
    expect(screen.queryByLabelText("Fork from checkpoint")).toBeNull();
  });
});

describe("TimelineTab inline diff expansion", () => {
  test("clicking a file row toggles inline diff open", () => {
    render(<TimelineTab />);
    // Detail panel is visible for cp5 (default selection)
    const jwtFile = screen.getByText("src/auth/jwt.rs");
    fireEvent.click(jwtFile.closest("button")!);
    // Diff lines should now be visible
    expect(screen.getByText("use jsonwebtoken::{encode, decode, Header, Algorithm};")).toBeDefined();
  });

  test("clicking the same file row again collapses the diff", () => {
    render(<TimelineTab />);
    const jwtFile = screen.getByText("src/auth/jwt.rs");
    const btn = jwtFile.closest("button")!;
    fireEvent.click(btn);
    // Diff is open
    expect(screen.getByText("use jsonwebtoken::{encode, decode, Header, Algorithm};")).toBeDefined();
    // Click again to close
    fireEvent.click(btn);
    expect(screen.queryByText("use jsonwebtoken::{encode, decode, Header, Algorithm};")).toBeNull();
  });

  test("clicking a different file shows its diff and hides others", () => {
    render(<TimelineTab />);
    // Open jwt.rs diff
    const jwtFile = screen.getByText("src/auth/jwt.rs");
    fireEvent.click(jwtFile.closest("button")!);
    expect(screen.getByText("use jsonwebtoken::{encode, decode, Header, Algorithm};")).toBeDefined();

    // Open middleware.rs diff (same diff data shown for all files in this component)
    const middlewareFile = screen.getByText("src/auth/middleware.rs");
    fireEvent.click(middlewareFile.closest("button")!);
    // jwt.rs diff should now be closed since expandedDiff changed
    // (middleware diff appears; jwt diff should be gone)
    // Both share the same diffLines data in the component, so check count
    const diffInstances = screen.queryAllByText("use jsonwebtoken::{encode, decode, Header, Algorithm};");
    // Only one expanded at a time
    expect(diffInstances.length).toBe(1);
  });
});

describe("TimelineTab renderCheckpoint (line 57 coverage)", () => {
  test("child checkpoint 'Alt: Session-based auth' is rendered in the list", () => {
    render(<TimelineTab />);
    expect(screen.getByText("Alt: Session-based auth")).toBeDefined();
  });

  test("child checkpoint renders indented (ml-5 class on wrapper)", () => {
    const { container } = render(<TimelineTab />);
    // Depth > 0 checkpoints get ml-5 applied
    expect(container.querySelector(".ml-5")).not.toBeNull();
  });

  test("child checkpoint is selectable and shows restore button", () => {
    render(<TimelineTab />);
    fireEvent.click(screen.getByText("Alt: Session-based auth"));
    expect(screen.getByLabelText("Restore checkpoint")).toBeDefined();
    expect(screen.getByLabelText("Fork from checkpoint")).toBeDefined();
  });

  test("selecting child checkpoint updates detail panel", () => {
    const { container } = render(<TimelineTab />);
    fireEvent.click(screen.getByText("Alt: Session-based auth"));
    // After selection, the detail panel should also show the label (filesChanged: 2 > 0)
    // Count occurrences of the label text in the full HTML
    const count = (container.innerHTML.match(/Alt: Session-based auth/g) ?? []).length;
    expect(count).toBeGreaterThan(1);
  });
});
