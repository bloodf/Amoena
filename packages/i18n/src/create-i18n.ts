import { createInstance, type i18n, type Resource } from "i18next";
import { initReactI18next } from "react-i18next";

import { de } from "./resources/de";
import { en } from "./resources/en";
import { es } from "./resources/es";
import { fr } from "./resources/fr";
import { ptBR } from "./resources/pt-BR";
import type { LunariaLocale } from "./types";

const resources: Resource = {
  en: { translation: en },
  "pt-BR": { translation: ptBR },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
};

export function normalizeLocale(locale?: string): LunariaLocale {
  const normalized = locale?.toLowerCase();

  if (!normalized) {
    return "en";
  }

  if (normalized.startsWith("pt")) {
    return "pt-BR";
  }

  if (normalized.startsWith("es")) {
    return "es";
  }

  if (normalized.startsWith("fr")) {
    return "fr";
  }

  if (normalized.startsWith("de")) {
    return "de";
  }

  return "en";
}

export function createLunariaI18n(options?: { locale?: string }): i18n {
  const instance = createInstance();

  void instance.use(initReactI18next).init({
    resources,
    lng: normalizeLocale(options?.locale),
    fallbackLng: "en",
    initImmediate: false,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });

  return instance;
}
