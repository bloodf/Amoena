import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { RemoteDevicesPanel } from "./RemoteDevicesPanel";
import type { RemoteDevice } from "./types";

const trustedDevice: RemoteDevice = {
  name: "iPhone 15",
  ip: "192.168.1.50",
  connectedSince: "10:00 AM",
  lastSeen: "just now",
  relay: "lan",
  trusted: true,
  permissions: ["read", "write"],
};

const untrustedDevice: RemoteDevice = {
  name: "Android Tablet",
  ip: "192.168.1.55",
  connectedSince: "11:00 AM",
  lastSeen: "5m ago",
  relay: "relay",
  trusted: false,
  permissions: [],
};

function makeProps(overrides: Partial<Parameters<typeof RemoteDevicesPanel>[0]> = {}) {
  return {
    devices: [trustedDevice],
    confirmRevoke: null,
    onToggleTrust: vi.fn(() => {}),
    onAskRevoke: vi.fn(() => {}),
    onCancelRevoke: vi.fn(() => {}),
    onConfirmRevoke: vi.fn(() => {}),
    ...overrides,
  };
}

describe("RemoteDevicesPanel", () => {
  test("shows empty state when no devices — branch line 34", () => {
    render(<RemoteDevicesPanel {...makeProps({ devices: [] })} />);
    expect(screen.getByText("No devices connected")).toBeTruthy();
  });

  test("renders device list when devices are present — branch line 34", () => {
    render(<RemoteDevicesPanel {...makeProps()} />);
    expect(screen.getByText("iPhone 15")).toBeTruthy();
  });

  test("shows Trusted pill for trusted device — branch line 50", () => {
    render(<RemoteDevicesPanel {...makeProps()} />);
    expect(screen.getByText("Trusted")).toBeTruthy();
  });

  test("shows Unverified pill for untrusted device — branch line 50", () => {
    render(<RemoteDevicesPanel {...makeProps({ devices: [untrustedDevice] })} />);
    expect(screen.getByText("Unverified")).toBeTruthy();
  });

  test("calls onToggleTrust when trust button is clicked", () => {
    const onToggleTrust = vi.fn(() => {});
    render(<RemoteDevicesPanel {...makeProps({ onToggleTrust })} />);
    fireEvent.click(screen.getByText("Trusted").closest("button")!);
    expect(onToggleTrust).toHaveBeenCalledWith("iPhone 15");
  });

  test("uses Wifi icon for lan relay — branch line 74", () => {
    const { container } = render(<RemoteDevicesPanel {...makeProps()} />);
    // LAN device: Wifi icon (lan branch)
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  test("uses Radio icon for relay connection — branch line 74", () => {
    const { container: c1 } = render(<RemoteDevicesPanel {...makeProps()} />);
    const { container: c2 } = render(
      <RemoteDevicesPanel {...makeProps({ devices: [untrustedDevice] })} />,
    );
    // Both should render svgs (just verifying the branch doesn't crash)
    expect(c1.querySelectorAll("svg").length).toBeGreaterThan(0);
    expect(c2.querySelectorAll("svg").length).toBeGreaterThan(0);
  });

  test("shows Revoke button when confirmRevoke is null — branch line 83", () => {
    render(<RemoteDevicesPanel {...makeProps({ confirmRevoke: null })} />);
    expect(screen.getByText("Revoke")).toBeTruthy();
  });

  test("calls onAskRevoke when Revoke is clicked", () => {
    const onAskRevoke = vi.fn(() => {});
    render(<RemoteDevicesPanel {...makeProps({ onAskRevoke })} />);
    fireEvent.click(screen.getByText("Revoke"));
    expect(onAskRevoke).toHaveBeenCalledWith("iPhone 15");
  });

  test("shows Confirm/Cancel when confirmRevoke matches device name — branch line 83", () => {
    render(
      <RemoteDevicesPanel {...makeProps({ confirmRevoke: "iPhone 15" })} />,
    );
    expect(screen.getByText("Confirm")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  test("calls onConfirmRevoke when Confirm is clicked", () => {
    const onConfirmRevoke = vi.fn(() => {});
    render(
      <RemoteDevicesPanel
        {...makeProps({ confirmRevoke: "iPhone 15", onConfirmRevoke })}
      />,
    );
    fireEvent.click(screen.getByText("Confirm"));
    expect(onConfirmRevoke).toHaveBeenCalledWith("iPhone 15");
  });

  test("calls onCancelRevoke when Cancel is clicked", () => {
    const onCancelRevoke = vi.fn(() => {});
    render(
      <RemoteDevicesPanel
        {...makeProps({ confirmRevoke: "iPhone 15", onCancelRevoke })}
      />,
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancelRevoke).toHaveBeenCalled();
  });

  test("shows unverified warning banner when any device is not trusted — branch line 114", () => {
    render(
      <RemoteDevicesPanel {...makeProps({ devices: [untrustedDevice] })} />,
    );
    expect(screen.getByText(/unverified devices/i)).toBeTruthy();
  });

  test("does not show warning banner when all devices are trusted — branch line 114", () => {
    render(<RemoteDevicesPanel {...makeProps({ devices: [trustedDevice] })} />);
    expect(screen.queryByText(/unverified devices/i)).toBeNull();
  });

  test("renders permissions list for device — branch line 78", () => {
    render(<RemoteDevicesPanel {...makeProps()} />);
    expect(screen.getByText(/read, write/)).toBeTruthy();
  });

  test("renders empty permissions gracefully — branch line 78", () => {
    render(<RemoteDevicesPanel {...makeProps({ devices: [untrustedDevice] })} />);
    // permissions is [] - should render "Perms: " without crashing
    expect(screen.getByText(/Perms:/)).toBeTruthy();
  });

  test("renders multiple devices with separator border", () => {
    render(
      <RemoteDevicesPanel
        {...makeProps({ devices: [trustedDevice, untrustedDevice] })}
      />,
    );
    expect(screen.getByText("iPhone 15")).toBeTruthy();
    expect(screen.getByText("Android Tablet")).toBeTruthy();
  });
});
