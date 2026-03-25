import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
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
    onMessageChange: mock((_v: string) => {}),
    onKeyDown: mock((_e: React.KeyboardEvent) => {}),
    onPaste: mock((_e: React.ClipboardEvent) => {}),
    onRecordingToggle: mock(() => {}),
    onSubmit: mock(() => {}),
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
    const onMessageChange = mock((_v: string) => {});
    render(<ComposerInputArea {...makeProps({ onMessageChange })} />);
    fireEvent.change(screen.getByPlaceholderText(/Ask anything/), { target: { value: "hello" } });
    expect(onMessageChange).toHaveBeenCalledWith("hello");
  });

  test("calls onRecordingToggle when mic button clicked", () => {
    const onRecordingToggle = mock(() => {});
    render(<ComposerInputArea {...makeProps({ onRecordingToggle })} />);
    fireEvent.click(screen.getByLabelText("Start recording"));
    expect(onRecordingToggle).toHaveBeenCalled();
  });

  test("shows Stop recording label when recording", () => {
    render(<ComposerInputArea {...makeProps({ isRecording: true })} />);
    expect(screen.getByLabelText("Stop recording")).toBeTruthy();
  });

  test("calls onSubmit when send button clicked", () => {
    const onSubmit = mock(() => {});
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
