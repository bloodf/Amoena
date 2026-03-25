// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
  SessionSettingsSection,
  MemorySettingsSection,
  PermissionsSettingsSection,
} from './session-sections';

// Mock settings-controls components
vi.mock('@/components/settings-controls', () => ({
  SettingsInfoBanner: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="info-banner">{children}</div>
  ),
  SettingsNumberInput: ({ defaultValue, width }: { defaultValue?: number; width?: string }) => (
    <input data-testid="number-input" type="number" defaultValue={defaultValue} className={width} />
  ),
  SettingsRow: ({
    label,
    description,
    children,
  }: {
    label: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="settings-row">
      <span data-testid="row-label">{label}</span>
      {description && <span data-testid="row-desc">{description}</span>}
      {children}
    </div>
  ),
  SettingsSectionTitle: ({ title }: { title: string }) => (
    <div data-testid="section-title">{title}</div>
  ),
  SettingsSelect: ({ options, defaultValue }: { options: string[]; defaultValue?: string }) => (
    <select data-testid="select" defaultValue={defaultValue}>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  ),
  SettingsToggle: ({ on }: { on?: boolean }) => (
    <button data-testid="toggle" data-active={on ? 'true' : 'false'}>
      {on ? 'ON' : 'OFF'}
    </button>
  ),
}));

describe('SessionSettingsSection', () => {
  test('renders section title', () => {
    render(<SessionSettingsSection />);
    expect(screen.getAllByTestId('section-title')).toHaveLength(2);
    expect(screen.getByText('Defaults')).toBeTruthy();
    expect(screen.getByText('New Session Behavior')).toBeTruthy();
  });

  test('renders default model row', () => {
    render(<SessionSettingsSection />);
    expect(screen.getByText('Default model')).toBeTruthy();
    expect(screen.getByText('Default reasoning mode')).toBeTruthy();
  });

  test('renders settings rows with selects', () => {
    render(<SessionSettingsSection />);
    const selects = screen.getAllByTestId('select');
    expect(selects.length).toBeGreaterThan(0);
  });

  test('renders toggles for boolean settings', () => {
    render(<SessionSettingsSection />);
    const toggles = screen.getAllByTestId('toggle');
    expect(toggles.length).toBe(2);
  });

  test('renders number input for max context tokens', () => {
    render(<SessionSettingsSection />);
    const numberInput = screen.getByTestId('number-input');
    expect(numberInput).toBeTruthy();
    expect((numberInput as HTMLInputElement).defaultValue).toBe('32000');
  });
});

describe('MemorySettingsSection', () => {
  test('renders section titles', () => {
    render(<MemorySettingsSection />);
    expect(screen.getByText('Observation')).toBeTruthy();
    expect(screen.getByText('Injection')).toBeTruthy();
    expect(screen.getByText('Data')).toBeTruthy();
  });

  test('renders Export, Import, and Clear buttons', () => {
    render(<MemorySettingsSection />);
    expect(screen.getByText('Export Memory')).toBeTruthy();
    expect(screen.getByText('Import Memory')).toBeTruthy();
    expect(screen.getByText('Clear All')).toBeTruthy();
  });

  test('renders select for retention setting', () => {
    render(<MemorySettingsSection />);
    const selects = screen.getAllByTestId('select');
    expect(selects.length).toBeGreaterThan(0);
  });
});

describe('PermissionsSettingsSection', () => {
  test('renders section titles', () => {
    render(<PermissionsSettingsSection />);
    expect(screen.getByText('Default Behavior')).toBeTruthy();
    expect(screen.getByText('High-Risk Actions')).toBeTruthy();
    expect(screen.getByText('Per-Workspace Overrides')).toBeTruthy();
  });

  test('renders info banner for per-workspace overrides', () => {
    render(<PermissionsSettingsSection />);
    expect(screen.getByTestId('info-banner')).toBeTruthy();
  });

  test('renders permission policy selects', () => {
    render(<PermissionsSettingsSection />);
    const selects = screen.getAllByTestId('select');
    expect(selects.length).toBeGreaterThanOrEqual(5);
  });
});
