import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { MemoryRouter } from 'react-router-dom';
import { MessageQueue } from './MessageQueue';
import { SessionSidePanel } from './SessionSidePanel';
import { SessionWorkspace } from '@/screens/SessionWorkspace';
import { TerminalPanel } from './TerminalPanel';

const OriginalResizeObserver = globalThis.ResizeObserver;

beforeEach(() => {
  class ImmediateResizeObserver {
    private callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      this.callback(
        [
          {
            target,
            contentRect: {
              width: 0,
              height: 0,
              x: 0,
              y: 0,
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              toJSON: () => ({}),
            },
          } as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver,
      );
    }

    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver = ImmediateResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
});

describe('workspace shell interactions', () => {
  test('queue can collapse, pause, resume, and remove an item', async () => {
    render(<MessageQueue />);

    expect(screen.getByText(/Queue \(4\)/i)).toBeTruthy();
    fireEvent.click(screen.getByLabelText(/collapse queue/i));
    expect(screen.queryByText(/Refactor the authentication middleware/i)).toBeNull();

    fireEvent.click(screen.getByLabelText(/expand queue/i));
    expect(screen.getByText(/Refactor the authentication middleware/i)).toBeTruthy();

    fireEvent.click(screen.getAllByTitle(/pause/i)[0]);
    expect(screen.getAllByTitle(/resume/i)[0]).toBeTruthy();

    fireEvent.click(screen.getAllByLabelText(/remove queue item/i)[0]);
    expect(screen.queryByText(/Refactor the authentication middleware/i)).toBeNull();
  });

  test('terminal panel can add tabs, switch tabs, and close panel', async () => {
    const onClose = mock(() => {});
    render(<TerminalPanel onClose={onClose} />);

    fireEvent.click(screen.getByLabelText(/add terminal tab/i));
    expect(screen.getAllByText('bash').length).toBeGreaterThan(1);

    const nodeTab = screen.getByRole('button', { name: /node \(cargo build\)/i });
    fireEvent.click(nodeTab);
    expect(nodeTab).toBeTruthy();

    fireEvent.click(screen.getByLabelText(/close terminal panel/i));
    expect(onClose).toHaveBeenCalled();
  });

  test('side panel supports overflow tab selection', async () => {
    render(<SessionSidePanel onOpenFile={() => {}} />);

    fireEvent.pointerDown(screen.getByLabelText(/more side panel tabs/i));
    fireEvent.click(screen.getByText('Timeline', { selector: "[role='menuitem']" }));
    expect(screen.getByText(/Checkpoint/i)).toBeTruthy();
  });

  test('side panel files tab opens a file', async () => {
    const onOpenFile = mock(() => {});
    render(<SessionSidePanel onOpenFile={onOpenFile} />);

    const fileButton = screen
      .getAllByRole('button')
      .find(
        (button) =>
          button.getAttribute('draggable') === 'true' && button.textContent?.includes('tokens.rs'),
      );
    expect(fileButton).toBeTruthy();
    fireEvent.click(fileButton!);
    expect(onOpenFile).toHaveBeenCalledWith('tokens.rs', 'src/auth/tokens.rs');
  });

  test('session workspace toggles terminal and side panel chrome', async () => {
    render(
      <MemoryRouter initialEntries={['/session']}>
        <SessionWorkspace />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText(/hide side panel/i));
    expect(screen.queryByText('Files')).toBeNull();

    fireEvent.click(screen.getByLabelText(/close terminal panel/i));
    fireEvent.click(screen.getByText('Terminal', { selector: 'button' }));
    expect(screen.getByLabelText(/close terminal panel/i)).toBeTruthy();
  });
});
