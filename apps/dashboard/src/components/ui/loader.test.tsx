// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Loader } from "./loader";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("next/image", () => ({
	default: (props: any) => <img {...props} />,
}));

vi.mock("@/lib/version", () => ({
	APP_VERSION: "1.0.0-test",
}));

afterEach(() => cleanup());

describe("Loader", () => {
	it("renders panel variant by default", () => {
		const { container } = render(<Loader />);
		expect(container.firstElementChild).not.toBeNull();
	});

	it("renders label when provided in panel variant", () => {
		render(<Loader label="Loading data..." />);
		expect(screen.getByText("Loading data...")).toBeDefined();
	});

	it("renders inline variant with dots", () => {
		const { container } = render(<Loader variant="inline" />);
		const dots = container.querySelectorAll(".animate-pulse");
		expect(dots.length).toBeGreaterThan(0);
	});

	it("renders inline variant with label", () => {
		render(<Loader variant="inline" label="Please wait" />);
		expect(screen.getByText("Please wait")).toBeDefined();
	});

	it("renders page variant with branding", () => {
		render(<Loader variant="page" />);
		expect(screen.getByText("missionControl")).toBeDefined();
		expect(screen.getByText("agentOrchestration")).toBeDefined();
	});

	it("renders page variant with version", () => {
		render(<Loader variant="page" />);
		expect(screen.getByText("v1.0.0-test")).toBeDefined();
	});

	it("renders page variant with progress steps", () => {
		const steps = [
			{ key: "s1", label: "Loading config", status: "done" as const },
			{ key: "s2", label: "Connecting", status: "pending" as const },
		];
		render(<Loader variant="page" steps={steps} />);
		expect(screen.getByText("Connecting")).toBeDefined();
	});
});
