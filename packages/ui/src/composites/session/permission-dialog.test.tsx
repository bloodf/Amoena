import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PermissionDialog } from './PermissionDialog';

const request = {
  requestId: 'req-1',
  toolName: 'file_write',
  input: { path: '/src/app.ts', content: 'hello' },
  sessionId: 'session-1',
};

function makeHandlers() {
  return {
    onApprove: vi.fn(() => {}),
    onDeny: vi.fn(() => {}),
  };
}

describe('PermissionDialog', () => {
  test('renders nothing when request is null', () => {
    const { container } = render(
      <PermissionDialog request={null} onApprove={vi.fn(() => {})} onDeny={vi.fn(() => {})} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders the dialog with tool name when request provided', () => {
    const { onApprove, onDeny } = makeHandlers();
    render(<PermissionDialog request={request} onApprove={onApprove} onDeny={onDeny} />);
    expect(screen.getByText('file_write')).toBeTruthy();
  });

  test('calls onApprove with requestId when Approve clicked', () => {
    const { onApprove, onDeny } = makeHandlers();
    render(<PermissionDialog request={request} onApprove={onApprove} onDeny={onDeny} />);
    // Find button by translation key fallback or text content
    const buttons = screen.getAllByRole('button');
    const approveBtn = buttons.find((b) => b.className.includes('primary'));
    if (approveBtn) fireEvent.click(approveBtn);
    else fireEvent.click(buttons[buttons.length - 1]);
    expect(onApprove).toHaveBeenCalledWith('req-1');
  });

  test('calls onDeny with requestId when Deny clicked', () => {
    const { onApprove, onDeny } = makeHandlers();
    render(<PermissionDialog request={request} onApprove={onApprove} onDeny={onDeny} />);
    const buttons = screen.getAllByRole('button');
    // Deny is the first button (before Approve)
    fireEvent.click(buttons[0]);
    expect(onDeny).toHaveBeenCalledWith('req-1');
  });

  test('displays tool input as JSON', () => {
    const { onApprove, onDeny } = makeHandlers();
    render(<PermissionDialog request={request} onApprove={onApprove} onDeny={onDeny} />);
    expect(screen.getByText(/\/src\/app\.ts/)).toBeTruthy();
  });

  test('renders a pre element for the JSON input', () => {
    const { onApprove, onDeny } = makeHandlers();
    const { container } = render(
      <PermissionDialog request={request} onApprove={onApprove} onDeny={onDeny} />,
    );
    expect(container.querySelector('pre')).toBeTruthy();
  });
});
