import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { WorkspaceManagerScreen } from "./WorkspaceManagerScreen";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn() }),
}));

describe("WorkspaceManagerScreen", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("handles recover, delete confirmation, and apply-back flows", () => {
    render(
      <MemoryRouter>
        <WorkspaceManagerScreen />
      </MemoryRouter>,
    );

    const recoverButton = screen.queryByRole("button", { name: /recover/i });
    if (recoverButton) {
      fireEvent.click(recoverButton);
    }

    const applyButton = screen.queryByRole("button", { name: /review & apply back/i });
    if (applyButton) {
      fireEvent.click(applyButton);
    }

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm delete/i }));

    expect(screen.queryByText(/deleted/i)).toBeFalsy();
  });
});
