// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
	useLocale: () => "en",
}));

vi.mock("next-themes", () => ({
	useTheme: () => ({ theme: "void", setTheme: vi.fn() }),
}));

vi.mock("next/image", () => ({
	default: (props: any) => <img {...props} />,
}));

vi.mock("@/store", () => ({
	useAmoena: () => ({
		dashboardMode: "local",
		connection: { isConnected: false, url: "", reconnectAttempts: 0 },
	}),
}));

vi.mock("@/lib/navigation", () => ({
	useNavigateToPanel: () => vi.fn(),
}));

vi.mock("@/lib/themes", () => ({
	THEMES: [
		{ id: "void", label: "Void", swatch: "#000", group: "dark" },
	],
}));

vi.mock("@/i18n/config", () => ({
	locales: ["en"],
	localeNames: { en: "English" },
}));

vi.mock("@/lib/version", () => ({
	APP_VERSION: "1.0.0-test",
}));

afterEach(() => cleanup());

describe("HeaderBar", () => {
	it("module is importable", async () => {
		const mod = await import("./header-bar");
		expect(mod).toBeDefined();
	});
});
