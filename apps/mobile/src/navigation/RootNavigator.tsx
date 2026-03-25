/**
 * Root navigation configuration.
 *
 * Stack navigator wrapping the bottom tabs plus the RunDetail screen
 * (pushed on top of tabs when tapping a run).
 *
 * This file exports screen options used by app/_layout.tsx.
 */

import { tokens } from "@/theme/tokens";

export const ROOT_STACK_OPTIONS = {
  headerStyle: { backgroundColor: tokens.colorBackground },
  headerTintColor: tokens.colorTextPrimary,
  contentStyle: { backgroundColor: tokens.colorBackground },
} as const;

export type RootStackParamList = {
  "(tabs)": undefined;
  "session/[sessionId]": { sessionId: string };
  "run/[goalId]": { goalId: string };
  settings: undefined;
  pair: undefined;
  device: undefined;
  extensions: undefined;
  workspaces: undefined;
};
