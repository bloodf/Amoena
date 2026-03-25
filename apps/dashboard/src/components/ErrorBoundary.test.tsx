// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/client-logger", () => ({
	createClientLogger: () => ({
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
	}),
}));

afterEach(() => cleanup());

function ThrowingComponent({ message }: { message: string }) {
	throw new Error(message);
}

function GoodComponent() {
	return <div>All good</div>;
}

describe("ErrorBoundary", () => {
	// Suppress console.error for expected errors
	const originalError = console.error;
	beforeAll(() => {
		console.error = vi.fn();
	});
	afterAll(() => {
		console.error = originalError;
	});

	it("renders children when no error", () => {
		render(
			<ErrorBoundary>
				<GoodComponent />
			</ErrorBoundary>,
		);
		expect(screen.getByText("All good")).toBeDefined();
	});

	it("renders error fallback when child throws", () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent message="Test error" />
			</ErrorBoundary>,
		);
		expect(screen.getByText("somethingWentWrong")).toBeDefined();
		expect(screen.getByText("Test error")).toBeDefined();
	});

	it("renders custom fallback when provided", () => {
		render(
			<ErrorBoundary fallback={<div>Custom fallback</div>}>
				<ThrowingComponent message="err" />
			</ErrorBoundary>,
		);
		expect(screen.getByText("Custom fallback")).toBeDefined();
	});

	it("renders retry button in default fallback", () => {
		render(
			<ErrorBoundary>
				<ThrowingComponent message="err" />
			</ErrorBoundary>,
		);
		expect(screen.getByText("tryAgain")).toBeDefined();
	});
});
