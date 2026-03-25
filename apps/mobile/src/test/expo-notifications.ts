import { vi } from "vitest";

export const AndroidImportance = {
  DEFAULT: 3,
  HIGH: 4,
  LOW: 2,
  MAX: 5,
  MIN: 1,
  NONE: 0,
} as const;

export const getPermissionsAsync = vi.fn().mockResolvedValue({ status: "granted" });
export const requestPermissionsAsync = vi.fn().mockResolvedValue({ status: "granted" });
export const getExpoPushTokenAsync = vi.fn().mockResolvedValue({ data: "ExponentPushToken[test-token]" });
export const setNotificationHandler = vi.fn();
export const setNotificationChannelAsync = vi.fn().mockResolvedValue(undefined);
export const scheduleNotificationAsync = vi.fn().mockResolvedValue("notif-id-1");
export const addNotificationReceivedListener = vi.fn(() => ({ remove: vi.fn() }));
export const addNotificationResponseReceivedListener = vi.fn(() => ({ remove: vi.fn() }));
