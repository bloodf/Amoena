import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from "vitest";
import * as React from 'react';

import { reducer, amoenaToast, useToast } from './use-toast';

describe('use-toast: reducer', () => {
  const emptyState = { toasts: [] };

  test('ADD_TOAST prepends a new toast', () => {
    const toast = { id: '1', title: 'First', open: true };
    const state = reducer(emptyState, { type: 'ADD_TOAST', toast });
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe('1');
  });

  test('ADD_TOAST puts newest toast first (TOAST_LIMIT=1)', () => {
    const toast1 = { id: '1', title: 'First', open: true };
    const toast2 = { id: '2', title: 'Second', open: true };
    let state = reducer(emptyState, { type: 'ADD_TOAST', toast: toast1 });
    state = reducer(state, { type: 'ADD_TOAST', toast: toast2 });
    expect(state.toasts[0].id).toBe('2');
    expect(state.toasts).toHaveLength(1);
  });

  test('UPDATE_TOAST modifies an existing toast by id', () => {
    const initial = reducer(emptyState, {
      type: 'ADD_TOAST',
      toast: { id: '1', title: 'Original', open: true },
    });
    const updated = reducer(initial, {
      type: 'UPDATE_TOAST',
      toast: { id: '1', title: 'Updated' },
    });
    expect(updated.toasts[0].title).toBe('Updated');
  });

  test('UPDATE_TOAST leaves other toasts unchanged', () => {
    const initial = reducer(emptyState, {
      type: 'ADD_TOAST',
      toast: { id: '1', title: 'First', open: true },
    });
    const withTwo = reducer(initial, {
      type: 'ADD_TOAST',
      toast: { id: '2', title: 'Second', open: true },
    });
    const updated = reducer(withTwo, {
      type: 'UPDATE_TOAST',
      toast: { id: '1', title: 'Updated First' },
    });
    expect(updated.toasts.find((t) => t.id === '2')?.title).toBe('Second');
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

describe('use-toast: amoenaToast convenience methods', () => {
  test('success returns an object with id, dismiss, and update', () => {
    const result = amoenaToast.success('Done');
    expect(result).toHaveProperty('id');
    expect(typeof result.dismiss).toBe('function');
    expect(typeof result.update).toBe('function');
  });

  test('error returns an object with id, dismiss, and update', () => {
    const result = amoenaToast.error('Failed');
    expect(result).toHaveProperty('id');
    expect(typeof result.dismiss).toBe('function');
    expect(typeof result.update).toBe('function');
  });

  test('warning and info are also callable and return id', () => {
    expect(typeof amoenaToast.warning).toBe('function');
    expect(typeof amoenaToast.info).toBe('function');
    const w = amoenaToast.warning('Watch');
    const i = amoenaToast.info('Tip');
    expect(w.id).toBeTruthy();
    expect(i.id).toBeTruthy();
  });
});

describe('use-toast: useToast hook', () => {
  test('returns toasts array, toast function, and dismiss function', () => {
    const { result } = renderHook(() => useToast());
    expect(Array.isArray(result.current.toasts)).toBe(true);
    expect(typeof result.current.toast).toBe('function');
    expect(typeof result.current.dismiss).toBe('function');
  });

  test('calling toast() adds a toast to state', () => {
    const { result } = renderHook(() => useToast());
    const toastTitle = `Test Toast ${  Date.now()}`;
    act(() => {
      result.current.toast({ title: toastTitle });
    });
    const found = result.current.toasts.find((t) => t.title === toastTitle);
    expect(found).toBeTruthy();
  });

  test('dismiss sets open=false on the toast', () => {
    const { result } = renderHook(() => useToast());
    const { id } = result.current.toast({ title: 'To Dismiss' });

    act(() => {
      result.current.dismiss(id);
    });

    const toast = result.current.toasts.find((t) => t.id === id);
    expect(toast).toBeTruthy();
    expect(toast?.open).toBe(false);
  });
});
