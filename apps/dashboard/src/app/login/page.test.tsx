// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock next-intl
vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
const mockRouter = {
	push: vi.fn(),
	replace: vi.fn(),
	prefetch: vi.fn(),
};
vi.mock("next/navigation", () => ({
	useRouter: () => mockRouter,
	usePathname: () => "/login",
}));

// Mock window.location
const mockLocation = {
	href: "http://localhost:3000/login",
	replace: vi.fn(),
};
Object.defineProperty(window, "location", {
	value: mockLocation,
	writable: true,
});

// Mock @/components/ui/button
vi.mock("@/components/ui/button", () => ({
	Button: ({
		children,
		onClick,
		type,
		disabled,
		size,
		variant,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		type?: "button" | "submit";
		disabled?: boolean;
		size?: string;
		variant?: string;
	}) => (
		<button type={type} onClick={onClick} disabled={disabled}>
			{children}
		</button>
	),
}));

// Mock @/components/ui/language-switcher
vi.mock("@/components/ui/language-switcher", () => ({
	LanguageSwitcherSelect: () => null,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("LoginPage", () => {
	beforeEach(() => {
		mockFetch.mockReset();
		mockLocation.replace.mockReset();
	});

	it("module is importable", async () => {
		const mod = await import("./page");
		expect(mod).toBeDefined();
	});

	it("renders login form with username and password fields", async () => {
		const { default: LoginPage } = await import("./page");
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ needsSetup: false }),
		});
		render(<LoginPage />);
		expect(screen.getByLabelText("username")).toBeInTheDocument();
		expect(screen.getByLabelText("password")).toBeInTheDocument();
	});

	it("renders submit button", async () => {
		const { default: LoginPage } = await import("./page");
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ needsSetup: false }),
		});
		render(<LoginPage />);
		expect(screen.getByRole("button", { name: "signIn" })).toBeInTheDocument();
	});

	it("updates username state on input change", async () => {
		const user = userEvent.setup();
		const { default: LoginPage } = await import("./page");
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ needsSetup: false }),
		});
		render(<LoginPage />);
		const usernameInput = screen.getByLabelText("username");
		await user.clear(usernameInput);
		await user.type(usernameInput, "testuser");
		expect(usernameInput).toHaveValue("testuser");
	});

	it("updates password state on input change", async () => {
		const user = userEvent.setup();
		const { default: LoginPage } = await import("./page");
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ needsSetup: false }),
		});
		render(<LoginPage />);
		const passwordInput = screen.getByLabelText("password");
		await user.clear(passwordInput);
		await user.type(passwordInput, "testpassword");
		expect(passwordInput).toHaveValue("testpassword");
	});

	it("calls completeLogin when form is submitted", async () => {
		const user = userEvent.setup();
		const { default: LoginPage } = await import("./page");
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ needsSetup: false }),
		});
		render(<LoginPage />);
		await user.type(screen.getByLabelText("username"), "admin");
		await user.type(screen.getByLabelText("password"), "password123");
		await user.click(screen.getByRole("button", { name: "signIn" }));
		// Form submission should trigger fetch
		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/auth/login",
				expect.objectContaining({ method: "POST" }),
			);
		});
	});

	it("displays error message on login failure", async () => {
		const user = userEvent.setup();
		const { default: LoginPage } = await import("./page");
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ needsSetup: false }),
			})
			.mockResolvedValueOnce({
				ok: false,
				status: 401,
				json: async () => ({ error: "Invalid credentials" }),
			});
		render(<LoginPage />);
		await user.type(screen.getByLabelText("username"), "admin");
		await user.type(screen.getByLabelText("password"), "wrongpassword");
		await user.click(screen.getByRole("button", { name: "signIn" }));
		await waitFor(() => {
			expect(screen.getByRole("alert")).toBeInTheDocument();
		});
	});

	it("shows pending approval state when server returns PENDING_APPROVAL", async () => {
		const user = userEvent.setup();
		const { default: LoginPage } = await import("./page");
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ needsSetup: false }),
			})
			.mockResolvedValueOnce({
				ok: false,
				status: 403,
				json: async () => ({ code: "PENDING_APPROVAL" }),
			});
		render(<LoginPage />);
		await user.type(screen.getByLabelText("username"), "admin");
		await user.type(screen.getByLabelText("password"), "password123");
		await user.click(screen.getByRole("button", { name: "signIn" }));
		await waitFor(() => {
			expect(screen.getByText("accessRequestSubmitted")).toBeInTheDocument();
		});
	});

	it("shows needs setup state when server returns NO_USERS", async () => {
		const user = userEvent.setup();
		const { default: LoginPage } = await import("./page");
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ needsSetup: false }),
			})
			.mockResolvedValueOnce({
				ok: false,
				status: 404,
				json: async () => ({ code: "NO_USERS" }),
			});
		render(<LoginPage />);
		await user.type(screen.getByLabelText("username"), "admin");
		await user.type(screen.getByLabelText("password"), "password123");
		await user.click(screen.getByRole("button", { name: "signIn" }));
		await waitFor(() => {
			expect(screen.getByText("noAdminAccount")).toBeInTheDocument();
		});
	});

	it("redirects to /setup when needsSetup is true from API", async () => {
		const { default: LoginPage } = await import("./page");
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ needsSetup: true }),
		});
		render(<LoginPage />);
		await waitFor(() => {
			expect(mockLocation.replace).toHaveBeenCalledWith("/setup");
		});
	});

	it.skip("renders Google Sign-In button when client ID is configured", async () => {
		// Note: This test is skipped because it requires module reloading which is complex
		// The Google Sign-In button is conditionally rendered based on NEXT_PUBLIC_GOOGLE_CLIENT_ID
	});

	it("handles network error during login", async () => {
		const user = userEvent.setup();
		const { default: LoginPage } = await import("./page");
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ needsSetup: false }),
			})
			.mockRejectedValueOnce(new Error("Network error"));
		render(<LoginPage />);
		await user.type(screen.getByLabelText("username"), "admin");
		await user.type(screen.getByLabelText("password"), "password123");
		await user.click(screen.getByRole("button", { name: "signIn" }));
		await waitFor(() => {
			expect(screen.getByText("networkError")).toBeInTheDocument();
		});
	});

	it("renders mission control branding", async () => {
		const { default: LoginPage } = await import("./page");
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ needsSetup: false }),
		});
		render(<LoginPage />);
		expect(screen.getByText("missionControl")).toBeInTheDocument();
	});
});
