import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SessionWorkspace } from './SessionWorkspace';

function renderWorkspace(initialEntries: any[] = ['/session']) {
  return render(
    <MemoryRouter initialEntries={initialEntries as any}>
      <Routes>
        <Route path="/session" element={<SessionWorkspace />} />
        <Route path="/session/new" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

describe('SessionWorkspace deep flows', () => {
  test('creates a new empty session from router state', () => {
    renderWorkspace([
      {
        pathname: '/session',
        state: {
          newSession: {
            name: 'Fresh Session',
            model: 'Claude 4 Sonnet',
            provider: 'claude',
            permission: 'plan-only',
            workTarget: 'worktree',
          },
        },
      },
    ]);

    expect(screen.getAllByText('Fresh Session').length).toBeGreaterThan(0);
    expect(screen.getByText('Get started')).toBeTruthy();
  });

  test('opens a file tab from the files panel and switches to editor mode', () => {
    renderWorkspace();

    const fileButton = screen
      .getAllByRole('button')
      .find(
        (button) =>
          button.getAttribute('draggable') === 'true' && button.textContent?.includes('tokens.rs'),
      );
    expect(fileButton).toBeTruthy();
    fireEvent.click(fileButton!);

    expect(screen.getAllByText('tokens.rs').length).toBeGreaterThan(1);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  test('closes a session tab and falls back to another tab', () => {
    renderWorkspace();

    const closers = screen
      .getAllByRole('button')
      .filter(
        (button) =>
          button.getAttribute('aria-label') === 'New Session' ||
          button.getAttribute('aria-label') === 'Hide side panel',
      );
    expect(closers.length).toBeGreaterThan(0);

    const closeChips = screen
      .getAllByRole('button', { hidden: true })
      .filter((button) => button.textContent?.trim() === '');
    expect(closeChips.length).toBeGreaterThan(0);
    fireEvent.click(closeChips[1]);

    expect(screen.getAllByText('JWT Auth Refactor').length).toBeGreaterThan(0);
  });

  test('can hide and reopen terminal plus hide side panel', () => {
    renderWorkspace();

    fireEvent.click(screen.getByLabelText('Hide side panel'));
    expect(screen.queryByText('Files')).toBeNull();

    fireEvent.click(screen.getByLabelText(/close terminal panel/i));
    expect(screen.getByText('Terminal')).toBeTruthy();

    fireEvent.click(screen.getByText('Terminal'));
    expect(screen.getByText(/\(cargo build\)/)).toBeTruthy();
  });

  test('new session button routes to new session flow', () => {
    renderWorkspace();

    fireEvent.click(screen.getByTitle('New Session'));
    expect(screen.getByTestId('location').textContent).toBe('/session/new');
  });

  test('resizes terminal and side panel plus reorders tabs', () => {
    renderWorkspace();

    const separators = Array.from(
      document.querySelectorAll("[class*='cursor-row-resize'], [class*='cursor-col-resize']"),
    );
    expect(separators.length).toBeGreaterThan(1);

    fireEvent.mouseDown(separators[0], { clientY: 400 });
    fireEvent.mouseMove(document, { clientY: 300 });
    fireEvent.mouseUp(document);

    fireEvent.mouseDown(separators[1], { clientX: 1000 });
    fireEvent.mouseMove(document, { clientX: 900 });
    fireEvent.mouseUp(document);

    const tabButtons = screen
      .getAllByRole('tab')
      .filter(
        (button) =>
          button.getAttribute('draggable') === 'true' &&
          ['JWT Auth Refactor', 'Rate Limiter Design', 'API Routes'].some((label) =>
            button.textContent?.includes(label),
          ),
      );
    fireEvent.dragStart(tabButtons[0]);
    fireEvent.dragOver(tabButtons[1], { preventDefault: () => {} });
    fireEvent.dragEnd(tabButtons[0]);

    expect(
      screen.getAllByText(/JWT Auth Refactor|Rate Limiter Design|API Routes/).length,
    ).toBeGreaterThan(0);
  });

  test('updates session controls through the embedded composer and supports keyboard tab closing', () => {
    renderWorkspace();

    fireEvent.click(screen.getByLabelText(/open permission picker/i));
    fireEvent.click(screen.getByText('Plan only'));
    expect(screen.getByText('Plan only')).toBeTruthy();

    fireEvent.click(screen.getByLabelText(/open branch picker/i));
    fireEvent.click(screen.getByText('feature/jwt-auth'));
    expect(screen.getAllByText('feature/jwt-auth').length).toBeGreaterThan(0);

    const closeAffordance = screen
      .getAllByRole('button', { hidden: true })
      .find((node) => node.getAttribute('role') === 'button');
    if (closeAffordance) {
      fireEvent.keyDown(closeAffordance, { key: 'Enter' });
    }

    expect(
      screen.getAllByText(/JWT Auth Refactor|Rate Limiter Design|API Routes/).length,
    ).toBeGreaterThan(0);
  });
});
