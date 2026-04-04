import { describe, expect, test } from "vitest";

import {
  buildCommandPaletteItems,
  commandPaletteTypeLabels,
  type CommandPaletteItem,
} from './data';

describe('commandPaletteTypeLabels', () => {
  test('has labels for all types', () => {
    const types: CommandPaletteItem['type'][] = [
      'command',
      'file',
      'agent',
      'history',
      'navigation',
    ];
    for (const type of types) {
      expect(commandPaletteTypeLabels[type]).toBeTruthy();
    }
  });
});

describe('buildCommandPaletteItems', () => {
  const navigate = () => {};

  test('returns multiple items', () => {
    const items = buildCommandPaletteItems(navigate);
    expect(items.length).toBeGreaterThan(10);
  });

  test('each item has type, icon, and label', () => {
    const items = buildCommandPaletteItems(navigate);
    for (const item of items) {
      expect(item.type).toBeTruthy();
      expect(item.icon).toBeDefined();
      expect(item.label).toBeTruthy();
    }
  });

  test('includes all item types', () => {
    const items = buildCommandPaletteItems(navigate);
    const types = new Set(items.map((i) => i.type));
    expect(types.has('command')).toBe(true);
    expect(types.has('navigation')).toBe(true);
    expect(types.has('file')).toBe(true);
    expect(types.has('agent')).toBe(true);
    expect(types.has('history')).toBe(true);
  });

  test('navigation items have actions', () => {
    const items = buildCommandPaletteItems(navigate);
    const navItems = items.filter((i) => i.type === 'navigation');
    for (const item of navItems) {
      expect(item.action).toBeDefined();
    }
  });

  test('some commands have shortcuts', () => {
    const items = buildCommandPaletteItems(navigate);
    const withShortcuts = items.filter((i) => i.shortcut);
    expect(withShortcuts.length).toBeGreaterThan(0);
  });

  test('file items have descriptions', () => {
    const items = buildCommandPaletteItems(navigate);
    const fileItems = items.filter((i) => i.type === 'file');
    for (const item of fileItems) {
      expect(item.description).toBeTruthy();
    }
  });

  test('calls navigate when action is invoked', () => {
    let navigatedTo = '';
    const mockNavigate = (path: string) => {
      navigatedTo = path;
    };
    const items = buildCommandPaletteItems(mockNavigate);
    const settingsItem = items.find((i) => i.label === 'Settings');
    expect(settingsItem).toBeDefined();
    settingsItem!.action!();
    expect(navigatedTo).toBe('/settings');
  });
});
