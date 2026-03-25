// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MarkdownRenderer } from "./markdown-renderer";

afterEach(() => cleanup());

describe("MarkdownRenderer", () => {
	it("returns null for empty content", () => {
		const { container } = render(<MarkdownRenderer content="" />);
		expect(container.innerHTML).toBe("");
	});

	it("returns null for whitespace-only content", () => {
		const { container } = render(<MarkdownRenderer content="   " />);
		expect(container.innerHTML).toBe("");
	});

	it("renders paragraph text", () => {
		render(<MarkdownRenderer content="Hello world" />);
		expect(screen.getByText("Hello world")).toBeDefined();
	});

	it("renders bold text", () => {
		const { container } = render(
			<MarkdownRenderer content="This is **bold** text" />,
		);
		const strong = container.querySelector("strong");
		expect(strong).not.toBeNull();
		expect(strong!.textContent).toBe("bold");
	});

	it("renders links with target _blank", () => {
		const { container } = render(
			<MarkdownRenderer content="[Click here](https://example.com)" />,
		);
		const link = container.querySelector("a");
		expect(link).not.toBeNull();
		expect(link!.getAttribute("target")).toBe("_blank");
		expect(link!.getAttribute("rel")).toContain("noopener");
	});

	it("renders inline code", () => {
		const { container } = render(
			<MarkdownRenderer content="Use `npm install`" />,
		);
		const code = container.querySelector("code");
		expect(code).not.toBeNull();
	});

	it("strips HTML tags from content", () => {
		render(<MarkdownRenderer content="Hello <script>alert(1)</script> world" />);
		expect(screen.getByText("Hello alert(1) world")).toBeDefined();
	});

	it("applies preview styles when preview is true", () => {
		const { container } = render(
			<MarkdownRenderer content="Preview text" preview={true} />,
		);
		expect(container.firstElementChild?.className).toContain("text-xs");
	});

	it("truncates content in preview mode", () => {
		const longContent = "a".repeat(300);
		const { container } = render(
			<MarkdownRenderer content={longContent} preview={true} />,
		);
		// Preview should be truncated to 240 chars + "..."
		expect(container.textContent!.length).toBeLessThan(300);
	});
});
