import type { ReactNode } from "react";
import { Pressable } from "react-native";

export function Stack({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

Stack.Screen = function Screen() {
  return null;
};

export const router = {
  push: () => {},
  replace: () => {},
};

export function useLocalSearchParams<T extends Record<string, string>>() {
  return { sessionId: "session-1" } as unknown as T;
}

export function Link({
  children,
  href,
  asChild,
}: {
  children?: ReactNode;
  href: string;
  asChild?: boolean;
}) {
  if (asChild) {
    return <>{children}</>;
  }
  return <Pressable accessibilityRole="link" accessibilityLabel={href}>{children}</Pressable>;
}
