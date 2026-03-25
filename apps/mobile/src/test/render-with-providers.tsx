import { type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";

import { AmoenaI18nProvider } from "@lunaria/i18n";
import { RuntimeProvider } from "@/runtime/provider";
import type { RuntimeSessionStorage } from "@/runtime/storage";

const noopStorage: RuntimeSessionStorage = {
  load: async () => null,
  save: async () => {},
  clear: async () => {},
};

type ProviderOptions = {
  storage?: RuntimeSessionStorage;
  locale?: string;
};

function AllProviders({ children, options }: { children: ReactNode; options?: ProviderOptions }) {
  return (
    <AmoenaI18nProvider locale={options?.locale ?? "en"}>
      <RuntimeProvider storage={options?.storage ?? noopStorage}>
        {children}
      </RuntimeProvider>
    </AmoenaI18nProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: ProviderOptions & Omit<RenderOptions, "wrapper">,
) {
  const { storage, locale, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders options={{ storage, locale }}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}
