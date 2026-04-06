import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { SetupWizardWelcomeStep } from './WelcomeStep';
import { SetupWizardProviderStep } from './ProviderStep';
import { SetupWizardModelStep } from './ModelStep';
import { SetupWizardBackendStep } from './BackendStep';
import { SetupWizardMemoryStep } from './MemoryStep';
import { SetupWizardProfileStep } from './ProfileStep';
import { SetupWizardCompatStep } from './CompatStep';
import { SetupWizardFooter } from './SetupWizardFooter';
import { SetupWizardProgress } from './SetupWizardProgress';
import { SetupWizardPreferencesStep } from './PreferencesStep';
import { SetupWizardReadyStep } from './ReadyStep';
import { SetupWizardWorkspaceStep } from './WorkspaceStep';

describe('SetupWizardWelcomeStep', () => {
  test('renders welcome heading and description', () => {
    render(<SetupWizardWelcomeStep />);
    expect(screen.getByText('Welcome to Amoena')).toBeTruthy();
    expect(screen.getByText(/AI-native development environment/)).toBeTruthy();
  });

  test('renders feature cards', () => {
    render(<SetupWizardWelcomeStep />);
    expect(screen.getByText('Native agents')).toBeTruthy();
    expect(screen.getByText('Wrapper mode')).toBeTruthy();
    expect(screen.getByText('Memory system')).toBeTruthy();
  });
});

describe('SetupWizardProviderStep', () => {
  const defaultProps = {
    selectedProvider: 0,
    apiKey: '',
    testStatus: 'idle' as const,
    onSelectProvider: vi.fn(() => {}),
    onApiKeyChange: vi.fn(() => {}),
    onTest: vi.fn(() => {}),
  };

  test('renders heading and provider buttons', () => {
    render(<SetupWizardProviderStep {...defaultProps} />);
    expect(screen.getByText('Connect a Provider')).toBeTruthy();
    expect(screen.getByText('Anthropic')).toBeTruthy();
    expect(screen.getByText('OpenAI')).toBeTruthy();
    expect(screen.getByText('Google')).toBeTruthy();
  });

  test('fires onSelectProvider when clicking a provider', () => {
    const onSelectProvider = vi.fn(() => {});
    render(<SetupWizardProviderStep {...defaultProps} onSelectProvider={onSelectProvider} />);
    fireEvent.click(screen.getByText('OpenAI'));
    expect(onSelectProvider).toHaveBeenCalledWith(1);
  });

  test('renders test connection button', () => {
    render(<SetupWizardProviderStep {...defaultProps} />);
    expect(screen.getByText('Test Connection')).toBeTruthy();
  });

  test('shows testing status', () => {
    render(<SetupWizardProviderStep {...defaultProps} testStatus="testing" />);
    expect(screen.getByText('Testing...')).toBeTruthy();
  });

  test('shows success status', () => {
    render(<SetupWizardProviderStep {...defaultProps} testStatus="success" />);
    expect(screen.getByText('Connected')).toBeTruthy();
  });

  test('shows error status', () => {
    render(<SetupWizardProviderStep {...defaultProps} testStatus="error" />);
    expect(screen.getByText(/Failed/)).toBeTruthy();
  });
});

describe('SetupWizardModelStep', () => {
  test('renders heading', () => {
    render(
      <SetupWizardModelStep
        defaultModel="claude-4-sonnet"
        onDefaultModelChange={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText('Choose a Default Model')).toBeTruthy();
    expect(screen.getByText('Default Model')).toBeTruthy();
  });
});

describe('SetupWizardBackendStep', () => {
  const defaultProps = {
    mode: 'native',
    onModeChange: vi.fn(() => {}),
  };

  test('renders heading and mode buttons', () => {
    render(<SetupWizardBackendStep {...defaultProps} />);
    expect(screen.getByText('Agent Backend')).toBeTruthy();
    expect(screen.getByText('native')).toBeTruthy();
    expect(screen.getByText('wrapper')).toBeTruthy();
  });

  test('renders backend list', () => {
    render(<SetupWizardBackendStep {...defaultProps} />);
    expect(screen.getByText('Claude Code')).toBeTruthy();
    expect(screen.getByText('OpenCode')).toBeTruthy();
    expect(screen.getByText('Codex CLI')).toBeTruthy();
    expect(screen.getByText('Gemini CLI')).toBeTruthy();
  });

  test('fires onModeChange when clicking mode button', () => {
    const onModeChange = vi.fn(() => {});
    render(<SetupWizardBackendStep {...defaultProps} onModeChange={onModeChange} />);
    fireEvent.click(screen.getByText('wrapper'));
    expect(onModeChange).toHaveBeenCalledWith('wrapper');
  });
});

describe('SetupWizardMemoryStep', () => {
  test('renders heading', () => {
    render(<SetupWizardMemoryStep memoryEnabled={true} onMemoryEnabledChange={vi.fn(() => {})} />);
    expect(screen.getByText('Memory System')).toBeTruthy();
    expect(screen.getByText('Enable memory')).toBeTruthy();
  });

  test('renders toggle description', () => {
    render(<SetupWizardMemoryStep memoryEnabled={false} onMemoryEnabledChange={vi.fn(() => {})} />);
    expect(screen.getByText(/Persist observations/)).toBeTruthy();
  });
});

describe('SetupWizardProfileStep', () => {
  const defaultProps = {
    theme: 'dark',
    reasoningMode: 'auto',
    keybindingPreset: 'Default',
    onThemeChange: vi.fn(() => {}),
    onReasoningModeChange: vi.fn(() => {}),
    onKeybindingPresetChange: vi.fn(() => {}),
  };

  test('renders heading', () => {
    render(<SetupWizardProfileStep {...defaultProps} />);
    expect(screen.getByText('Agent Profile')).toBeTruthy();
  });

  test('renders labels for all settings', () => {
    render(<SetupWizardProfileStep {...defaultProps} />);
    expect(screen.getByText('Theme')).toBeTruthy();
    expect(screen.getByText('Reasoning Mode')).toBeTruthy();
    expect(screen.getByText('Keybinding Preset')).toBeTruthy();
  });
});

describe('SetupWizardCompatStep', () => {
  test('renders heading and compatibility info', () => {
    const onLaunch = vi.fn(() => {});
    render(<SetupWizardCompatStep onLaunch={onLaunch} />);
    expect(screen.getByText('Ecosystem Compatibility')).toBeTruthy();
    expect(screen.getByText('Compatibility scan')).toBeTruthy();
  });

  test('fires onLaunch when clicking launch button', () => {
    const onLaunch = vi.fn(() => {});
    render(<SetupWizardCompatStep onLaunch={onLaunch} />);
    fireEvent.click(screen.getByText('Launch Amoena'));
    expect(onLaunch).toHaveBeenCalled();
  });
});

describe('SetupWizardFooter', () => {
  const defaultProps = {
    currentStep: 1,
    lastStep: 6,
    onBack: vi.fn(() => {}),
    onNext: vi.fn(() => {}),
  };

  test('renders back and next buttons', () => {
    render(<SetupWizardFooter {...defaultProps} />);
    expect(screen.getByText('Back')).toBeTruthy();
    expect(screen.getByText('Next')).toBeTruthy();
  });

  test('renders skip button on middle steps', () => {
    render(<SetupWizardFooter {...defaultProps} />);
    expect(screen.getByText('Skip')).toBeTruthy();
  });

  test('renders Get Started on first step', () => {
    render(<SetupWizardFooter {...defaultProps} currentStep={0} />);
    expect(screen.getByText('Get Started')).toBeTruthy();
  });

  test('disables back button on first step', () => {
    render(<SetupWizardFooter {...defaultProps} currentStep={0} />);
    const backButton = screen.getByText('Back').closest('button');
    expect(backButton?.disabled).toBe(true);
  });

  test('hides next button on last step', () => {
    render(<SetupWizardFooter {...defaultProps} currentStep={6} />);
    expect(screen.queryByText('Next')).toBeNull();
    expect(screen.queryByText('Get Started')).toBeNull();
  });

  test('fires onBack callback', () => {
    const onBack = vi.fn(() => {});
    render(<SetupWizardFooter {...defaultProps} onBack={onBack} currentStep={2} />);
    fireEvent.click(screen.getByText('Back'));
    expect(onBack).toHaveBeenCalled();
  });

  test('fires onNext callback', () => {
    const onNext = vi.fn(() => {});
    render(<SetupWizardFooter {...defaultProps} onNext={onNext} />);
    fireEvent.click(screen.getByText('Next'));
    expect(onNext).toHaveBeenCalled();
  });
});

describe('SetupWizardProgress', () => {
  test('renders step dots', () => {
    const { container } = render(
      <SetupWizardProgress currentStep={0} onSelect={vi.fn(() => {})} />,
    );
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBe(7);
  });

  test('fires onSelect for completed step', () => {
    const onSelect = vi.fn(() => {});
    const { container } = render(<SetupWizardProgress currentStep={3} onSelect={onSelect} />);
    const dots = container.querySelectorAll('.rounded-full');
    fireEvent.click(dots[1]);
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});

describe('SetupWizardPreferencesStep', () => {
  const defaultProps = {
    defaultModel: 'claude-4-sonnet',
    theme: 'dark',
    reasoningMode: 'auto',
    keybindingPreset: 'Default',
    onDefaultModelChange: vi.fn(() => {}),
    onThemeChange: vi.fn(() => {}),
    onReasoningModeChange: vi.fn(() => {}),
    onKeybindingPresetChange: vi.fn(() => {}),
  };

  test('renders heading', () => {
    render(<SetupWizardPreferencesStep {...defaultProps} />);
    expect(screen.getByText('Preferences')).toBeTruthy();
  });

  test('renders setting labels', () => {
    render(<SetupWizardPreferencesStep {...defaultProps} />);
    expect(screen.getByText('Default Model')).toBeTruthy();
    expect(screen.getByText('Theme')).toBeTruthy();
    expect(screen.getByText('Reasoning Mode')).toBeTruthy();
    expect(screen.getByText('Key Bindings')).toBeTruthy();
  });

  test('fires onThemeChange when clicking theme button', () => {
    const onThemeChange = vi.fn(() => {});
    render(<SetupWizardPreferencesStep {...defaultProps} onThemeChange={onThemeChange} />);
    fireEvent.click(screen.getByText('light'));
    expect(onThemeChange).toHaveBeenCalledWith('light');
  });

  test('fires onReasoningModeChange when clicking reasoning button', () => {
    const onReasoningModeChange = vi.fn(() => {});
    render(
      <SetupWizardPreferencesStep
        {...defaultProps}
        onReasoningModeChange={onReasoningModeChange}
      />,
    );
    fireEvent.click(screen.getByText('off'));
    expect(onReasoningModeChange).toHaveBeenCalledWith('off');
  });
});

describe('SetupWizardReadyStep', () => {
  const defaultProps = {
    selectedProviderName: 'Anthropic',
    workspacePath: '/home/user/projects',
    defaultModel: 'claude-4-sonnet',
    onLaunch: vi.fn(() => {}),
  };

  test('renders ready heading and summary', () => {
    render(<SetupWizardReadyStep {...defaultProps} />);
    expect(screen.getByText(/all set/)).toBeTruthy();
    expect(screen.getByText('Anthropic')).toBeTruthy();
    expect(screen.getByText('/home/user/projects')).toBeTruthy();
    expect(screen.getByText('claude-4-sonnet')).toBeTruthy();
  });

  test('fires onLaunch when clicking launch button', () => {
    const onLaunch = vi.fn(() => {});
    render(<SetupWizardReadyStep {...defaultProps} onLaunch={onLaunch} />);
    fireEvent.click(screen.getByText('Launch Amoena'));
    expect(onLaunch).toHaveBeenCalled();
  });
});

describe('SetupWizardWorkspaceStep', () => {
  const defaultProps = {
    workspacePath: '/home/user/projects',
    onWorkspacePathChange: vi.fn(() => {}),
    onBrowse: vi.fn(() => {}),
  };

  test('renders heading and workspace path', () => {
    render(<SetupWizardWorkspaceStep {...defaultProps} />);
    expect(screen.getByText('Select Workspace')).toBeTruthy();
    expect(screen.getByText('Workspace Path')).toBeTruthy();
  });

  test('fires onBrowse when clicking browse button', () => {
    const onBrowse = vi.fn(() => {});
    render(<SetupWizardWorkspaceStep {...defaultProps} onBrowse={onBrowse} />);
    fireEvent.click(screen.getByText('Browse'));
    expect(onBrowse).toHaveBeenCalled();
  });

  test('renders current workspace path display', () => {
    render(<SetupWizardWorkspaceStep {...defaultProps} />);
    expect(screen.getByText('/home/user/projects')).toBeTruthy();
  });
});
