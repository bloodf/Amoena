// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExportPreview } from "./ExportPreview";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

afterEach(() => cleanup());

describe("ExportPreview", () => {
	it("renders preview heading", () => {
		render(
			<ExportPreview
				content="test content"
				format="markdown"
				onConfirm={() => {}}
				onCancel={() => {}}
			/>,
		);
		expect(screen.getByText("preview")).toBeDefined();
	});

	it("renders markdown content in pre tag", () => {
		const { container } = render(
			<ExportPreview
				content="# Hello\n\nWorld"
				format="markdown"
				onConfirm={() => {}}
				onCancel={() => {}}
			/>,
		);
		const pre = container.querySelector("pre");
		expect(pre).not.toBeNull();
		expect(pre!.textContent).toContain("# Hello");
	});

	it("renders HTML content in iframe", () => {
		const { container } = render(
			<ExportPreview
				content="<h1>Hello</h1>"
				format="html"
				onConfirm={() => {}}
				onCancel={() => {}}
			/>,
		);
		const iframe = container.querySelector("iframe");
		expect(iframe).not.toBeNull();
		expect(iframe!.getAttribute("sandbox")).toBe("allow-same-origin");
	});

	it("calls onConfirm when download button clicked", () => {
		const onConfirm = vi.fn();
		render(
			<ExportPreview
				content="test"
				format="markdown"
				onConfirm={onConfirm}
				onCancel={() => {}}
			/>,
		);
		fireEvent.click(screen.getByText("download"));
		expect(onConfirm).toHaveBeenCalled();
	});

	it("calls onCancel when cancel button clicked", () => {
		const onCancel = vi.fn();
		render(
			<ExportPreview
				content="test"
				format="markdown"
				onConfirm={() => {}}
				onCancel={onCancel}
			/>,
		);
		fireEvent.click(screen.getByText("cancel"));
		expect(onCancel).toHaveBeenCalled();
	});
});
