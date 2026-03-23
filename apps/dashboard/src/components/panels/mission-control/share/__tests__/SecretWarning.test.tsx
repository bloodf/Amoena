// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SecretWarning } from "../SecretWarning";

afterEach(cleanup);

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string, params?: Record<string, unknown>) => {
		if (key === "secretsDetected") return `${params?.count} potential secrets detected and will be redacted`;
		return key;
	},
}));

describe("SecretWarning", () => {
	it("shows redacted count", () => {
		render(
			<SecretWarning
				redactedCount={3}
				redactedTypes={["api_key"]}
				onProceed={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(screen.getByText(/3 potential secrets/)).toBeTruthy();
	});

	it("lists secret types", () => {
		render(
			<SecretWarning
				redactedCount={2}
				redactedTypes={["api_key", "aws_key"]}
				onProceed={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);
		expect(screen.getByText("apiKey")).toBeTruthy();
		expect(screen.getByText("awsKey")).toBeTruthy();
	});

	it("proceed button calls onProceed", () => {
		const onProceed = vi.fn();
		render(
			<SecretWarning
				redactedCount={1}
				redactedTypes={["api_key"]}
				onProceed={onProceed}
				onCancel={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText("proceedWithRedaction"));
		expect(onProceed).toHaveBeenCalledTimes(1);
	});

	it("cancel button calls onCancel", () => {
		const onCancel = vi.fn();
		render(
			<SecretWarning
				redactedCount={1}
				redactedTypes={["api_key"]}
				onProceed={vi.fn()}
				onCancel={onCancel}
			/>,
		);
		fireEvent.click(screen.getByText("cancel"));
		expect(onCancel).toHaveBeenCalledTimes(1);
	});
});
