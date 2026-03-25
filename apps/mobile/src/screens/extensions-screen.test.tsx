import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExtensionsScreen } from "./extensions-screen";

vi.mock("@lunaria/i18n", () => ({
  useAmoenaTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/runtime/client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listExtensions: vi.fn().mockResolvedValue([]),
      toggleExtension: vi.fn(),
      uninstallExtension: vi.fn(),
    },
  }),
}));

describe("ExtensionsScreen", () => {
  it("renders extensions title", () => {
    render(<ExtensionsScreen />);
    expect(screen.getByText("mobile.extensions")).toBeTruthy();
  });
});
