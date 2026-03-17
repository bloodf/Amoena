import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingsScreen } from "./settings-screen";

vi.mock("@lunaria/i18n", () => ({
  useLunariaTranslation: () => ({ t: (key: string) => key }),
}));

describe("SettingsScreen", () => {
  it("renders settings title", () => {
    render(<SettingsScreen />);
    expect(screen.getByText("mobile.settings")).toBeTruthy();
  });
});
