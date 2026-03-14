import { useMemo, type ReactNode } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { createLunariaI18n } from "./create-i18n";

export function LunariaI18nProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale?: string;
}) {
  const i18n = useMemo(() => createLunariaI18n({ locale }), [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export const useLunariaTranslation = useTranslation;
