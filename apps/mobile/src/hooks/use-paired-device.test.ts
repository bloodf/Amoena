import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePairedDevice } from "./use-paired-device";
import type { PairedDevice } from "@/lib/storage";

const mockLoadPairedDevices = vi.fn();
const mockAddPairedDevice = vi.fn();
const mockRemovePairedDevice = vi.fn();

vi.mock("@/lib/storage", () => ({
  loadPairedDevices: (...args: unknown[]) => mockLoadPairedDevices(...args),
  addPairedDevice: (...args: unknown[]) => mockAddPairedDevice(...args),
  removePairedDevice: (...args: unknown[]) => mockRemovePairedDevice(...args),
}));

const device1: PairedDevice = {
  deviceId: "d1",
  deviceName: "MacBook Pro",
  baseUrl: "http://localhost:47821",
  lastSeen: "2025-01-01T00:00:00Z",
  pairedAt: "2025-01-01T00:00:00Z",
};

const device2: PairedDevice = {
  deviceId: "d2",
  deviceName: "Desktop",
  baseUrl: "http://192.168.1.10:47821",
  lastSeen: "2025-01-02T00:00:00Z",
  pairedAt: "2025-01-02T00:00:00Z",
};

describe("usePairedDevice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadPairedDevices.mockResolvedValue([]);
    mockAddPairedDevice.mockResolvedValue(undefined);
    mockRemovePairedDevice.mockResolvedValue(undefined);
  });

  it("starts in loading state", () => {
    const { result } = renderHook(() => usePairedDevice());
    expect(result.current.isLoading).toBe(true);
  });

  it("loads devices on mount", async () => {
    mockLoadPairedDevices.mockResolvedValue([device1]);
    const { result } = renderHook(() => usePairedDevice());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.devices).toHaveLength(1);
    expect(result.current.devices[0].deviceId).toBe("d1");
  });

  it("sets isPaired to false when no devices", async () => {
    mockLoadPairedDevices.mockResolvedValue([]);
    const { result } = renderHook(() => usePairedDevice());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isPaired).toBe(false);
    expect(result.current.activeDevice).toBeNull();
  });

  it("sets isPaired to true when devices exist", async () => {
    mockLoadPairedDevices.mockResolvedValue([device1]);
    const { result } = renderHook(() => usePairedDevice());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isPaired).toBe(true);
  });

  it("auto-selects the last device as active", async () => {
    mockLoadPairedDevices.mockResolvedValue([device1, device2]);
    const { result } = renderHook(() => usePairedDevice());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activeDevice?.deviceId).toBe("d2");
  });

  it("adds a device and sets it as active", async () => {
    mockLoadPairedDevices.mockResolvedValue([]);
    const { result } = renderHook(() => usePairedDevice());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addDevice(device1);
    });

    expect(mockAddPairedDevice).toHaveBeenCalledWith(device1);
    expect(result.current.devices).toHaveLength(1);
    expect(result.current.activeDevice?.deviceId).toBe("d1");
  });

  it("removes a device", async () => {
    mockLoadPairedDevices.mockResolvedValue([device1, device2]);
    const { result } = renderHook(() => usePairedDevice());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.removeDevice("d1");
    });

    expect(mockRemovePairedDevice).toHaveBeenCalledWith("d1");
    expect(result.current.devices).toHaveLength(1);
    expect(result.current.devices[0].deviceId).toBe("d2");
  });

  it("clears active device when the active one is removed", async () => {
    mockLoadPairedDevices.mockResolvedValue([device1]);
    const { result } = renderHook(() => usePairedDevice());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activeDevice?.deviceId).toBe("d1");

    await act(async () => {
      await result.current.removeDevice("d1");
    });

    expect(result.current.activeDevice).toBeNull();
    expect(result.current.isPaired).toBe(false);
  });

  it("allows manually setting the active device", async () => {
    mockLoadPairedDevices.mockResolvedValue([device1, device2]);
    const { result } = renderHook(() => usePairedDevice());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setActiveDeviceId("d1");
    });

    expect(result.current.activeDevice?.deviceId).toBe("d1");
  });

  it("replaces existing device when adding with same id", async () => {
    mockLoadPairedDevices.mockResolvedValue([device1]);
    const { result } = renderHook(() => usePairedDevice());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updatedDevice = { ...device1, deviceName: "Updated MacBook" };
    await act(async () => {
      await result.current.addDevice(updatedDevice);
    });

    expect(result.current.devices).toHaveLength(1);
    expect(result.current.devices[0].deviceName).toBe("Updated MacBook");
  });

  it("refresh reloads devices from storage", async () => {
    mockLoadPairedDevices.mockResolvedValue([]);
    const { result } = renderHook(() => usePairedDevice());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockLoadPairedDevices.mockResolvedValue([device1]);
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.devices).toHaveLength(1);
  });
});
