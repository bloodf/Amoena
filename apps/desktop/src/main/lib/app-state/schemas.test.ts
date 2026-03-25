import { describe, expect, it } from 'bun:test';
import { createDefaultHotkeysState } from 'shared/hotkeys';
import type { AppState, ThemeState, TabsState } from './schemas';
import { defaultAppState } from './schemas';

describe('app-state/schemas', () => {
  it('exports a default app state with empty tab state', () => {
    expect(defaultAppState.tabsState).toEqual({
      tabs: [],
      panes: {},
      activeTabIds: {},
      focusedPaneIds: {},
      tabHistoryStacks: {},
    });
  });

  it('uses the dark theme by default', () => {
    expect(defaultAppState.themeState).toEqual({
      activeThemeId: 'dark',
      customThemes: [],
    });
  });

  it('hydrates hotkeys state from the shared default factory', () => {
    expect(defaultAppState.hotkeysState).toEqual(createDefaultHotkeysState());
  });

  it('is assignable to the exported AppState and TabsState types', () => {
    const appState: AppState = defaultAppState;
    const tabsState: TabsState = appState.tabsState;
    const themeState: ThemeState = appState.themeState;

    expect(tabsState.tabs).toHaveLength(0);
    expect(themeState.activeThemeId).toBe('dark');
  });
});
