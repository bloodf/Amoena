// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SettingsContentPane, isEmbeddedSettingsSection } from './SettingsContentPane';

// Mock screens
vi.mock('@/screens/ProviderSetupScreen', () => ({
  ProviderSetupScreen: () => <div data-testid="provider-setup-screen">Provider Setup</div>,
}));
vi.mock('@/screens/RemoteAccessScreen', () => ({
  RemoteAccessScreen: () => <div data-testid="remote-access-screen">Remote Access</div>,
}));
vi.mock('@/screens/OpinionsScreen', () => ({
  OpinionsScreen: () => <div data-testid="opinions-screen">Opinions</div>,
}));

// Mock sections
vi.mock('./sections', () => ({
  AdvancedSettingsSection: () => <div data-testid="section">Advanced</div>,
  EditorSettingsSection: () => <div data-testid="section">Editor</div>,
  GeneralSettingsSection: () => <div data-testid="section">General</div>,
  KeybindingsSettingsSection: () => <div data-testid="section">Keybindings</div>,
  MemorySettingsSection: () => <div data-testid="section">Memory</div>,
  NotificationsSettingsSection: () => <div data-testid="section">Notifications</div>,
  PermissionsSettingsSection: () => <div data-testid="section">Permissions</div>,
  PluginsSettingsSection: () => <div data-testid="section">Plugins</div>,
  PrivacySettingsSection: () => <div data-testid="section">Privacy</div>,
  SessionSettingsSection: () => <div data-testid="section">Session</div>,
  TerminalSettingsSection: () => <div data-testid="section">Terminal</div>,
  ThemesSettingsSection: () => <div data-testid="section">Themes</div>,
  WorkspaceSettingsSection: () => <div data-testid="section">Workspace</div>,
}));

// Mock data
vi.mock('./data', () => ({
  settingsSections: [
    { id: 'general', label: 'General' },
    { id: 'editor', label: 'Editor' },
    { id: 'providers', label: 'Providers' },
    { id: 'opinions', label: 'Opinions' },
    { id: 'memory', label: 'Memory' },
  ],
}));

describe('SettingsContentPane', () => {
  test('renders general settings section', () => {
    render(<SettingsContentPane activeSection="general" />);
    expect(screen.getByTestId('section')).toBeTruthy();
  });

  test('renders editor settings section', () => {
    render(<SettingsContentPane activeSection="editor" />);
    expect(screen.getByTestId('section')).toBeTruthy();
  });

  test('renders embedded provider setup screen', () => {
    render(<SettingsContentPane activeSection="providers" />);
    expect(screen.getByTestId('provider-setup-screen')).toBeTruthy();
  });

  test('renders embedded opinions screen', () => {
    render(<SettingsContentPane activeSection="opinions" />);
    expect(screen.getByTestId('opinions-screen')).toBeTruthy();
  });

  test('shows fallback message for unknown section', () => {
    render(<SettingsContentPane activeSection="unknown-section" />);
    expect(screen.getByText(/will appear here/)).toBeTruthy();
  });

  test('shows fallback with section label', () => {
    render(<SettingsContentPane activeSection="providers" />);
    expect(screen.getByText('Provider Setup')).toBeTruthy();
  });
});

describe('isEmbeddedSettingsSection', () => {
  test('returns true for embedded sections', () => {
    expect(isEmbeddedSettingsSection('providers')).toBe(true);
    expect(isEmbeddedSettingsSection('remote')).toBe(true);
    expect(isEmbeddedSettingsSection('opinions')).toBe(true);
  });

  test('returns false for non-embedded sections', () => {
    expect(isEmbeddedSettingsSection('general')).toBe(false);
    expect(isEmbeddedSettingsSection('editor')).toBe(false);
    expect(isEmbeddedSettingsSection('memory')).toBe(false);
  });

  test('returns false for unknown sections', () => {
    expect(isEmbeddedSettingsSection('unknown')).toBe(false);
  });
});
