import { render } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  test("renders without crashing", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  test("renders as a div", () => {
    const { container } = render(<Skeleton />);
    expect((container.firstChild as HTMLElement).tagName).toBe("DIV");
  });

  test("applies base classes", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("animate-pulse");
    expect(el.className).toContain("rounded-md");
    expect(el.className).toContain("bg-muted");
  });

  test("applies custom className", () => {
    const { container } = render(<Skeleton className="h-12 w-12" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-12");
    expect(el.className).toContain("w-12");
  });

  test("passes through additional props", () => {
    const { container } = render(<Skeleton data-testid="skel" />);
    expect(container.querySelector("[data-testid='skel']")).not.toBeNull();
  });

  test("renders with width and height classes", () => {
    const { container } = render(<Skeleton className="h-4 w-[250px]" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-4");
    expect(el.className).toContain("w-[250px]");
  });

  test("supports aria-hidden for decorative skeletons", () => {
    const { container } = render(<Skeleton aria-hidden="true" />);
    expect((container.firstChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  test("can be used as a circular skeleton", () => {
    const { container } = render(<Skeleton className="h-12 w-12 rounded-full" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded-full");
  });

  test("supports role attribute", () => {
    const { container } = render(<Skeleton role="status" />);
    expect((container.firstChild as HTMLElement).getAttribute("role")).toBe("status");
  });
});
