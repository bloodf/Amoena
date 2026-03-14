import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UsageScreen } from "./UsageScreen";

describe("UsageScreen", () => {
  it("switches tabs and filters the API log view", () => {
    render(<UsageScreen />);

    fireEvent.click(screen.getByRole("button", { name: /api request log/i }));
    expect(screen.getByText(/filter:/i)).toBeTruthy();
    expect(screen.getByText(/all providers/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /by platform/i }));
    expect(screen.getByText(/spending by platform/i)).toBeTruthy();
    expect(screen.getAllByText(/anthropic/i).length).toBeGreaterThan(0);
  });
});
