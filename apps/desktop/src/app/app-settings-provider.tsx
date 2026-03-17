import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useLunariaTranslation } from "@lunaria/i18n/react";

import { settingDefaults } from "@/composites/settings/setting-defaults";
import { SettingsProvider } from "@/composites/settings/settings-context";
import { useRuntimeApi } from "./runtime-api";

const accentColorMap: Record<string, { dark: string; light: string }> = {
  Magenta: { dark: "300 100% 36%", light: "300 80% 40%" },
  Purple: { dark: "279 74% 51%", light: "279 70% 50%" },
  Blue: { dark: "217 89% 61%", light: "217 85% 50%" },
  Teal: { dark: "174 70% 40%", light: "174 65% 35%" },
  Orange: { dark: "25 95% 53%", light: "25 90% 48%" },
  Rose: { dark: "327 100% 40%", light: "327 80% 45%" },
};

const languageToLocale: Record<string, string> = {
  English: "en",
  "Português (BR)": "pt-BR",
  Español: "es",
  Français: "fr",
  Deutsch: "de",
};

const themeToClass: Record<string, "dark" | "light"> = {
  Dark: "dark",
  Light: "light",
  System: typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark",
};

type SettingsPayload = {
  settings?: Record<string, unknown>;
};

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { request } = useRuntimeApi();
  const { i18n } = useLunariaTranslation();

  const [values, setValues] = useState<Record<string, unknown>>({ ...settingDefaults });
  const [loaded, setLoaded] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    void request<SettingsPayload>("/api/v1/settings").then((payload) => {
      const serverSettings = payload.settings ?? {};
      setValues((prev) => ({ ...prev, ...serverSettings }));
      setSettingsError(null);
    }).catch((err) => {
      console.warn("[Lunaria] Settings API unavailable, using defaults:", err);
      setSettingsError("Settings could not be loaded — using defaults");
    }).finally(() => {
      setLoaded(true);
    });
  }, []);

  const handleChange = useCallback(
    (key: string, value: unknown) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      void request<void>("/api/v1/settings", {
        method: "POST",
        body: JSON.stringify({ values: { [key]: value } }),
      });
    },
    [request],
  );

  // --- Theme effect ---
  const theme = values["general.theme"] as string;
  useEffect(() => {
    const root = document.documentElement;
    const resolved = themeToClass[theme] ?? "dark";
    if (resolved === "light") {
      root.classList.add("light");
    } else {
      root.classList.remove("light");
    }
    localStorage.setItem("lunaria-theme", resolved);
  }, [theme]);

  // --- System theme listener for "System" option ---
  useEffect(() => {
    if (theme !== "System") return;
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add("light");
      } else {
        root.classList.remove("light");
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  // --- Accent color effect ---
  const accentColor = values["themes.accentColor"] as string;
  useEffect(() => {
    const root = document.documentElement;
    const isLight = root.classList.contains("light");
    const colors = accentColorMap[accentColor];
    if (colors) {
      const hsl = isLight ? colors.light : colors.dark;
      root.style.setProperty("--primary", hsl);
      root.style.setProperty("--ring", hsl);
      root.style.setProperty("--sidebar-primary", hsl);
      root.style.setProperty("--sidebar-ring", hsl);
    }
  }, [accentColor, theme]);

  // --- Language effect ---
  const language = values["general.language"] as string;
  useEffect(() => {
    const locale = languageToLocale[language];
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [language, i18n]);

  return (
    <SettingsProvider values={values} onChange={handleChange}>
      {settingsError ? (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-900/90 px-4 py-2 text-center text-xs text-yellow-200">
          {settingsError}
        </div>
      ) : null}
      {children}
    </SettingsProvider>
  );
}
