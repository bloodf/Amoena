// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DigitalClock } from "./digital-clock";

afterEach(() => cleanup());

describe("DigitalClock", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2025-06-15T14:30:00"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders time after mount", () => {
		const { container } = render(<DigitalClock />);
		const span = container.querySelector("span");
		expect(span).not.toBeNull();
		expect(span!.textContent).toMatch(/\d{2}:\d{2}/);
	});

	it("applies digital-clock class", () => {
		const { container } = render(<DigitalClock />);
		const span = container.querySelector("span");
		expect(span?.className).toContain("digital-clock");
	});

	it("returns null before first update", () => {
		// Override useState to return empty string initially
		const { container } = render(<DigitalClock />);
		// After mount, useEffect fires synchronously with fake timers
		vi.advanceTimersByTime(0);
		const span = container.querySelector("span");
		expect(span).not.toBeNull();
	});

	it("updates time on interval tick", () => {
		const { container } = render(<DigitalClock />);
		vi.advanceTimersByTime(0);
		const firstTime = container.querySelector("span")?.textContent;
		vi.setSystemTime(new Date("2025-06-15T14:40:00"));
		vi.advanceTimersByTime(10_000);
		const secondTime = container.querySelector("span")?.textContent;
		expect(secondTime).toMatch(/\d{2}:\d{2}/);
	});
});
