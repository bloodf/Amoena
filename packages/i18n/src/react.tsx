import { useMemo, type ReactNode } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { createAmoenaI18n } from "./create-i18n";

export function AmoenaI18nProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale?: string;
}) {
  const i18n = useMemo(() => createAmoenaI18n({ locale }), [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export const useAmoenaTranslation = useTranslation;
