import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { LunariaI18nProvider, resolveNativeLocale } from "@lunaria/i18n/native";
import { RuntimeProvider } from "@/runtime/provider";

export default function RootLayout() {
  return (
    <LunariaI18nProvider locale={resolveNativeLocale()}>
      <RuntimeProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#020617" },
            headerTintColor: "#F8FAFC",
            contentStyle: { backgroundColor: "#020617" },
          }}
        />
      </RuntimeProvider>
    </LunariaI18nProvider>
  );
}
