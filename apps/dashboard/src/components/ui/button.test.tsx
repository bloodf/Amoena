// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./button";

afterEach(() => cleanup());

describe("Button", () => {
	it("renders children text", () => {
		render(<Button>Click me</Button>);
		expect(screen.getByText("Click me")).toBeDefined();
	});

	it("calls onClick handler", () => {
		const onClick = vi.fn();
		render(<Button onClick={onClick}>Click</Button>);
		fireEvent.click(screen.getByText("Click"));
		expect(onClick).toHaveBeenCalled();
	});

	it("renders as button element by default", () => {
		render(<Button>Test</Button>);
		expect(screen.getByText("Test").tagName).toBe("BUTTON");
	});

	it("can be disabled", () => {
		render(<Button disabled>Disabled</Button>);
		const btn = screen.getByText("Disabled") as HTMLButtonElement;
		expect(btn.disabled).toBe(true);
	});

	it("applies variant classes", () => {
		const { container } = render(<Button variant="ghost">Ghost</Button>);
		const btn = container.querySelector("button");
		expect(btn).not.toBeNull();
	});

	it("applies custom className", () => {
		const { container } = render(
			<Button className="custom-class">Custom</Button>,
		);
		const btn = container.querySelector("button");
		expect(btn?.className).toContain("custom-class");
	});
});
