import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AmoenaI18nProvider, resolveNativeLocale } from "@lunaria/i18n/native";
import { RuntimeProvider } from "@/runtime/provider";
import { ROOT_STACK_OPTIONS } from "@/navigation/RootNavigator";

export default function RootLayout() {
  return (
    <AmoenaI18nProvider locale={resolveNativeLocale()}>
      <RuntimeProvider>
        <StatusBar style="light" />
        <Stack screenOptions={ROOT_STACK_OPTIONS} />
      </RuntimeProvider>
    </AmoenaI18nProvider>
  );
}
