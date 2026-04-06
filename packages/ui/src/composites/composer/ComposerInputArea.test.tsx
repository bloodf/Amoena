import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { createRef } from 'react';

import { ComposerInputArea } from './ComposerInputArea';

function renderInput(overrides: Partial<Parameters<typeof ComposerInputArea>[0]> = {}) {
  const handlers = {
    onMessageChange: vi.fn((_v: string) => {}),
    onKeyDown: vi.fn((_e: React.KeyboardEvent) => {}),
    onPaste: vi.fn((_e: React.ClipboardEvent) => {}),
    onRecordingToggle: vi.fn(() => {}),
    onSubmit: vi.fn(() => {}),
  };
  const props = {
    isRecording: false,
    recordingTime: '0:00',
    isShellMode: false,
    message: '',
    textareaRef: createRef<HTMLTextAreaElement>(),
    canvasRef: createRef<HTMLCanvasElement>(),
    ...handlers,
    ...overrides,
  };
  const result = render(<ComposerInputArea {...props} />);
  return { ...result, ...handlers };
}

describe('ComposerInputArea', () => {
  test('renders the textarea with placeholder', () => {
    renderInput();
    expect(
      screen.getByPlaceholderText('Ask anything... @ files, $ skills, / commands'),
    ).toBeTruthy();
  });

  test('renders the send button', () => {
    renderInput();
    expect(screen.getByLabelText('Send message')).toBeTruthy();
  });

  test('renders the recording toggle button', () => {
    renderInput();
    expect(screen.getByLabelText('Start recording')).toBeTruthy();
  });

  test('shows the textarea value', () => {
    renderInput({ message: 'Hello world' });
    const textarea = screen.getByPlaceholderText(
      'Ask anything... @ files, $ skills, / commands',
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Hello world');
  });

  test('calls onMessageChange when textarea value changes', () => {
    const { onMessageChange } = renderInput();
    const textarea = screen.getByPlaceholderText('Ask anything... @ files, $ skills, / commands');
    fireEvent.change(textarea, { target: { value: 'test' } });
    expect(onMessageChange).toHaveBeenCalledWith('test');
  });

  test('calls onSubmit when send button is clicked', () => {
    const { onSubmit } = renderInput({ message: 'hello' });
    fireEvent.click(screen.getByLabelText('Send message'));
    expect(onSubmit).toHaveBeenCalled();
  });

  test('calls onRecordingToggle when mic button is clicked', () => {
    const { onRecordingToggle } = renderInput();
    fireEvent.click(screen.getByLabelText('Start recording'));
    expect(onRecordingToggle).toHaveBeenCalled();
  });

  test('shows recording UI when isRecording is true', () => {
    renderInput({ isRecording: true, recordingTime: '1:23' });
    expect(screen.getByText('1:23')).toBeTruthy();
    expect(screen.getByLabelText('Stop recording')).toBeTruthy();
  });

  test('hides textarea when recording', () => {
    renderInput({ isRecording: true });
    expect(
      screen.queryByPlaceholderText('Ask anything... @ files, $ skills, / commands'),
    ).toBeNull();
  });

  test('disables send button when canSubmit is false', () => {
    renderInput({ canSubmit: false });
    const sendBtn = screen.getByLabelText('Send message') as HTMLButtonElement;
    expect(sendBtn.disabled).toBe(true);
  });

  test('applies monospace font in shell mode', () => {
    renderInput({ isShellMode: true });
    const textarea = screen.getByPlaceholderText('Ask anything... @ files, $ skills, / commands');
    expect(textarea.className).toContain('mono');
  });

  test('calls onKeyDown on keydown events', () => {
    const { onKeyDown } = renderInput();
    const textarea = screen.getByPlaceholderText('Ask anything... @ files, $ skills, / commands');
    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalled();
  });
});
