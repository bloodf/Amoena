// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AgentAvatar } from "./agent-avatar";

afterEach(() => cleanup());

describe("AgentAvatar", () => {
	it("renders with initials from single-word name", () => {
		render(<AgentAvatar name="coordinator" />);
		const el = screen.getByTitle("coordinator");
		expect(el).toBeDefined();
		expect(el.textContent).toBe("CO");
	});

	it("renders with initials from two-word name", () => {
		render(<AgentAvatar name="Claude Code" />);
		const el = screen.getByTitle("Claude Code");
		expect(el.textContent).toBe("CC");
	});

	it("renders ? for empty name", () => {
		render(<AgentAvatar name="" />);
		const el = screen.getByTitle("");
		expect(el.textContent).toBe("?");
	});

	it("applies xs size class", () => {
		const { container } = render(<AgentAvatar name="test" size="xs" />);
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain("w-5");
	});

	it("applies md size class", () => {
		const { container } = render(<AgentAvatar name="test" size="md" />);
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain("w-8");
	});

	it("applies default sm size class when no size prop", () => {
		const { container } = render(<AgentAvatar name="test" />);
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain("w-6");
	});

	it("sets aria-label to the name", () => {
		render(<AgentAvatar name="Aegis" />);
		expect(screen.getByLabelText("Aegis")).toBeDefined();
	});

	it("generates consistent colors for the same name", () => {
		const { container: c1 } = render(<AgentAvatar name="test" />);
		const style1 = (c1.firstElementChild as HTMLElement).style.backgroundColor;
		cleanup();
		const { container: c2 } = render(<AgentAvatar name="test" />);
		const style2 = (c2.firstElementChild as HTMLElement).style.backgroundColor;
		expect(style1).toBe(style2);
	});
});
