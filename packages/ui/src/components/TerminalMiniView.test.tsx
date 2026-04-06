import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { TerminalMiniView } from './TerminalMiniView';

describe('TerminalMiniView — title bar', () => {
  test('renders the provided title', () => {
    render(
      <TerminalMiniView title="bash — ~/project" onClose={() => {}}>
        <span>output</span>
      </TerminalMiniView>,
    );
    expect(screen.getByText('bash — ~/project')).not.toBeNull();
  });

  test('renders a close button', () => {
    render(
      <TerminalMiniView title="Terminal" onClose={() => {}}>
        <span>output</span>
      </TerminalMiniView>,
    );
    expect(screen.getByRole('button', { name: 'Close terminal' })).not.toBeNull();
  });

  test('close button fires onClose callback when clicked', () => {
    const onClose = vi.fn(() => {});
    render(
      <TerminalMiniView title="Terminal" onClose={onClose}>
        <span>output</span>
      </TerminalMiniView>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close terminal' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('TerminalMiniView — children', () => {
  test('renders child text content', () => {
    render(
      <TerminalMiniView title="Terminal" onClose={() => {}}>
        <span>hello world</span>
      </TerminalMiniView>,
    );
    expect(screen.getByText('hello world')).not.toBeNull();
  });

  test('renders multiple children', () => {
    render(
      <TerminalMiniView title="Terminal" onClose={() => {}}>
        <span>line one</span>
        <span>line two</span>
      </TerminalMiniView>,
    );
    expect(screen.getByText('line one')).not.toBeNull();
    expect(screen.getByText('line two')).not.toBeNull();
  });
});

describe('TerminalMiniView — position anchor', () => {
  test('applies bottom-right anchor class by default', () => {
    const { container } = render(
      <TerminalMiniView title="Terminal" onClose={() => {}}>
        <span />
      </TerminalMiniView>,
    );
    const floatingPanel = container.querySelector('.bottom-4.right-4');
    expect(floatingPanel).not.toBeNull();
  });

  test('applies top-left anchor class when position is top-left', () => {
    const { container } = render(
      <TerminalMiniView title="Terminal" onClose={() => {}} position="top-left">
        <span />
      </TerminalMiniView>,
    );
    expect(container.querySelector('.top-4.left-4')).not.toBeNull();
  });

  test('applies top-right anchor class when position is top-right', () => {
    const { container } = render(
      <TerminalMiniView title="Terminal" onClose={() => {}} position="top-right">
        <span />
      </TerminalMiniView>,
    );
    expect(container.querySelector('.top-4.right-4')).not.toBeNull();
  });

  test('applies bottom-left anchor class when position is bottom-left', () => {
    const { container } = render(
      <TerminalMiniView title="Terminal" onClose={() => {}} position="bottom-left">
        <span />
      </TerminalMiniView>,
    );
    expect(container.querySelector('.bottom-4.left-4')).not.toBeNull();
  });
});
