import { describe, expect, test } from 'bun:test';

import { cn } from './utils';

describe('cn', () => {
  test('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  test('handles conditional classes', () => {
    const isHidden = false;
    expect(cn('base', isHidden && 'hidden', 'visible')).toBe('base visible');
  });

  test('handles undefined values', () => {
    expect(cn('base', undefined, 'end')).toBe('base end');
  });

  test('handles null values', () => {
    expect(cn('base', null, 'end')).toBe('base end');
  });

  test('returns empty string for no args', () => {
    expect(cn()).toBe('');
  });

  test('merges conflicting tailwind classes (last wins)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  test('merges conflicting tailwind bg classes', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  test('keeps non-conflicting tailwind classes', () => {
    const result = cn('p-4', 'm-2');
    expect(result).toContain('p-4');
    expect(result).toContain('m-2');
  });

  test('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  test('handles objects as conditionals', () => {
    expect(cn({ hidden: true, visible: false })).toBe('hidden');
  });
});
