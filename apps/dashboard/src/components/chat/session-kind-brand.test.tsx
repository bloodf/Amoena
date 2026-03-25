// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SessionKindAvatar, SessionKindPill, getSessionKindLabel } from "./session-kind-brand";

vi.mock("next/image", () => ({
	default: (props: any) => <img {...props} />,
}));

afterEach(() => cleanup());

describe("getSessionKindLabel", () => {
	it("returns Claude Code for claude-code", () => {
		expect(getSessionKindLabel("claude-code")).toBe("Claude Code");
	});

	it("returns Codex CLI for codex-cli", () => {
		expect(getSessionKindLabel("codex-cli")).toBe("Codex CLI");
	});

	it("returns Hermes Agent for hermes", () => {
		expect(getSessionKindLabel("hermes")).toBe("Hermes Agent");
	});

	it("returns Gateway for unknown kind", () => {
		expect(getSessionKindLabel("unknown")).toBe("Gateway");
	});
});

describe("SessionKindAvatar", () => {
	it("renders fallback text for gateway kind", () => {
		render(<SessionKindAvatar kind="gateway" fallback="G" />);
		const el = screen.getByTitle("Gateway");
		expect(el.textContent).toBe("G");
	});

	it("renders image for codex-cli kind", () => {
		render(<SessionKindAvatar kind="codex-cli" fallback="C" />);
		const img = screen.getByAltText("Codex logo");
		expect(img).toBeDefined();
	});

	it("renders image for hermes kind", () => {
		render(<SessionKindAvatar kind="hermes" fallback="H" />);
		const img = screen.getByAltText("Hermes logo");
		expect(img).toBeDefined();
	});

	it("sets aria-label", () => {
		render(<SessionKindAvatar kind="gateway" fallback="G" />);
		expect(screen.getByLabelText("Gateway")).toBeDefined();
	});

	it("accepts custom sizeClassName", () => {
		const { container } = render(
			<SessionKindAvatar kind="gateway" fallback="G" sizeClassName="w-10 h-10" />,
		);
		const el = container.firstElementChild as HTMLElement;
		expect(el.className).toContain("w-10");
	});
});

describe("SessionKindPill", () => {
	it("renders short label for claude-code", () => {
		render(<SessionKindPill kind="claude-code" />);
		expect(screen.getByText("CC")).toBeDefined();
	});

	it("renders short label for codex-cli", () => {
		render(<SessionKindPill kind="codex-cli" />);
		expect(screen.getByText("CX")).toBeDefined();
	});

	it("renders short label for hermes", () => {
		render(<SessionKindPill kind="hermes" />);
		expect(screen.getByText("HM")).toBeDefined();
	});

	it("renders GW for unknown kind", () => {
		render(<SessionKindPill kind="anything" />);
		expect(screen.getByText("GW")).toBeDefined();
	});
});
