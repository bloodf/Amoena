// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingWizard } from "../components/OnboardingWizard";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({}),
		}),
	);
});

afterEach(() => {
	vi.unstubAllGlobals();
	cleanup();
});

describe("OnboardingWizard", () => {
	it("renders welcome step initially", () => {
		render(<OnboardingWizard onConfigureAgent={vi.fn()} />);
		expect(screen.getByText("wizardWelcomeTitle")).toBeDefined();
	});

	it("Next navigates to provider selection step", () => {
		const { getByRole } = render(<OnboardingWizard onConfigureAgent={vi.fn()} />);
		fireEvent.click(getByRole("button", { name: "getStarted" }));
		expect(screen.getByRole("heading", { name: "wizardChooseProvider" })).toBeDefined();
	});

	it("onConfigureAgent called with provider and credential on finish", async () => {
		const onConfigureAgent = vi.fn();
		const { getByRole, getByPlaceholderText } = render(
			<OnboardingWizard onConfigureAgent={onConfigureAgent} />,
		);

		// Step 1 → 2
		fireEvent.click(getByRole("button", { name: "getStarted" }));

		// Step 2 → 3 (click next)
		fireEvent.click(getByRole("button", { name: "next" }));

		// Step 3: enter credential
		const input = getByPlaceholderText("apiKeyPlaceholder");
		fireEvent.change(input, { target: { value: "sk-test-api-key-12345" } });
		fireEvent.click(getByRole("button", { name: "next" }));

		// Step 4: test connection
		fireEvent.click(getByRole("button", { name: "testConnection" }));

		await waitFor(() => {
			expect(screen.getByText("wizardDoneTitle")).toBeDefined();
		});

		// Step 5: finish
		fireEvent.click(screen.getByRole("button", { name: "startUsing" }));
		expect(onConfigureAgent).toHaveBeenCalledWith({
			provider: "claude-code",
			credential: "sk-test-api-key-12345",
		});
	});
});
