import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { RelayMessage } from "./types";

/**
 * Configure how notifications appear when the app is in the foreground.
 */
export function configureForegroundHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowInForeground: true,
    }),
  });
}

/**
 * Request notification permissions from the user.
 * Returns `true` when permissions are granted.
 */
export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();

  if (existing === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Register the device and return an Expo push token.
 * Returns `null` if permissions are not granted or unavailable.
 */
export async function getExpoPushToken(): Promise<string | null> {
  const granted = await requestPermissions();

  if (!granted) {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#38BDF8",
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

/**
 * Subscribe to notifications received while the app is in the foreground.
 * Returns a subscription that should be removed on cleanup.
 */
export function onNotificationReceived(
  callback: (notification: Notifications.Notification) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Subscribe to notification responses (user tapped a notification).
 * Returns a subscription that should be removed on cleanup.
 */
export function onNotificationResponse(
  callback: (response: Notifications.NotificationResponse) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Schedule a local notification from a relay message (e.g. permission request).
 */
export async function scheduleRelayNotification(message: RelayMessage): Promise<void> {
  const title = resolveNotificationTitle(message.type);
  const body = typeof message.payload === "string"
    ? message.payload
    : JSON.stringify(message.payload);

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: message.type, sessionId: message.sessionId },
    },
    trigger: null, // fire immediately
  });
}

function resolveNotificationTitle(type: string): string {
  switch (type) {
    case "permission.requested":
      return "Permission Required";
    case "session.completed":
      return "Session Completed";
    case "session.errored":
      return "Session Error";
    case "cost.alert":
      return "Cost Alert";
    default:
      return "Amoena";
  }
}
