import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

import * as Notifications from "expo-notifications";
import {
  configureForegroundHandler,
  getExpoPushToken,
  onNotificationReceived,
  onNotificationResponse,
  requestPermissions,
  scheduleRelayNotification,
} from "./notifications";

describe("configureForegroundHandler", () => {
  it("calls setNotificationHandler", () => {
    configureForegroundHandler();
    expect(Notifications.setNotificationHandler).toHaveBeenCalled();
  });
});

describe("requestPermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when already granted", async () => {
    vi.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({
      status: "granted",
    } as any);

    const result = await requestPermissions();
    expect(result).toBe(true);
  });

  it("requests permission when not granted and returns result", async () => {
    vi.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({
      status: "undetermined",
    } as any);
    vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({
      status: "granted",
    } as any);

    const result = await requestPermissions();
    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it("returns false when permission denied", async () => {
    vi.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({
      status: "undetermined",
    } as any);
    vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({
      status: "denied",
    } as any);

    const result = await requestPermissions();
    expect(result).toBe(false);
  });
});

describe("getExpoPushToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns token when permissions granted", async () => {
    vi.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({
      status: "granted",
    } as any);

    const token = await getExpoPushToken();
    expect(token).toBe("ExponentPushToken[test-token]");
  });

  it("returns null when permissions denied", async () => {
    vi.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({
      status: "undetermined",
    } as any);
    vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({
      status: "denied",
    } as any);

    const token = await getExpoPushToken();
    expect(token).toBeNull();
  });
});

describe("onNotificationReceived", () => {
  it("registers a listener", () => {
    const callback = vi.fn();
    const sub = onNotificationReceived(callback);
    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalledWith(callback);
    expect(sub).toBeDefined();
  });
});

describe("onNotificationResponse", () => {
  it("registers a response listener", () => {
    const callback = vi.fn();
    const sub = onNotificationResponse(callback);
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalledWith(callback);
    expect(sub).toBeDefined();
  });
});

describe("scheduleRelayNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("schedules notification for permission.requested", async () => {
    await scheduleRelayNotification({
      type: "permission.requested",
      payload: "Allow file access?",
      timestamp: "2025-01-01T00:00:00Z",
      sessionId: "s1",
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: "Permission Required",
        body: "Allow file access?",
        data: { type: "permission.requested", sessionId: "s1" },
      },
      trigger: null,
    });
  });

  it("schedules notification for session.completed", async () => {
    await scheduleRelayNotification({
      type: "session.completed",
      payload: "Session done",
      timestamp: "2025-01-01T00:00:00Z",
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: "Session Completed" }),
      }),
    );
  });

  it("schedules notification with default title for unknown type", async () => {
    await scheduleRelayNotification({
      type: "unknown.event",
      payload: "something happened",
      timestamp: "2025-01-01T00:00:00Z",
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ title: "Amoena" }),
      }),
    );
  });

  it("JSON-stringifies object payloads", async () => {
    await scheduleRelayNotification({
      type: "cost.alert",
      payload: { cost: 5.0 },
      timestamp: "2025-01-01T00:00:00Z",
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: "Cost Alert",
          body: JSON.stringify({ cost: 5.0 }),
        }),
      }),
    );
  });
});
