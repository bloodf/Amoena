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
	usePathname: () => "/login",
}));

Object.defineProperty(window, "location", {
	value: {
		href: "http://localhost:3000/login",
		replace: vi.fn(),
	},
	writable: true,
});

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

describe("LoginPage", () => {
	beforeEach(() => {
		mockFetch.mockReset();
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
		expect(screen.getByLabelText("username")).toBeDefined();
		expect(screen.getByLabelText("password")).toBeDefined();
	});

	it("renders submit button", async () => {
		const { default: LoginPage } = await import("./page");
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ needsSetup: false }),
		});
		render(<LoginPage />);
		expect(screen.getByRole("button", { name: "signIn" })).toBeDefined();
	});

	it("handles username input change", async () => {
		const { default: LoginPage } = await import("./page");
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ needsSetup: false }),
		});
		render(<LoginPage />);
		const usernameInput = screen.getByLabelText("username");
		fireEvent.change(usernameInput, { target: { value: "testuser" } });
		expect(usernameInput.value).toBe("testuser");
	});

	it("handles password input change", async () => {
		const { default: LoginPage } = await import("./page");
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ needsSetup: false }),
		});
		render(<LoginPage />);
		const passwordInput = screen.getByLabelText("password");
		fireEvent.change(passwordInput, { target: { value: "testpassword" } });
		expect(passwordInput.value).toBe("testpassword");
	});

	it("displays error message on login failure", async () => {
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
		fireEvent.change(screen.getByLabelText("username"), { target: { value: "admin" } });
		fireEvent.change(screen.getByLabelText("password"), { target: { value: "wrongpassword" } });
		fireEvent.click(screen.getByRole("button", { name: "signIn" }));
		await waitFor(() => {
			expect(screen.getByRole("alert")).toBeDefined();
		});
	});

	it("shows pending approval state when server returns PENDING_APPROVAL", async () => {
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
		fireEvent.change(screen.getByLabelText("username"), { target: { value: "admin" } });
		fireEvent.change(screen.getByLabelText("password"), { target: { value: "password123" } });
		fireEvent.click(screen.getByRole("button", { name: "signIn" }));
		await waitFor(() => {
			expect(screen.getByText("accessRequestSubmitted")).toBeDefined();
		});
	});

	it("handles network error during login", async () => {
		const { default: LoginPage } = await import("./page");
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ needsSetup: false }),
			})
			.mockRejectedValueOnce(new Error("Network error"));
		render(<LoginPage />);
		fireEvent.change(screen.getByLabelText("username"), { target: { value: "admin" } });
		fireEvent.change(screen.getByLabelText("password"), { target: { value: "password123" } });
		fireEvent.click(screen.getByRole("button", { name: "signIn" }));
		await waitFor(() => {
			expect(screen.getByText("networkError")).toBeDefined();
		});
	});

	it("renders mission control branding", async () => {
		const { default: LoginPage } = await import("./page");
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ needsSetup: false }),
		});
		render(<LoginPage />);
		expect(screen.getByText("missionControl")).toBeDefined();
	});
});
