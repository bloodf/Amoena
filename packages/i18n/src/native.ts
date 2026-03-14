import { getLocales } from "expo-localization";

export { LunariaI18nProvider } from "./react";

export function resolveNativeLocale() {
  return getLocales()[0]?.languageTag ?? "en";
}
