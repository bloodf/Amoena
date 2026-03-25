import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';

import { ErrorBoundary } from './ErrorBoundary';

vi.mock('@/theme/styles', () => ({
  styles: {
    screenTitle: {},
    mutedText: {},
    primaryButton: {},
    primaryButtonText: {},
  },
}));

vi.mock('@/theme/tokens', () => ({
  tokens: {
    spacing6: 24,
    spacing4: 16,
    spacing3: 12,
    colorBackground: '#000',
    colorSurface3: '#333',
  },
}));

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.spyOn(console, 'error').mockRestore();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Child content')).toBeTruthy();
  });

  it('renders custom fallback when provided and error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom fallback')).toBeTruthy();
  });

  it('renders default error UI when no fallback and error occurs', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowError = () => {
      throw new Error('Something broke');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Something broke')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeTruthy();
  });

  it('recovers when Try Again is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    let shouldThrow = true;
    const IntermittentError = () => {
      if (shouldThrow) throw new Error('Initial error');
      return <div>Recovered!</div>;
    };

    const { getByRole } = render(
      <ErrorBoundary>
        <IntermittentError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();

    act(() => {
      shouldThrow = false;
      fireEvent.click(getByRole('button', { name: 'Try Again' }));
    });

    expect(screen.getByText('Recovered!')).toBeTruthy();
  });

  it('displays default message when error has no message', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const ThrowPlainError = () => {
      throw new Error();
    };

    render(
      <ErrorBoundary>
        <ThrowPlainError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('An unexpected error occurred')).toBeTruthy();
  });
});
