import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { ComposerInputArea } from "./ComposerInputArea";

function makeProps(overrides: Partial<Parameters<typeof ComposerInputArea>[0]> = {}) {
  return {
    isRecording: false,
    recordingTime: "00:00",
    isShellMode: false,
    message: "",
    canSubmit: true,
    textareaRef: { current: null },
    canvasRef: { current: null },
    onMessageChange: vi.fn((_v: string) => {}),
    onKeyDown: vi.fn((_e: React.KeyboardEvent) => {}),
    onPaste: vi.fn((_e: React.ClipboardEvent) => {}),
    onRecordingToggle: vi.fn(() => {}),
    onSubmit: vi.fn(() => {}),
    ...overrides,
  };
}

describe("ComposerInputArea", () => {
  test("renders textarea when not recording", () => {
    render(<ComposerInputArea {...makeProps()} />);
    expect(screen.getByPlaceholderText(/Ask anything/)).toBeTruthy();
  });

  test("shows recording UI when isRecording", () => {
    render(<ComposerInputArea {...makeProps({ isRecording: true, recordingTime: "01:23" })} />);
    expect(screen.getByText("01:23")).toBeTruthy();
  });

  test("hides textarea when recording", () => {
    render(<ComposerInputArea {...makeProps({ isRecording: true })} />);
    expect(screen.queryByPlaceholderText(/Ask anything/)).toBeNull();
  });

  test("calls onMessageChange when typing", () => {
    const onMessageChange = vi.fn((_v: string) => {});
    render(<ComposerInputArea {...makeProps({ onMessageChange })} />);
    fireEvent.change(screen.getByPlaceholderText(/Ask anything/), { target: { value: "hello" } });
    expect(onMessageChange).toHaveBeenCalledWith("hello");
  });

  test("calls onRecordingToggle when mic button clicked", () => {
    const onRecordingToggle = vi.fn(() => {});
    render(<ComposerInputArea {...makeProps({ onRecordingToggle })} />);
    fireEvent.click(screen.getByLabelText("Start recording"));
    expect(onRecordingToggle).toHaveBeenCalled();
  });

  test("shows Stop recording label when recording", () => {
    render(<ComposerInputArea {...makeProps({ isRecording: true })} />);
    expect(screen.getByLabelText("Stop recording")).toBeTruthy();
  });

  test("calls onSubmit when send button clicked", () => {
    const onSubmit = vi.fn(() => {});
    render(<ComposerInputArea {...makeProps({ onSubmit })} />);
    fireEvent.click(screen.getByLabelText("Send message"));
    expect(onSubmit).toHaveBeenCalled();
  });

  test("applies shell mode styling", () => {
    render(<ComposerInputArea {...makeProps({ isShellMode: true })} />);
    const textarea = screen.getByPlaceholderText(/Ask anything/);
    expect(textarea.className).toContain("font-mono");
  });
});
