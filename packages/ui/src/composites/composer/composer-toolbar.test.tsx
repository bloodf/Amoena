import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Monitor } from 'lucide-react';

import { ComposerDropdown, ComposerToolbar } from './ComposerToolbar';
import type { ComposerOption, ComposerPermissionOption, ComposerReasoningLevel } from './types';

// ---------------------------------------------------------------------------
// Shared fixture data
// ---------------------------------------------------------------------------

const agents = [
  { id: 'a1', name: 'Claude', role: 'Main', color: 'text-primary' },
  { id: 'a2', name: 'Gemini', role: 'Sub', color: 'text-green' },
];

const models = [
  { id: 'm1', label: 'claude-4-sonnet' },
  { id: 'm2', label: 'gpt-5' },
];

const reasoningLevels: ComposerReasoningLevel[] = [
  { id: 'low', label: 'low', desc: 'Fastest' },
  { id: 'high', label: 'high', desc: 'Deeper' },
  { id: 'extra-high', label: 'extra-high', desc: 'Deepest' },
];

const continueOptions: ComposerOption[] = [
  { id: 'local', label: 'Local', icon: Monitor },
  { id: 'worktree', label: 'Worktree', icon: Monitor },
  { id: 'cloud', label: 'Cloud', icon: Monitor },
];

const permissionOptions: ComposerPermissionOption[] = [
  { id: 'default', label: 'Default', desc: 'Standard permissions' },
  { id: 'full', label: 'Full', desc: 'All permissions' },
];

const branchOptions = ['main', 'feat/my-feature'];

const closedMenus = {
  plus: false,
  agent: false,
  model: false,
  reasoning: false,
  continueIn: false,
  permission: false,
  branch: false,
};

function makeHandlers() {
  return {
    onToggleMenu: vi.fn((_menu: string) => {}),
    onCloseMenu: vi.fn((_menu: string) => {}),
    onTogglePlanMode: vi.fn(() => {}),
    onSelectAgent: vi.fn((_id: string) => {}),
    onSelectModel: vi.fn((_id: string) => {}),
    onSelectReasoning: vi.fn((_id: string) => {}),
    onSelectContinueIn: vi.fn((_id: string) => {}),
    onSelectPermission: vi.fn((_id: string) => {}),
    onSelectBranch: vi.fn((_branch: string) => {}),
  };
}

function renderToolbar(overrides: Partial<Parameters<typeof ComposerToolbar>[0]> = {}) {
  const handlers = makeHandlers();
  const props = {
    providerName: 'Anthropic',
    activeProvider: 'anthropic',
    activeAgentName: 'Claude',
    activeAgentColor: 'text-primary',
    activeAgentRole: 'Main',
    agents,
    activeAgentId: 'a1',
    models,
    activeModelId: 'm1',
    activeModelLabel: 'claude-4-sonnet',
    reasoningLevel: 'low',
    reasoningLevels,
    continueOptions,
    permissionOptions,
    branchOptions,
    session: undefined,
    planMode: false,
    menus: closedMenus,
    ...handlers,
    ...overrides,
  };
  const result = render(<ComposerToolbar {...props} />);
  return { ...result, ...handlers };
}

// ---------------------------------------------------------------------------
// ComposerDropdown
// ---------------------------------------------------------------------------

describe('ComposerDropdown', () => {
  test('renders nothing when open is false', () => {
    const { container } = render(
      <ComposerDropdown open={false} onClose={vi.fn(() => {})}>
        <span>content</span>
      </ComposerDropdown>,
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders children when open is true', () => {
    render(
      <ComposerDropdown open={true} onClose={vi.fn(() => {})}>
        <span>visible</span>
      </ComposerDropdown>,
    );
    expect(screen.getByText('visible')).toBeDefined();
  });

  test('calls onClose when mousedown outside', () => {
    const onClose = vi.fn(() => {});
    render(
      <ComposerDropdown open={true} onClose={onClose}>
        <span>inside</span>
      </ComposerDropdown>,
    );
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalled();
  });

  test('does not call onClose when mousedown inside', () => {
    const onClose = vi.fn(() => {});
    render(
      <ComposerDropdown open={true} onClose={onClose}>
        <span>inside</span>
      </ComposerDropdown>,
    );
    fireEvent.mouseDown(screen.getByText('inside'));
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// ComposerToolbar — basic rendering
// ---------------------------------------------------------------------------

describe('ComposerToolbar rendering', () => {
  test('renders provider name and active model label', () => {
    renderToolbar();
    expect(screen.getByText('Anthropic')).toBeDefined();
    expect(screen.getByText('claude-4-sonnet')).toBeDefined();
  });

  test('renders active agent name', () => {
    renderToolbar();
    expect(screen.getByText('Claude')).toBeDefined();
  });

  test('renders reasoning level text', () => {
    renderToolbar();
    expect(screen.getByText('low')).toBeDefined();
  });

  test('does not render PLAN badge when planMode is false', () => {
    renderToolbar({ planMode: false });
    expect(screen.queryByText('PLAN')).toBeNull();
  });

  test('renders PLAN badge when planMode is true', () => {
    renderToolbar({ planMode: true });
    expect(screen.getByText('PLAN')).toBeDefined();
  });

  test('does not render session buttons when session is undefined', () => {
    renderToolbar({ session: undefined });
    expect(screen.queryByLabelText('Open work target picker')).toBeNull();
    expect(screen.queryByLabelText('Open permission picker')).toBeNull();
    expect(screen.queryByLabelText('Open branch picker')).toBeNull();
  });

  test('renders session buttons when session is provided', () => {
    renderToolbar({
      session: { continueIn: 'local', permission: 'default', branch: 'main' },
    });
    expect(screen.getByLabelText('Open work target picker')).toBeDefined();
    expect(screen.getByLabelText('Open permission picker')).toBeDefined();
    expect(screen.getByLabelText('Open branch picker')).toBeDefined();
  });

  test('renders branch name in session mode', () => {
    renderToolbar({
      session: { continueIn: 'local', permission: 'default', branch: 'feat/my-feature' },
    });
    expect(screen.getByText('feat/my-feature')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// ComposerToolbar — button interactions
// ---------------------------------------------------------------------------

describe('ComposerToolbar button interactions', () => {
  test('clicking plus button calls onToggleMenu with plus', () => {
    const { onToggleMenu } = renderToolbar();
    fireEvent.click(screen.getByLabelText('Open composer actions'));
    expect(onToggleMenu).toHaveBeenCalledWith('plus');
  });

  test('clicking agent picker button calls onToggleMenu with agent', () => {
    const { onToggleMenu } = renderToolbar();
    fireEvent.click(screen.getByLabelText('Open agent picker'));
    expect(onToggleMenu).toHaveBeenCalledWith('agent');
  });

  test('clicking model picker button calls onToggleMenu with model', () => {
    const { onToggleMenu } = renderToolbar();
    fireEvent.click(screen.getByLabelText('Open model picker'));
    expect(onToggleMenu).toHaveBeenCalledWith('model');
  });

  test('clicking reasoning picker button calls onToggleMenu with reasoning', () => {
    const { onToggleMenu } = renderToolbar();
    fireEvent.click(screen.getByLabelText('Open reasoning picker'));
    expect(onToggleMenu).toHaveBeenCalledWith('reasoning');
  });

  test('clicking work target picker calls onToggleMenu with continueIn', () => {
    const { onToggleMenu } = renderToolbar({
      session: { continueIn: 'local', permission: 'default', branch: 'main' },
    });
    fireEvent.click(screen.getByLabelText('Open work target picker'));
    expect(onToggleMenu).toHaveBeenCalledWith('continueIn');
  });

  test('clicking permission picker calls onToggleMenu with permission', () => {
    const { onToggleMenu } = renderToolbar({
      session: { continueIn: 'local', permission: 'default', branch: 'main' },
    });
    fireEvent.click(screen.getByLabelText('Open permission picker'));
    expect(onToggleMenu).toHaveBeenCalledWith('permission');
  });

  test('clicking branch picker calls onToggleMenu with branch', () => {
    const { onToggleMenu } = renderToolbar({
      session: { continueIn: 'local', permission: 'default', branch: 'main' },
    });
    fireEvent.click(screen.getByLabelText('Open branch picker'));
    expect(onToggleMenu).toHaveBeenCalledWith('branch');
  });
});

// ---------------------------------------------------------------------------
// ComposerToolbar — reasoning level styling
// ---------------------------------------------------------------------------

describe('ComposerToolbar reasoning level styling', () => {
  test('reasoning button has warning color for high level', () => {
    renderToolbar({ reasoningLevel: 'high' });
    const btn = screen.getByLabelText('Open reasoning picker');
    expect(btn.className).toContain('text-warning');
  });

  test('reasoning button has warning color for extra-high level', () => {
    renderToolbar({ reasoningLevel: 'extra-high' });
    const btn = screen.getByLabelText('Open reasoning picker');
    expect(btn.className).toContain('text-warning');
  });

  test('reasoning button does not have warning color for low level', () => {
    renderToolbar({ reasoningLevel: 'low' });
    const btn = screen.getByLabelText('Open reasoning picker');
    expect(btn.className).not.toContain('text-warning');
  });
});

// ---------------------------------------------------------------------------
// ComposerToolbar — open menus show dropdowns
// ---------------------------------------------------------------------------

describe('ComposerToolbar open menus', () => {
  test('agent dropdown visible when menus.agent is true', () => {
    renderToolbar({ menus: { ...closedMenus, agent: true } });
    expect(screen.getByText('Agent Variant')).toBeDefined();
  });

  test('model dropdown visible when menus.model is true', () => {
    renderToolbar({ menus: { ...closedMenus, model: true } });
    expect(screen.getByText('Model')).toBeDefined();
  });

  test('reasoning dropdown visible when menus.reasoning is true', () => {
    renderToolbar({ menus: { ...closedMenus, reasoning: true } });
    expect(screen.getByText('Reasoning')).toBeDefined();
  });
});
