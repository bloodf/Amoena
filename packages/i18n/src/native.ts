import { getLocales } from "expo-localization";

export { AmoenaI18nProvider } from "./react";

export function resolveNativeLocale() {
  return getLocales()[0]?.languageTag ?? "en";
}
