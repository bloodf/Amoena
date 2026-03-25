/**
 * Bottom tab navigation configuration.
 *
 * Tabs: Home, History, Settings
 *
 * This file exports the tab configuration used by the expo-router
 * Tabs layout in app/(tabs)/_layout.tsx.
 */

import { tokens } from "@/theme/tokens";

export type TabConfig = {
  readonly name: string;
  readonly title: string;
  readonly icon: string;
};

export const TAB_CONFIG: readonly TabConfig[] = [
  { name: "index", title: "Home", icon: ">" },
  { name: "history", title: "History", icon: "#" },
  { name: "permissions", title: "Approvals", icon: "!" },
  { name: "more", title: "More", icon: "..." },
];

export const TAB_SCREEN_OPTIONS = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: tokens.colorBackground,
    borderTopColor: tokens.colorBorder,
  },
  tabBarActiveTintColor: tokens.colorPrimary,
  tabBarInactiveTintColor: tokens.colorTextTertiary,
} as const;
