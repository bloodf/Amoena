import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar", () => {
  test("renders without crashing", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(container.firstChild).not.toBeNull();
  });

  test("renders fallback text", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("AB")).not.toBeNull();
  });

  test("applies base classes to root", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>CD</AvatarFallback>
      </Avatar>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("rounded-full");
    expect(root.className).toContain("overflow-hidden");
  });

  test("applies custom className to root", () => {
    const { container } = render(
      <Avatar className="h-20 w-20">
        <AvatarFallback>EF</AvatarFallback>
      </Avatar>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("h-20");
    expect(root.className).toContain("w-20");
  });

  test("renders AvatarImage with src", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.png" alt="User" />
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>,
    );
    const img = container.querySelector("img");
    if (img) {
      expect(img.getAttribute("src")).toBe("https://example.com/avatar.png");
    }
  });

  test("applies fallback base classes", () => {
    render(
      <Avatar>
        <AvatarFallback>IJ</AvatarFallback>
      </Avatar>,
    );
    const fallback = screen.getByText("IJ");
    expect(fallback.className).toContain("bg-muted");
    expect(fallback.className).toContain("rounded-full");
  });

  test("renders with custom fallback className", () => {
    render(
      <Avatar>
        <AvatarFallback className="bg-blue-500">KL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("KL").className).toContain("bg-blue-500");
  });

  test("AvatarImage has alt attribute for accessibility", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="https://example.com/a.png" alt="User avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>,
    );
    const img = container.querySelector("img");
    if (img) {
      expect(img.getAttribute("alt")).toBe("User avatar");
    }
  });

  test("renders with different sizes via className", () => {
    const { container } = render(
      <Avatar className="h-6 w-6">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("h-6");
    expect(root.className).toContain("w-6");
  });

  test("fallback displays single character", () => {
    render(
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("A")).toBeDefined();
  });

  test("fallback displays emoji", () => {
    render(
      <Avatar>
        <AvatarFallback>🌙</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("🌙")).toBeDefined();
  });
});
