import { en } from '../../../i18n/src/resources/en';

function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flatten(value as Record<string, unknown>, fullKey));
    }
  }
  return result;
}

const realTranslations = flatten(en as unknown as Record<string, unknown>);

const missingKeys = {
  'ui.alerts': 'Alerts',
  'ui.remote': 'Remote',
  'ui.category': 'Category',
  'ui.binding': 'Binding',
  'ui.section': 'Section',
  'ui.plus': 'Plus',
  'ui.settings': 'Settings',
  'ui.gripHandle': 'Grip handle',
  'ui.edit': 'Edit',
  'ui.rename': 'Rename',
  'ui.delete': 'Delete',
  'ui.sidePanel': 'Side panel',
  'ui.activeStatus': 'Active',
  'ui.pausedStatus': 'Paused',
  'ui.statusAgents': 'agents',
  'ui.statusDevicesConnected': 'devices connected',
  'ui.providers': 'Providers',
};

const allTranslations = { ...realTranslations, ...missingKeys };

export function useTranslation() {
  return {
    t: (key: string, options?: Record<string, unknown>) => {
      let text = allTranslations[key] ?? key;
      if (options && typeof options === 'object') {
        for (const [k, v] of Object.entries(options)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return text;
    },
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  };
}

export function Trans({ children }: { children?: React.ReactNode }) {
  return children;
}

export function I18nextProvider({ children }: { children?: React.ReactNode }) {
  return children;
}

import type React from 'react';
