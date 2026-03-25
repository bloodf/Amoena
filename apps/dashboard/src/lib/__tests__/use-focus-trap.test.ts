import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockAddListener = vi.fn();
const mockRemoveListener = vi.fn();

vi.stubGlobal('document', {
  addEventListener: mockAddListener,
  removeEventListener: mockRemoveListener,
  querySelectorAll: vi.fn(() => []),
});

describe('useFocusTrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('returns a container ref', async () => {
    const { useFocusTrap } = await import('../use-focus-trap');
    const { result } = renderHook(() => useFocusTrap());
    expect(result.current).toHaveProperty('current');
  });

  it('registers keydown event listener on mount', async () => {
    const { useFocusTrap } = await import('../use-focus-trap');
    renderHook(() => useFocusTrap());
    expect(mockAddListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('removes event listener on unmount', async () => {
    const { useFocusTrap } = await import('../use-focus-trap');
    const { unmount } = renderHook(() => useFocusTrap());
    unmount();
    expect(mockRemoveListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    const { useFocusTrap } = await import('../use-focus-trap');

    renderHook(() => useFocusTrap(onClose));

    const keydownHandler = mockAddListener.mock.calls.find(
      (call: unknown[]) => call[0] === 'keydown',
    )?.[1] as (e: KeyboardEvent) => void;

    const mockEvent = {
      key: 'Escape',
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;

    keydownHandler(mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose for non-Escape keys', async () => {
    const onClose = vi.fn();
    const { useFocusTrap } = await import('../use-focus-trap');

    renderHook(() => useFocusTrap(onClose));

    const keydownHandler = mockAddListener.mock.calls.find(
      (call: unknown[]) => call[0] === 'keydown',
    )?.[1] as (e: KeyboardEvent) => void;

    const mockEvent = { key: 'Enter' } as unknown as KeyboardEvent;
    keydownHandler(mockEvent);
    expect(onClose).not.toHaveBeenCalled();
  });
});
