// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OnlineStatus } from "./online-status";

afterEach(() => cleanup());

describe("OnlineStatus", () => {
	it("renders ONLINE when connected", () => {
		render(<OnlineStatus isConnected={true} />);
		expect(screen.getByText("ONLINE")).toBeDefined();
	});

	it("renders OFFLINE when disconnected", () => {
		render(<OnlineStatus isConnected={false} />);
		expect(screen.getByText("OFFLINE")).toBeDefined();
	});

	it("uses green color when connected", () => {
		const { container } = render(<OnlineStatus isConnected={true} />);
		const dot = container.querySelector(".bg-green-500");
		expect(dot).not.toBeNull();
	});

	it("uses red color when disconnected", () => {
		const { container } = render(<OnlineStatus isConnected={false} />);
		const dot = container.querySelector(".bg-red-500");
		expect(dot).not.toBeNull();
	});

	it("applies green text color when connected", () => {
		const { container } = render(<OnlineStatus isConnected={true} />);
		const span = container.querySelector(".text-green-400");
		expect(span).not.toBeNull();
	});

	it("applies red text color when disconnected", () => {
		const { container } = render(<OnlineStatus isConnected={false} />);
		const span = container.querySelector(".text-red-400");
		expect(span).not.toBeNull();
	});
});
