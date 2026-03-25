import { describe, expect, it } from 'vitest';

import { TAB_CONFIG, TAB_SCREEN_OPTIONS } from './TabNavigator';

describe('TabNavigator', () => {
  describe('TAB_CONFIG', () => {
    it('exports 4 tabs', () => {
      expect(TAB_CONFIG).toHaveLength(4);
    });

    it('each tab has name, title, and icon', () => {
      for (const tab of TAB_CONFIG) {
        expect(tab).toHaveProperty('name');
        expect(tab).toHaveProperty('title');
        expect(tab).toHaveProperty('icon');
      }
    });

    it('tab names are unique', () => {
      const names = TAB_CONFIG.map((t) => t.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('includes Home, History, Permissions, and More tabs', () => {
      const titles = TAB_CONFIG.map((t) => t.title);
      expect(titles).toContain('Home');
      expect(titles).toContain('History');
      expect(titles).toContain('Approvals');
      expect(titles).toContain('More');
    });
  });

  describe('TAB_SCREEN_OPTIONS', () => {
    it('headerShown is false', () => {
      expect(TAB_SCREEN_OPTIONS.headerShown).toBe(false);
    });

    it('tabBarStyle has backgroundColor and borderTopColor', () => {
      expect(TAB_SCREEN_OPTIONS.tabBarStyle).toHaveProperty('backgroundColor');
      expect(TAB_SCREEN_OPTIONS.tabBarStyle).toHaveProperty('borderTopColor');
    });

    it('tabBarActiveTintColor and tabBarInactiveTintColor are set', () => {
      expect(TAB_SCREEN_OPTIONS.tabBarActiveTintColor).toBeTruthy();
      expect(TAB_SCREEN_OPTIONS.tabBarInactiveTintColor).toBeTruthy();
    });
  });
});
