import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { NewSessionModalFooter } from './NewSessionModalFooter';

describe('NewSessionModalFooter', () => {
  test('renders Cancel button', () => {
    render(<NewSessionModalFooter onClose={vi.fn(() => {})} onCreate={vi.fn(() => {})} />);
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  test('renders Create Session button', () => {
    render(<NewSessionModalFooter onClose={vi.fn(() => {})} onCreate={vi.fn(() => {})} />);
    expect(screen.getByText('Create Session')).toBeTruthy();
  });

  test('calls onClose when Cancel clicked', () => {
    const onClose = vi.fn(() => {});
    render(<NewSessionModalFooter onClose={onClose} onCreate={vi.fn(() => {})} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  test('calls onCreate when Create Session clicked', () => {
    const onCreate = vi.fn(() => {});
    render(<NewSessionModalFooter onClose={vi.fn(() => {})} onCreate={onCreate} />);
    fireEvent.click(screen.getByText('Create Session'));
    expect(onCreate).toHaveBeenCalled();
  });
});
