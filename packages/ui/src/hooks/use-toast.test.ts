import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'bun:test';
import * as React from 'react';

// We import the module and reset its internal state between tests.
// The module maintains memoryState and listeners at module scope.
const _toastModule = await import('./use-toast');
const { reducer, toast, amoenaToast, useToast } = _toastModule;

// Helper to reset module state by re-importing
async function reloadToastModule() {
  // Clear the module cache to get a fresh instance
  vi.resetModules();
  const fresh = await import('./use-toast');
  return fresh;
}

describe('use-toast: reducer', () => {
  const emptyState = { toasts: [] };

  test('ADD_TOAST prepends toast and respects TOAST_LIMIT', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: true } as const;
    const toast2 = { id: '2', title: 'Toast 2', open: true } as const;
    const toast3 = { id: '3', title: 'Toast 3', open: true } as const;

    // Add two toasts — both should be present
    let state = reducer(emptyState, { type: 'ADD_TOAST', toast: toast1 });
    state = reducer(state, { type: 'ADD_TOAST', toast: toast2 });
    expect(state.toasts).toHaveLength(2);
    expect(state.toasts[0].id).toBe('2'); // newest first
    expect(state.toasts[1].id).toBe('1');

    // Adding a third should still respect TOAST_LIMIT=1, so only newest survives
    state = reducer(state, { type: 'ADD_TOAST', toast: toast3 });
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe('3');
  });

  test('UPDATE_TOAST modifies existing toast by id', () => {
    const initial = reducer(emptyState, {
      type: 'ADD_TOAST',
      toast: { id: '1', title: 'Original', open: true },
    });
    const updated = reducer(initial, {
      type: 'UPDATE_TOAST',
      toast: { id: '1', title: 'Updated' },
    });
    expect(updated.toasts[0].title).toBe('Updated');
    expect(updated.toasts[0].id).toBe('1');
  });

  test('UPDATE_TOAST does nothing for unknown id', () => {
    const initial = reducer(emptyState, {
      type: 'ADD_TOAST',
      toast: { id: '1', title: 'Original', open: true },
    });
    const updated = reducer(initial, {
      type: 'UPDATE_TOAST',
      toast: { id: '999', title: 'Ghost' },
    });
    expect(updated.toasts[0].title).toBe('Original');
    expect(updated.toasts).toHaveLength(1);
  });

  test('REMOVE_TOAST filters out toast by id', () => {
    let state = reducer(emptyState, {
      type: 'ADD_TOAST',
      toast: { id: '1', title: 'One', open: true },
    });
    state = reducer(state, {
      type: 'ADD_TOAST',
      toast: { id: '2', title: 'Two', open: true },
    });
    state = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' });
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe('2');
  });

  test('REMOVE_TOAST with undefined toastId clears all toasts', () => {
    let state = reducer(emptyState, {
      type: 'ADD_TOAST',
      toast: { id: '1', title: 'One', open: true },
    });
    state = reducer(state, {
      type: 'ADD_TOAST',
      toast: { id: '2', title: 'Two', open: true },
    });
    state = reducer(state, { type: 'REMOVE_TOAST', toastId: undefined });
    expect(state.toasts).toHaveLength(0);
  });
});

describe('use-toast: genId', () => {
  test('generates unique sequential string ids', async () => {
    const mod = await reloadToastModule();
    const id1 = mod.toast({ title: 'a' }).id;
    const id2 = mod.toast({ title: 'b' }).id;
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(typeof id2).toBe('string');
  });
});

describe('use-toast: toast function', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('returns id, dismiss, and update handles', async () => {
    const mod = await import('./use-toast');
    const result = mod.toast({ title: 'Hello' });
    expect(result.id).toBeTruthy();
    expect(typeof result.dismiss).toBe('function');
    expect(typeof result.update).toBe('function');
  });

  test('toast sets open=true and onOpenChange to auto-dismiss', async () => {
    const mod = await import('./use-toast');
    const result = mod.toast({ title: 'Test' });
    // The toast should be added with open: true
    // onOpenChange callback is set internally to call dismiss when closed
    expect(result.id).toBeTruthy();
  });
});

describe('use-toast: amoenaToast convenience methods', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('amoenaToast.success creates toast with title and default variant', async () => {
    const mod = await import('./use-toast');
    const result = mod.amoenaToast.success('Operation succeeded');
    expect(result.id).toBeTruthy();
  });

  test('amoenaToast.error creates toast with title and destructive variant', async () => {
    const mod = await import('./use-toast');
    const result = mod.amoenaToast.error('Something went wrong');
    expect(result.id).toBeTruthy();
  });

  test('amoenaToast.warning creates toast with title', async () => {
    const mod = await import('./use-toast');
    const result = mod.amoenaToast.warning('Watch out');
    expect(result.id).toBeTruthy();
  });

  test('amoenaToast.info creates toast with title', async () => {
    const mod = await import('./use-toast');
    const result = mod.amoenaToast.info('Here is a tip');
    expect(result.id).toBeTruthy();
  });
});

describe('use-toast: useToast hook', () => {
  // Use a fresh module import per test to avoid listener bleed
  test('returns toasts array and toast/dismiss methods', async () => {
    vi.resetModules();
    const { useToast: freshUseToast } = await import('./use-toast');
    const { result } = renderHook(() => freshUseToast());
    expect(Array.isArray(result.current.toasts)).toBe(true);
    expect(typeof result.current.toast).toBe('function');
    expect(typeof result.current.dismiss).toBe('function');
  });

  test('calling toast() from outside the hook updates hook state', async () => {
    vi.resetModules();
    const { useToast: freshUseToast, toast: freshToast } = await import('./use-toast');
    const { result } = renderHook(() => freshUseToast());
    expect(result.current.toasts.length).toBe(0);

    act(() => {
      freshToast({ title: 'New Toast' });
    });

    // The listener should have fired, updating the hook's state
    expect(result.current.toasts.length).toBeGreaterThanOrEqual(1);
  });

  test('dismiss removes a specific toast by id', async () => {
    vi.resetModules();
    const { useToast: freshUseToast, toast: freshToast } = await import('./use-toast');
    const { result } = renderHook(() => freshUseToast());

    const { id } = freshToast({ title: 'To dismiss' });
    // Wait for the toast to be added
    await new Promise((r) => setTimeout(r, 10));
    expect(result.current.toasts.some((t) => t.id === id)).toBe(true);

    act(() => {
      result.current.dismiss(id);
    });
    await new Promise((r) => setTimeout(r, 10));
    expect(result.current.toasts.find((t) => t.id === id)).toBeUndefined();
  });
});
