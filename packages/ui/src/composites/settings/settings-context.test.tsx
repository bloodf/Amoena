import { act, render, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'bun:test';
import * as React from 'react';

import { SettingsProvider, useSettings, useSettingValue } from './settings-context';

describe('SettingsProvider', () => {
  test('renders children', () => {
    const { getByText } = render(
      <SettingsProvider values={{}} onChange={() => {}}>
        <span>child content</span>
      </SettingsProvider>,
    );
    expect(getByText('child content')).toBeTruthy();
  });

  test('provides values and onChange via context', () => {
    const onChange = () => {};
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => (
        <SettingsProvider values={{ 'foo.bar': 42 }} onChange={onChange}>
          {children}
        </SettingsProvider>
      ),
    });
    expect(result.current.values['foo.bar']).toBe(42);
    expect(typeof result.current.onChange).toBe('function');
  });
});

describe('useSettings', () => {
  test('returns values from context', () => {
    const values = { 'test.key': 'value' };
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => (
        <SettingsProvider values={values} onChange={() => {}}>
          {children}
        </SettingsProvider>
      ),
    });
    expect(result.current.values['test.key']).toBe('value');
  });

  test('onChange is called when settings change', () => {
    const onChange = () => {};
    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) => (
        <SettingsProvider values={{}} onChange={onChange}>
          {children}
        </SettingsProvider>
      ),
    });
    act(() => {
      result.current.onChange('new.key', 'new-value');
    });
    expect(onChange).toHaveBeenCalled();
  });
});

describe('useSettingValue', () => {
  test('returns current value for a known key', () => {
    const { result } = renderHook(() => useSettingValue('editor.fontSize', 13), {
      wrapper: ({ children }) => (
        <SettingsProvider values={{ 'editor.fontSize': 16 }} onChange={() => {}}>
          {children}
        </SettingsProvider>
      ),
    });
    const [value] = result.current;
    expect(value).toBe(16);
  });

  test('falls back to settingDefaults when key not in values', () => {
    const { result } = renderHook(() => useSettingValue('general.theme', 'Dark'), {
      wrapper: ({ children }) => (
        <SettingsProvider values={{}} onChange={() => {}}>
          {children}
        </SettingsProvider>
      ),
    });
    const [value] = result.current;
    // settingDefaults["general.theme"] = "Dark", so fallback is used
    expect(value).toBe('Dark');
  });

  test('falls back to explicit fallback when key not in values or defaults', () => {
    const { result } = renderHook(() => useSettingValue('nonexistent.key', 'fallback'), {
      wrapper: ({ children }) => (
        <SettingsProvider values={{}} onChange={() => {}}>
          {children}
        </SettingsProvider>
      ),
    });
    const [value] = result.current;
    expect(value).toBe('fallback');
  });

  test('setter calls onChange with correct key', () => {
    const onChange = () => {};
    const { result } = renderHook(() => useSettingValue('theme', 'dark'), {
      wrapper: ({ children }) => (
        <SettingsProvider values={{}} onChange={onChange}>
          {children}
        </SettingsProvider>
      ),
    });
    const [, setter] = result.current;
    act(() => {
      setter('light');
    });
    expect(onChange).toHaveBeenCalledWith('theme', 'light');
  });
});
