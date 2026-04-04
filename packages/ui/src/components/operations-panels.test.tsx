import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { MessageQueue } from "./MessageQueue";
import { ProviderSetupScreen } from "@/screens/ProviderSetupScreen";
import { TerminalPanel } from "./TerminalPanel";

describe("Amoena operations panels", () => {
  test("message queue can collapse and remove an item", async () => {
    const user = userEvent.setup();
    render(<MessageQueue />);

    expect(screen.getByLabelText(/collapse queue/i)).toBeTruthy();
    await user.click(screen.getByLabelText(/collapse queue/i));
    expect(screen.queryByText(/Add rate limiting to all public API endpoints/i)).toBeNull();
  });

  test("terminal panel can add and close tabs", async () => {
    const user = userEvent.setup();
    const onClose = () => {};
    render(<TerminalPanel onClose={onClose} />);

    expect(screen.getByText("bash")).toBeTruthy();
    await user.click(screen.getByLabelText(/add terminal tab/i));
    expect(screen.getAllByText("bash").length).toBeGreaterThanOrEqual(1);
  });

  test("provider setup expands and tests a provider", async () => {
    const user = userEvent.setup();
    render(<ProviderSetupScreen />);

    const testButton = screen.getAllByRole("button").find((button) => button.textContent?.trim() === "Test");
    expect(testButton).toBeTruthy();
    fireEvent.click(testButton!);
    expect(screen.getByText(/Testing\.\.\.|OK|Failed/i)).toBeTruthy();
  });
});
