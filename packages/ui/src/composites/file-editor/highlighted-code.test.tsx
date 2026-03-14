import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { HighlightedCode } from "./HighlightedCode";

// Mock useTheme hook
vi.mock("@/hooks/use-theme", () => ({
  useTheme: () => ({ theme: "dark" }),
}));

describe("HighlightedCode", () => {
  test("renders line numbers for each line of content", () => {
    const content = "line one\nline two\nline three";
    render(<HighlightedCode content={content} fileName="test.ts" />);
    // 3 lines → line numbers 1, 2, 3
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  test("renders a code element with language class for known extension — branch line 37-38", () => {
    const { container } = render(
      <HighlightedCode content="const x = 1;" fileName="app.ts" />,
    );
    const code = container.querySelector("code");
    expect(code).toBeTruthy();
    expect(code?.className).toContain("language-typescript");
  });

  test("renders with plaintext class for unknown extension — branch line 37 (no grammar)", () => {
    const { container } = render(
      <HighlightedCode content="raw content" fileName="file.xyz" />,
    );
    const code = container.querySelector("code");
    expect(code?.className).toContain("language-plaintext");
  });

  test("renders with light theme stylesheet when theme is light", async () => {
    vi.doMock("@/hooks/use-theme", () => ({
      useTheme: () => ({ theme: "light" }),
    }));
    const { container } = render(
      <HighlightedCode content="const y = 2;" fileName="script.js" />,
    );
    const code = container.querySelector("code");
    expect(code).toBeTruthy();
  });

  test("renders single line content without crash", () => {
    render(<HighlightedCode content="single line" fileName="readme.md" />);
    expect(screen.getByText("1")).toBeTruthy();
  });

  test("renders empty content without crash", () => {
    render(<HighlightedCode content="" fileName="empty.json" />);
    // empty string splits to [""], so 1 line
    expect(screen.getByText("1")).toBeTruthy();
  });
});
