// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ParsedTemplate } from "../../../../../lib/template-queries";
import { TemplateLauncher } from "../TemplateLauncher";

afterEach(cleanup);

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

vi.mock("../../../../../lib/event-bus", () => ({
	eventBus: { broadcast: vi.fn() },
}));

const templateWithPlaceholders: ParsedTemplate = {
	id: "t1",
	name: "Add Feature",
	description: "Implement a feature",
	goalText: "Implement {feature_name}: {feature_description}",
	category: "built-in",
	tags: ["feature"],
	taskHints: [],
	options: { maxConcurrency: 3 },
	useCount: 0,
	lastUsedAt: null,
	createdAt: 0,
};

const templateNoPlaceholders: ParsedTemplate = {
	...templateWithPlaceholders,
	id: "t2",
	goalText: "Run a general review",
};

describe("TemplateLauncher", () => {
	it("renders input for each placeholder", () => {
		render(
			<TemplateLauncher
				template={templateWithPlaceholders}
				onLaunch={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(screen.getByLabelText("feature name")).toBeTruthy();
		expect(screen.getByLabelText("feature description")).toBeTruthy();
	});

	it("launch button disabled until all placeholders filled", () => {
		render(
			<TemplateLauncher
				template={templateWithPlaceholders}
				onLaunch={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		const launchBtns = screen.getAllByText("launch");
		const launchBtn = launchBtns.find((el) => el.tagName === "BUTTON") ?? launchBtns[0];
		expect((launchBtn as HTMLButtonElement).disabled).toBe(true);
	});

	it("onLaunch called with filled goal text", () => {
		const onLaunch = vi.fn();
		render(
			<TemplateLauncher
				template={templateWithPlaceholders}
				onLaunch={onLaunch}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.change(screen.getByLabelText("feature name"), {
			target: { value: "MyFeature" },
		});
		fireEvent.change(screen.getByLabelText("feature description"), {
			target: { value: "Does something cool" },
		});
		const launchBtns = screen.getAllByText("launch");
		const launchBtn = launchBtns.find((el) => el.tagName === "BUTTON") ?? launchBtns[0];
		fireEvent.click(launchBtn);
		expect(onLaunch).toHaveBeenCalledWith(
			"Implement MyFeature: Does something cool",
			{ maxConcurrency: 3 },
		);
	});

	it("launch button enabled when no placeholders", () => {
		render(
			<TemplateLauncher
				template={templateNoPlaceholders}
				onLaunch={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		const launchBtns = screen.getAllByText("launch");
		const launchBtn = launchBtns.find((el) => el.tagName === "BUTTON") ?? launchBtns[0];
		expect((launchBtn as HTMLButtonElement).disabled).toBe(false);
	});
});
