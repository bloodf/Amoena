import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { Box } from "lucide-react";

import {
  DegradedBanner,
  EmptyState,
  ErrorState,
  SkeletonBlock,
  SkeletonCard,
  SkeletonLine,
  SkeletonList,
  SkeletonTable,
} from "./StateOverlays";

describe("SkeletonLine", () => {
  test("renders with default width", () => {
    const { container } = render(<SkeletonLine />);
    const el = container.querySelector(".animate-pulse");
    expect(el).toBeTruthy();
    expect(el?.classList.contains("w-full")).toBe(true);
  });

  test("renders with custom width", () => {
    const { container } = render(<SkeletonLine width="w-1/2" />);
    const el = container.querySelector(".animate-pulse");
    expect(el?.classList.contains("w-1/2")).toBe(true);
  });
});

describe("SkeletonBlock", () => {
  test("renders default 4 skeleton lines", () => {
    const { container } = render(<SkeletonBlock />);
    const lines = container.querySelectorAll(".animate-pulse");
    expect(lines.length).toBe(4);
  });

  test("renders custom line count", () => {
    const { container } = render(<SkeletonBlock lines={2} />);
    const lines = container.querySelectorAll(".animate-pulse");
    expect(lines.length).toBe(2);
  });
});

describe("SkeletonCard", () => {
  test("renders card structure with skeleton elements", () => {
    const { container } = render(<SkeletonCard />);
    const pulseElements = container.querySelectorAll(".animate-pulse");
    // avatar (1) + 2 header lines + 2 body lines = 5
    expect(pulseElements.length).toBe(5);
    expect(container.querySelector(".border")).toBeTruthy();
  });
});

describe("SkeletonTable", () => {
  test("renders with default 5 rows and 4 cols", () => {
    const { container } = render(<SkeletonTable />);
    // header row has 4 cols + 5 data rows * 4 cols = 24 skeleton lines
    const lines = container.querySelectorAll(".animate-pulse");
    expect(lines.length).toBe(24);
  });

  test("renders with custom rows and cols", () => {
    const { container } = render(<SkeletonTable rows={2} cols={3} />);
    // header 3 + 2 data rows * 3 = 9
    const lines = container.querySelectorAll(".animate-pulse");
    expect(lines.length).toBe(9);
  });
});

describe("SkeletonList", () => {
  test("renders default 5 items", () => {
    const { container } = render(<SkeletonList />);
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots.length).toBe(5);
  });

  test("renders custom item count", () => {
    const { container } = render(<SkeletonList items={3} />);
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots.length).toBe(3);
  });
});

describe("EmptyState", () => {
  test("renders icon, title, and description", () => {
    render(
      <EmptyState icon={Box} title="No items" description="Nothing here yet" />,
    );
    expect(screen.getByText("No items")).toBeTruthy();
    expect(screen.getByText("Nothing here yet")).toBeTruthy();
  });

  test("renders action button and fires onAction", () => {
    const onAction = mock(() => {});
    render(
      <EmptyState icon={Box} title="Empty" action="Add item" onAction={onAction} />,
    );
    const button = screen.getByText("Add item");
    expect(button).toBeTruthy();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalled();
  });

  test("renders without optional description and action", () => {
    render(<EmptyState icon={Box} title="Empty" />);
    expect(screen.getByText("Empty")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("ErrorState", () => {
  test("renders default title", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  test("renders custom title and description", () => {
    render(<ErrorState title="Oops" description="Try again later" />);
    expect(screen.getByText("Oops")).toBeTruthy();
    expect(screen.getByText("Try again later")).toBeTruthy();
  });

  test("fires onRetry callback", () => {
    const onRetry = mock(() => {});
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByText("Retry"));
    expect(onRetry).toHaveBeenCalled();
  });

  test("renders without retry button when onRetry is not provided", () => {
    render(<ErrorState />);
    expect(screen.queryByText("Retry")).toBeNull();
  });
});

describe("DegradedBanner", () => {
  test("renders message text", () => {
    render(<DegradedBanner message="Service degraded" />);
    expect(screen.getByText("Service degraded")).toBeTruthy();
  });
});
