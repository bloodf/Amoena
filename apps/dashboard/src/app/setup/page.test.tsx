// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as React from "react";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
	}),
	usePathname: () => "/setup",
}));

Object.defineProperty(window, "location", {
	value: {
		href: "http://localhost:3000/setup",
		replace: vi.fn(),
	},
	writable: true,
});

vi.mock("@/lib/setup-status", () => ({
	fetchSetupStatusWithRetry: vi.fn(),
}));

vi.mock("@/components/ui/button", () => ({
	Button: ({
		children,
		onClick,
		type,
		disabled,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		type?: "button" | "submit";
		disabled?: boolean;
	}) => (
		<button type={type} onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
}));

vi.mock("@/components/ui/language-switcher", () => ({
	LanguageSwitcherSelect: () => null,
}));

vi.mock("next/image", () => ({
	default: () => null,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("SetupPage", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	it("module is importable", async () => {
		const mod = await import("./page");
		expect(mod).toBeDefined();
	});

	it("shows loading state while checking setup status", async () => {
		const { fetchSetupStatusWithRetry } = await import("@/lib/setup-status");
		vi.mocked(fetchSetupStatusWithRetry).mockImplementation(
			() => new Promise(() => {}),
		);
		const { default: SetupPage } = await import("./page");
		render(<SetupPage />);
		expect(screen.getByText("checkingSetupStatus")).toBeDefined();
	});

	it("shows error state when setup status check fails", async () => {
		const { fetchSetupStatusWithRetry } = await import("@/lib/setup-status");
		vi.mocked(fetchSetupStatusWithRetry).mockRejectedValue(new Error("Network error"));
		const { default: SetupPage } = await import("./page");
		render(<SetupPage />);
		await waitFor(() => {
			expect(screen.getByText("failedToCheckSetup")).toBeDefined();
		});
	});

	it("shows retry button on setup check failure", async () => {
		const { fetchSetupStatusWithRetry } = await import("@/lib/setup-status");
		vi.mocked(fetchSetupStatusWithRetry).mockRejectedValue(new Error("Network error"));
		const { default: SetupPage } = await import("./page");
		render(<SetupPage />);
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "retry" })).toBeDefined();
		});
	});

	it("renders setup form when setup is needed", async () => {
		const { fetchSetupStatusWithRetry } = await import("@/lib/setup-status");
		vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
		const { default: SetupPage } = await import("./page");
		render(<SetupPage />);
		await waitFor(() => {
			expect(screen.getByLabelText("username")).toBeDefined();
			expect(screen.getByLabelText("password")).toBeDefined();
		});
	});

	it("has default username pre-filled", async () => {
		const { fetchSetupStatusWithRetry } = await import("@/lib/setup-status");
		vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
		const { default: SetupPage } = await import("./page");
		render(<SetupPage />);
		await waitFor(() => {
			const usernameInput = screen.getByLabelText("username") as HTMLInputElement;
			expect(usernameInput.value).toBe("admin");
		});
	});

	it("shows password too short warning for short passwords", async () => {
		const { fetchSetupStatusWithRetry } = await import("@/lib/setup-status");
		vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
		const { default: SetupPage } = await import("./page");
		render(<SetupPage />);
		await waitFor(() => {
			expect(screen.getByLabelText("username")).toBeDefined();
		});
		fireEvent.change(screen.getByLabelText("password"), { target: { value: "short" } });
		await waitFor(() => {
			expect(screen.getByText(/moreCharsNeeded/)).toBeDefined();
		});
	});

	it("renders display name field", async () => {
		const { fetchSetupStatusWithRetry } = await import("@/lib/setup-status");
		vi.mocked(fetchSetupStatusWithRetry).mockResolvedValue({ needsSetup: true });
		const { default: SetupPage } = await import("./page");
		render(<SetupPage />);
		await waitFor(() => {
			expect(screen.getByLabelText(/displayName/)).toBeDefined();
		});
	});
});
