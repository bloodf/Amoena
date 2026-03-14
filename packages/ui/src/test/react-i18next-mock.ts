// Mock for react-i18next used in unit tests (package not installed in this workspace)
export function useTranslation() {
  return {
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: () => Promise.resolve() },
  };
}

export function Trans({ children }: { children?: React.ReactNode }) {
  return children;
}

export function I18nextProvider({ children }: { children?: React.ReactNode }) {
  return children;
}

import type React from "react";
