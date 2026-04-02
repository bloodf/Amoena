import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

import { ErrorBoundary } from './ErrorBoundary';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
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
    const ThrowError = () => {
      throw new Error('Something broke');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const errors = screen.getAllByText('Something went wrong');
    expect(errors.length).toBeGreaterThan(0);
    const messages = screen.getAllByText('Something broke');
    expect(messages.length).toBeGreaterThan(0);
    const buttons = screen.getAllByRole('button', { name: 'Try Again' });
    expect(buttons.length).toBeGreaterThan(0);
  });
});
