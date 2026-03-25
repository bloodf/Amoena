// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SecurityScanCard } from "./security-scan-card";

vi.mock("@/components/ui/loader", () => ({
	Loader: ({ label }: { label?: string }) => <div data-testid="loader">{label}</div>,
}));

afterEach(() => cleanup());

describe("SecurityScanCard", () => {
	it("renders initial state with scan button", () => {
		render(<SecurityScanCard />);
		expect(screen.getByText("Run Security Scan")).toBeDefined();
	});

	it("shows description text in initial state", () => {
		render(<SecurityScanCard />);
		expect(
			screen.getByText(/Run a comprehensive security scan/),
		).toBeDefined();
	});

	it("shows loading state on scan click", async () => {
		const mockFetch = vi.fn().mockImplementation(
			() => new Promise(() => {}), // Never resolves - stays loading
		);
		globalThis.fetch = mockFetch;

		render(<SecurityScanCard />);
		fireEvent.click(screen.getByText("Run Security Scan"));
		expect(screen.getByTestId("loader")).toBeDefined();
	});

	it("shows error state when scan fails", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
		});
		globalThis.fetch = mockFetch;

		render(<SecurityScanCard />);
		fireEvent.click(screen.getByText("Run Security Scan"));

		await vi.waitFor(() => {
			expect(screen.getByText("Scan failed")).toBeDefined();
		});
	});

	it("shows retry button on error", async () => {
		const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
		globalThis.fetch = mockFetch;

		render(<SecurityScanCard />);
		fireEvent.click(screen.getByText("Run Security Scan"));

		await vi.waitFor(() => {
			expect(screen.getByText("Retry")).toBeDefined();
		});
	});
});
