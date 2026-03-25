// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocalModeBanner } from "./local-mode-banner";

const mockNavigateToPanel = vi.fn();
const mockDismissBanner = vi.fn();

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/navigation", () => ({
	useNavigateToPanel: () => mockNavigateToPanel,
}));

vi.mock("@/store", () => ({
	useAmoena: () => ({
		dashboardMode: "local",
		bannerDismissed: false,
		capabilitiesChecked: true,
		dismissBanner: mockDismissBanner,
	}),
}));

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("LocalModeBanner", () => {
	it("renders when in local mode", () => {
		render(<LocalModeBanner />);
		expect(screen.getByText("noGatewayDetected")).toBeDefined();
	});

	it("renders configure gateway button", () => {
		render(<LocalModeBanner />);
		expect(screen.getByText("configureGateway")).toBeDefined();
	});

	it("navigates to gateways panel on button click", () => {
		render(<LocalModeBanner />);
		fireEvent.click(screen.getByText("configureGateway"));
		expect(mockNavigateToPanel).toHaveBeenCalledWith("gateways");
	});

	it("calls dismissBanner on dismiss click", () => {
		render(<LocalModeBanner />);
		const dismissBtn = screen.getByTitle("dismiss");
		fireEvent.click(dismissBtn);
		expect(mockDismissBanner).toHaveBeenCalled();
	});
});
