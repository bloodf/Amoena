/**
 * Hook for managing pairing state between the mobile app and desktop instance.
 *
 * Tracks paired/unpaired status, device info, and last seen timestamp.
 */

import { useCallback, useEffect, useState } from "react";

import {
  addPairedDevice,
  loadPairedDevices,
  removePairedDevice,
  type PairedDevice,
} from "@/lib/storage";

export type UsePairedDeviceResult = {
  readonly devices: readonly PairedDevice[];
  readonly activeDevice: PairedDevice | null;
  readonly isPaired: boolean;
  readonly isLoading: boolean;
  readonly addDevice: (device: PairedDevice) => Promise<void>;
  readonly removeDevice: (deviceId: string) => Promise<void>;
  readonly setActiveDeviceId: (deviceId: string | null) => void;
  readonly refresh: () => Promise<void>;
};

export function usePairedDevice(): UsePairedDeviceResult {
  const [devices, setDevices] = useState<readonly PairedDevice[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const loaded = await loadPairedDevices();
    setDevices(loaded);
    if (loaded.length > 0 && !activeDeviceId) {
      setActiveDeviceId(loaded[loaded.length - 1].deviceId);
    }
    setIsLoading(false);
  }, [activeDeviceId]);

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addDeviceCallback = useCallback(
    async (device: PairedDevice) => {
      await addPairedDevice(device);
      setDevices((prev) => {
        const filtered = prev.filter((d) => d.deviceId !== device.deviceId);
        return [...filtered, device];
      });
      setActiveDeviceId(device.deviceId);
    },
    [],
  );

  const removeDeviceCallback = useCallback(
    async (deviceId: string) => {
      await removePairedDevice(deviceId);
      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
      if (activeDeviceId === deviceId) {
        setActiveDeviceId(null);
      }
    },
    [activeDeviceId],
  );

  const activeDevice =
    devices.find((d) => d.deviceId === activeDeviceId) ?? null;

  return {
    devices,
    activeDevice,
    isPaired: activeDevice !== null,
    isLoading,
    addDevice: addDeviceCallback,
    removeDevice: removeDeviceCallback,
    setActiveDeviceId,
    refresh,
  };
}
