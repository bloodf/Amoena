import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MemoryScreen } from "./memory-screen";

vi.mock("@lunaria/i18n", () => ({
  useLunariaTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/runtime/client-context", () => ({
  useClient: () => ({
    auth: { accessToken: "tok", baseUrl: "http://localhost" },
    client: {
      getSessionMemory: vi.fn().mockResolvedValue({
        summary: null,
        tokenBudget: { total: 1000, l0: 500, l1: 300, l2: 200 },
        entries: [],
      }),
    },
  }),
}));

describe("MemoryScreen", () => {
  it("renders memory title", () => {
    render(<MemoryScreen sessionId="s1" />);
    expect(screen.getByText("mobile.memory")).toBeTruthy();
  });
});
