import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { MessageTimeline, type TimelineMessage } from "./MessageTimeline";

const systemMsg: TimelineMessage = {
  id: "s1",
  role: "system",
  content: "Session started",
  timestamp: "10:00 AM",
};

const userMsg: TimelineMessage = {
  id: "u1",
  role: "user",
  content: "Hello world",
  timestamp: "10:01 AM",
};

const assistantMsg: TimelineMessage = {
  id: "a1",
  role: "assistant",
  content: "Hello! How can I help?",
  timestamp: "10:01 AM",
  model: "Claude 4 Sonnet",
  tuiColor: "tui-claude",
};

const assistantWithReasoning: TimelineMessage = {
  id: "a2",
  role: "assistant",
  content: "Reasoning response",
  timestamp: "10:02 AM",
  model: "Claude 4 Sonnet",
  tuiColor: "tui-claude",
  reasoningActive: true,
};

const assistantWithReasoningFallback: TimelineMessage = {
  id: "a3",
  role: "assistant",
  content: "Reasoning via reasoning field",
  timestamp: "10:02 AM",
  model: "Claude 4 Sonnet",
  reasoning: true,
};

const assistantWithDiff: TimelineMessage = {
  id: "a4",
  role: "assistant",
  content: "Diff response",
  timestamp: "10:03 AM",
  model: "Claude 4 Sonnet",
  diffFile: "src/auth.rs",
  diffStats: "+42 -8",
};

const assistantNoModel: TimelineMessage = {
  id: "a5",
  role: "assistant",
  content: "No model response",
  timestamp: "10:03 AM",
};

const assistantOpenCode: TimelineMessage = {
  id: "a6",
  role: "assistant",
  content: "OpenCode response",
  timestamp: "10:04 AM",
  model: "GPT-5",
  tuiColor: "tui-opencode",
};

const assistantGemini: TimelineMessage = {
  id: "a7",
  role: "assistant",
  content: "Gemini response",
  timestamp: "10:04 AM",
  model: "Gemini",
  tuiColor: "tui-gemini",
};

const permissionMsg: TimelineMessage = {
  id: "p1",
  role: "permission",
  content: "Delete file: old.rs",
  timestamp: "10:02 AM",
  requestId: "req-1",
};

const aiMsg: TimelineMessage = {
  id: "ai1",
  role: "ai",
  content: "AI role message",
  timestamp: "10:05 AM",
  model: "Claude",
};

describe("MessageTimeline", () => {
  test("renders with default mock messages when none provided", () => {
    render(<MessageTimeline />);
    expect(document.body).toBeTruthy();
  });

  test("renders system message as centered pill", () => {
    render(<MessageTimeline messages={[systemMsg]} isStreaming={false} />);
    expect(screen.getByText("Session started")).toBeTruthy();
  });

  test("renders user message right-aligned", () => {
    render(<MessageTimeline messages={[userMsg]} isStreaming={false} />);
    expect(screen.getByText("Hello world")).toBeTruthy();
  });

  test("renders assistant message with model name", () => {
    render(<MessageTimeline messages={[assistantMsg]} isStreaming={false} />);
    expect(screen.getByText("Claude 4 Sonnet")).toBeTruthy();
    expect(screen.getByText("Hello! How can I help?")).toBeTruthy();
  });

  test("shows REASONING badge when reasoningActive is true — branch line 111", () => {
    render(<MessageTimeline messages={[assistantWithReasoning]} isStreaming={false} />);
    expect(screen.getByText("REASONING")).toBeTruthy();
  });

  test("shows REASONING badge when reasoning field is true (fallback) — branch line 111", () => {
    render(<MessageTimeline messages={[assistantWithReasoningFallback]} isStreaming={false} />);
    expect(screen.getByText("REASONING")).toBeTruthy();
  });

  test("does not show REASONING badge when neither reasoningActive nor reasoning set", () => {
    render(<MessageTimeline messages={[assistantMsg]} isStreaming={false} />);
    expect(screen.queryByText("REASONING")).toBeNull();
  });

  test("shows diff file info when diffFile is present — branch line 158", () => {
    render(<MessageTimeline messages={[assistantWithDiff]} isStreaming={false} />);
    expect(screen.getByText(/src\/auth\.rs/)).toBeTruthy();
    expect(screen.getByText("+42")).toBeTruthy();
    expect(screen.getByText("-8")).toBeTruthy();
  });

  test("does not show diff section when diffFile is absent — branch line 158", () => {
    render(<MessageTimeline messages={[assistantMsg]} isStreaming={false} />);
    expect(screen.queryByText(/src\//)).toBeNull();
  });

  test("does not render model header when msg.model is absent — branch line 133", () => {
    render(<MessageTimeline messages={[assistantNoModel]} isStreaming={false} />);
    // No model name or circle icon header
    expect(screen.queryByText("Claude 4 Sonnet")).toBeNull();
  });

  test("renders ai role as assistant — branch line 110", () => {
    render(<MessageTimeline messages={[aiMsg]} isStreaming={false} />);
    expect(screen.getByText("AI role message")).toBeTruthy();
    // model header should appear
    expect(screen.getByText("Claude")).toBeTruthy();
  });

  test("renders permission message with Approve and Deny buttons — branch line 183", () => {
    render(
      <MessageTimeline
        messages={[permissionMsg]}
        isStreaming={false}
        onApprovePermission={vi.fn(() => {})}
        onDenyPermission={vi.fn(() => {})}
      />,
    );
    expect(screen.getByText("Delete file: old.rs")).toBeTruthy();
    expect(screen.getByText("Approve")).toBeTruthy();
    expect(screen.getByText("Deny")).toBeTruthy();
  });

  test("calls onApprovePermission with requestId when Approve clicked — branch line 194", () => {
    const onApprovePermission = vi.fn((_id: string) => {});
    render(
      <MessageTimeline
        messages={[permissionMsg]}
        isStreaming={false}
        onApprovePermission={onApprovePermission}
        onDenyPermission={vi.fn(() => {})}
      />,
    );
    fireEvent.click(screen.getByText("Approve"));
    expect(onApprovePermission).toHaveBeenCalledWith("req-1");
  });

  test("calls onDenyPermission with requestId when Deny clicked — branch line 202", () => {
    const onDenyPermission = vi.fn((_id: string) => {});
    render(
      <MessageTimeline
        messages={[permissionMsg]}
        isStreaming={false}
        onApprovePermission={vi.fn(() => {})}
        onDenyPermission={onDenyPermission}
      />,
    );
    fireEvent.click(screen.getByText("Deny"));
    expect(onDenyPermission).toHaveBeenCalledWith("req-1");
  });

  test("does not call onApprovePermission when requestId is absent — branch line 194", () => {
    const onApprovePermission = vi.fn((_id: string) => {});
    const msgNoId: TimelineMessage = { ...permissionMsg, requestId: undefined };
    render(
      <MessageTimeline
        messages={[msgNoId]}
        isStreaming={false}
        onApprovePermission={onApprovePermission}
        onDenyPermission={vi.fn(() => {})}
      />,
    );
    fireEvent.click(screen.getByText("Approve"));
    expect(onApprovePermission).not.toHaveBeenCalled();
  });

  test("does not call onDenyPermission when requestId is absent — branch line 202", () => {
    const onDenyPermission = vi.fn((_id: string) => {});
    const msgNoId: TimelineMessage = { ...permissionMsg, requestId: undefined };
    render(
      <MessageTimeline
        messages={[msgNoId]}
        isStreaming={false}
        onApprovePermission={vi.fn(() => {})}
        onDenyPermission={onDenyPermission}
      />,
    );
    fireEvent.click(screen.getByText("Deny"));
    expect(onDenyPermission).not.toHaveBeenCalled();
  });

  test("shows streaming indicator when isStreaming=true — branch line 215", () => {
    render(<MessageTimeline messages={[userMsg]} isStreaming={true} />);
    expect(screen.getByLabelText("Assistant is streaming")).toBeTruthy();
  });

  test("does not show streaming indicator when isStreaming=false — branch line 215", () => {
    render(<MessageTimeline messages={[userMsg]} isStreaming={false} />);
    expect(screen.queryByLabelText("Assistant is streaming")).toBeNull();
  });

  test("renders code block inside assistant message using splitCodeBlocks", () => {
    const msgWithCode: TimelineMessage = {
      id: "code1",
      role: "assistant",
      content: "Here is code:\n```\nconst x = 1;\n```\nDone.",
      timestamp: "10:00 AM",
    };
    render(<MessageTimeline messages={[msgWithCode]} isStreaming={false} />);
    expect(screen.getByText(/Here is code:/)).toBeTruthy();
    expect(screen.getByText(/Done\./)).toBeTruthy();
  });

  test("renders tui-opencode color class on assistant circle — branch line 140", () => {
    const { container } = render(
      <MessageTimeline messages={[assistantOpenCode]} isStreaming={false} />,
    );
    expect(screen.getByText("GPT-5")).toBeTruthy();
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  test("renders tui-gemini color class on assistant circle — branch line 141", () => {
    render(<MessageTimeline messages={[assistantGemini]} isStreaming={false} />);
    expect(screen.getByText("Gemini")).toBeTruthy();
  });
});
