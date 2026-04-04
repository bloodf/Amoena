import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Separator } from "./separator";

describe("Separator", () => {
  test("renders without crashing", () => {
    const { container } = render(<Separator />);
    expect(container.querySelector("[data-orientation]")).not.toBeNull();
  });

  test("renders horizontal by default", () => {
    const { container } = render(<Separator />);
    const sep = container.querySelector("[data-orientation]")!;
    expect(sep.getAttribute("data-orientation")).toBe("horizontal");
    expect(sep.className).toContain("w-full");
  });

  test("renders vertical orientation", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const sep = container.querySelector("[data-orientation]")!;
    expect(sep.getAttribute("data-orientation")).toBe("vertical");
    expect(sep.className).toContain("h-full");
  });

  test("applies decorative role by default", () => {
    const { container } = render(<Separator />);
    const sep = container.querySelector("[data-orientation]")!;
    expect(sep.getAttribute("role")).toBe("none");
  });

  test("applies separator role when not decorative", () => {
    const { container } = render(<Separator decorative={false} />);
    const sep = container.querySelector("[role='separator']");
    expect(sep).not.toBeNull();
  });

  test("applies custom className", () => {
    const { container } = render(<Separator className="my-4" />);
    const sep = container.querySelector("[data-orientation]")!;
    expect(sep.className).toContain("my-4");
  });

  test("has aria-orientation when not decorative", () => {
    const { container } = render(<Separator decorative={false} orientation="vertical" />);
    const sep = container.querySelector("[role='separator']")!;
    expect(sep.getAttribute("aria-orientation")).toBe("vertical");
  });

  test("applies base bg-border class", () => {
    const { container } = render(<Separator />);
    const sep = container.querySelector("[data-orientation]")!;
    expect(sep.className).toContain("bg-border");
  });

  test("horizontal separator has h-[1px] class", () => {
    const { container } = render(<Separator />);
    const sep = container.querySelector("[data-orientation]")!;
    expect(sep.className).toContain("h-[1px]");
  });

  test("vertical separator has w-[1px] class", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const sep = container.querySelector("[data-orientation]")!;
    expect(sep.className).toContain("w-[1px]");
  });
});
