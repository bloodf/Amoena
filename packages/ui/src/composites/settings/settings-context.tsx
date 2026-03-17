import { createContext, useContext, useCallback } from "react";
import type { ReactNode } from "react";
import { settingDefaults } from "./setting-defaults";

type SettingsContextValue = {
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
};

const SettingsContext = createContext<SettingsContextValue>({
  values: { ...settingDefaults },
  onChange: () => {},
});

export function SettingsProvider({
  values,
  onChange,
  children,
}: {
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  children: ReactNode;
}) {
  return (
    <SettingsContext.Provider value={{ values, onChange }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

export function useSettingValue<T>(key: string, fallback?: T): [T, (value: T) => void] {
  const { values, onChange } = useContext(SettingsContext);
  const resolved = (values[key] ?? settingDefaults[key] ?? fallback) as T;
  const setter = useCallback((value: T) => onChange(key, value), [key, onChange]);
  return [resolved, setter];
}
