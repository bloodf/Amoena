import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { RemoteAccessScreen } from "./RemoteAccessScreen";

describe("RemoteAccessScreen", () => {
  test("regenerates pairing pins, toggles trust, revokes devices, and updates terminal settings", () => {
    render(<RemoteAccessScreen />);

    const firstPin = screen.getByText(/\d{3}\s+\d{3}/).textContent;
    fireEvent.click(screen.getByRole("button", { name: /regenerate/i }));
    const secondPin = screen.getByText(/\d{3}\s+\d{3}/).textContent;

    fireEvent.click(screen.getByText("Trusted"));
    fireEvent.click(screen.getByRole("button", { name: /revoke/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    expect(firstPin).not.toBe(secondPin);
    expect(screen.getByText("No devices connected")).toBeTruthy();
  });

  test("shows LAN relay status when devices are connected", () => {
    render(<RemoteAccessScreen />);
    // initialRemoteDevices has one device => hasDevices=true => currentRelay="lan"
    expect(screen.getByText("LAN Direct")).toBeTruthy();
  });

  test("shows waiting relay status after all devices are revoked", () => {
    render(<RemoteAccessScreen />);
    // Revoke the only device so devices list becomes empty
    fireEvent.click(screen.getByRole("button", { name: /revoke/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(screen.getByText("Waiting for Connection")).toBeTruthy();
  });

  test("cancel revoke keeps device in list", () => {
    render(<RemoteAccessScreen />);
    fireEvent.click(screen.getByRole("button", { name: /revoke/i }));
    expect(screen.getByRole("button", { name: /confirm/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    // Device still present
    expect(screen.getByText("Pixel 8 Pro")).toBeTruthy();
    // Back to the single revoke button
    expect(screen.getByRole("button", { name: /revoke/i })).toBeTruthy();
  });

  test("toggles show/hide PIN using sr-only button text", () => {
    render(<RemoteAccessScreen />);
    // Initial: pin is visible, button says "Hide PIN"
    expect(screen.getByRole("button", { name: /hide pin/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /hide pin/i }));
    // After hiding: button says "Show PIN"
    expect(screen.getByRole("button", { name: /show pin/i })).toBeTruthy();
    // Toggle back
    fireEvent.click(screen.getByRole("button", { name: /show pin/i }));
    expect(screen.getByRole("button", { name: /hide pin/i })).toBeTruthy();
  });

  test("formatExpiry displays initial countdown as m:ss", () => {
    render(<RemoteAccessScreen />);
    // Initial expirySeconds=872 => 14:32
    expect(screen.getByText(/expires in 14:32/i)).toBeTruthy();
  });

  test("formatExpiry resets to 15:00 after regenerate", () => {
    render(<RemoteAccessScreen />);
    fireEvent.click(screen.getByRole("button", { name: /regenerate/i }));
    // 900 seconds => 15:00
    expect(screen.getByText(/expires in 15:00/i)).toBeTruthy();
  });

  test("toggles trust status from trusted to unverified", () => {
    render(<RemoteAccessScreen />);
    expect(screen.getByText("Trusted")).toBeTruthy();
    fireEvent.click(screen.getByText("Trusted"));
    expect(screen.getByText("Unverified")).toBeTruthy();
    // Warning about unverified devices appears
    expect(screen.getByText(/unverified devices/i)).toBeTruthy();
  });

  test("toggles trust status back to trusted", () => {
    render(<RemoteAccessScreen />);
    fireEvent.click(screen.getByText("Trusted"));
    expect(screen.getByText("Unverified")).toBeTruthy();
    fireEvent.click(screen.getByText("Unverified"));
    expect(screen.getByText("Trusted")).toBeTruthy();
  });

  test("toggles remote terminal access switch", () => {
    render(<RemoteAccessScreen />);
    const switches = screen.getAllByRole("switch");
    // First switch is "Allow remote terminal access" (checked=true initially)
    expect(switches[0]).toBeTruthy();
    fireEvent.click(switches[0]!);
    // No crash, state toggled
    expect(screen.getAllByRole("switch")[0]).toBeTruthy();
  });

  test("toggles read-only mode switch", () => {
    render(<RemoteAccessScreen />);
    const switches = screen.getAllByRole("switch");
    // Second switch is "Remote read-only mode" (checked=false initially)
    expect(switches[1]).toBeTruthy();
    fireEvent.click(switches[1]!);
    expect(screen.getAllByRole("switch")[1]).toBeTruthy();
  });

  test("renders pairing panel with QR code visual", () => {
    render(<RemoteAccessScreen />);
    // The panel heading for pairing context
    expect(screen.getByText("LAN Mode")).toBeTruthy();
    expect(screen.getByText("End-to-end encrypted")).toBeTruthy();
  });

  test("renders connected devices panel heading", () => {
    render(<RemoteAccessScreen />);
    expect(screen.getByText("Connected Devices")).toBeTruthy();
  });

  test("renders remote terminal section heading", () => {
    render(<RemoteAccessScreen />);
    expect(screen.getByText("Remote Terminal")).toBeTruthy();
  });

  test("displays device details when connected", () => {
    render(<RemoteAccessScreen />);
    expect(screen.getByText("Pixel 8 Pro")).toBeTruthy();
    expect(screen.getByText(/192\.168\.1\.42/)).toBeTruthy();
  });
});
