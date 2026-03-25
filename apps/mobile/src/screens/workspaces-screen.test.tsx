import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WorkspacesScreen } from "./workspaces-screen";

vi.mock("@lunaria/i18n", () => ({
  useAmoenaTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/runtime/client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      listWorkspaces: vi.fn().mockResolvedValue([]),
      archiveWorkspace: vi.fn(),
      destroyWorkspace: vi.fn(),
    },
  }),
}));

describe("WorkspacesScreen", () => {
  it("renders workspaces title", () => {
    render(<WorkspacesScreen />);
    expect(screen.getByText("mobile.workspaces")).toBeTruthy();
  });
});
