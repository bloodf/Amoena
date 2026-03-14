import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { waitFor } from "@testing-library/react";
import { SessionComposer } from "./SessionComposer";

const session = {
  provider: "opencode",
  permission: "full",
  continueIn: "local" as const,
  branch: "main",
};

describe("SessionComposer", () => {
  test("injects external message and consumes callback", () => {
    const consumed = mock(() => {});
    render(
      <SessionComposer
        provider="opencode"
        session={session}
        externalMessage="Refactor auth flow"
        onExternalMessageConsumed={consumed}
      />,
    );

    expect(screen.getByDisplayValue("Refactor auth flow")).toBeTruthy();
    expect(consumed).toHaveBeenCalled();
  });

  test("opens file picker with @ mention and attaches selected file", () => {
    render(<SessionComposer provider="opencode" session={session} />);

    const input = screen.getByPlaceholderText(/Ask anything\.\.\./i);
    fireEvent.change(input, { target: { value: "@tok" } });
    fireEvent.click(screen.getByText("src/auth/tokens.rs"));

    expect(screen.getByText("tokens.rs")).toBeTruthy();
  });

  test("opens unified palette with slash commands and selects a command", () => {
    render(<SessionComposer provider="opencode" session={session} />);

    const input = screen.getByPlaceholderText(/Ask anything\.\.\./i);
    fireEvent.change(input, { target: { value: "/mod" } });
    expect(screen.getByText("Commands")).toBeTruthy();
    fireEvent.click(screen.getByText("/model"));

    expect((screen.getByPlaceholderText(/Ask anything\.\.\./i) as HTMLTextAreaElement).value).toBe("/model ");
  });

  test("opens skills picker with dollar trigger and inserts a skill command", () => {
    render(<SessionComposer provider="opencode" session={session} />);

    const input = screen.getByPlaceholderText(/Ask anything\.\.\./i);
    fireEvent.change(input, { target: { value: "$brain" } });
    expect(screen.getByText("Skills")).toBeTruthy();
    fireEvent.click(screen.getByText("Brainstorming"));

    expect(screen.getByDisplayValue("")).toBeTruthy();
  });

  test("updates work target, permission, branch, reasoning, and agent via pickers", () => {
    const onUpdateSession = mock(() => {});
    render(
      <SessionComposer
        provider="opencode"
        session={session}
        onUpdateSession={onUpdateSession}
      />,
    );

    fireEvent.click(screen.getByLabelText(/open work target picker/i));
    fireEvent.click(screen.getByText("New worktree"));
    expect(onUpdateSession).toHaveBeenCalledWith({ continueIn: "worktree" });

    fireEvent.click(screen.getByLabelText(/open permission picker/i));
    fireEvent.click(screen.getByText("Plan only"));
    expect(onUpdateSession).toHaveBeenCalledWith({ permission: "plan-only" });

    fireEvent.click(screen.getByLabelText(/open branch picker/i));
    fireEvent.click(screen.getByText("feature/jwt-auth"));
    expect(onUpdateSession).toHaveBeenCalledWith({ branch: "feature/jwt-auth" });

    fireEvent.click(screen.getByLabelText(/open reasoning picker/i));
    fireEvent.click(screen.getByText("Medium"));
    expect(screen.getByText("medium")).toBeTruthy();

    fireEvent.click(screen.getByLabelText(/open agent picker/i));
    fireEvent.click(screen.getByText("Atlas"));
    expect(screen.getByText("Atlas")).toBeTruthy();
  });

  test("toggles plan mode from composer actions and removes attachments", () => {
    render(<SessionComposer provider="opencode" session={session} />);

    const input = screen.getByPlaceholderText(/Ask anything\.\.\./i);
    fireEvent.change(input, { target: { value: "@tok" } });
    fireEvent.click(screen.getByText("src/auth/tokens.rs"));
    expect(screen.getByText("tokens.rs")).toBeTruthy();

    fireEvent.click(screen.getByLabelText(/open composer actions/i));
    fireEvent.click(screen.getByText("Plan mode"));
    expect(screen.getByText("PLAN")).toBeTruthy();

    const attachmentLabel = screen.getByText("tokens.rs");
    const attachmentChip = attachmentLabel.closest("div");
    expect(attachmentChip).toBeTruthy();
    const removeButton = attachmentChip?.querySelector("button");
    expect(removeButton).toBeTruthy();
    fireEvent.click(removeButton!);
    expect(screen.queryByText("tokens.rs")).toBeNull();
  });

  test("cycles agent on tab, opens palette with ctrl+p, and closes it with escape", () => {
    render(<SessionComposer provider="opencode" session={session} />);

    expect(screen.getByText("Sisyphus")).toBeTruthy();
    fireEvent.keyDown(screen.getByPlaceholderText(/Ask anything\.\.\./i), { key: "Tab" });
    expect(screen.getByText("Hephaestus")).toBeTruthy();

    fireEvent.keyDown(window, { key: "p", ctrlKey: true });
    expect(screen.getByText("Commands")).toBeTruthy();
    fireEvent.keyDown(screen.getByPlaceholderText(/Ask anything\.\.\./i), { key: "Escape" });
    expect(screen.queryByText("Commands")).toBeNull();
  });

  test("handles pasted files and dropped folder references", () => {
    render(<SessionComposer provider="opencode" session={session} />);

    const input = screen.getByPlaceholderText(/Ask anything\.\.\./i);
    fireEvent.paste(input, {
      clipboardData: {
        items: [
          {
            kind: "file",
            getAsFile: () => new File(["test"], "diagram.png", { type: "image/png" }),
          },
        ],
      },
    });

    expect(screen.getByText("diagram.png")).toBeTruthy();

    fireEvent.drop(input.closest("div")?.parentElement?.parentElement!, {
      preventDefault: () => {},
      dataTransfer: {
        getData: (type: string) =>
          type === "lunaria/file"
            ? JSON.stringify({
                type: "folder",
                name: "src/auth",
                path: "src/auth",
                itemCount: 7,
              })
            : "",
        files: [],
      },
    });

    expect(screen.getByText("src/auth")).toBeTruthy();
    expect(screen.getByText("(7 items)")).toBeTruthy();
  });

  test("can toggle plan mode on and off from composer actions", () => {
    render(<SessionComposer provider="opencode" session={session} />);

    fireEvent.click(screen.getByLabelText(/open composer actions/i));
    fireEvent.click(screen.getByText("Plan mode"));
    expect(screen.getByText("PLAN")).toBeTruthy();

    fireEvent.click(screen.getByLabelText(/open composer actions/i));
    fireEvent.click(screen.getByText("Plan mode"));
    expect(screen.queryByText("PLAN")).toBeNull();
  });

  test("supports recording start/stop and ctrl+t agent cycling", async () => {
    let frameCallback: FrameRequestCallback | undefined;
    const requestAnimationFrameMock = mock((callback: FrameRequestCallback) => {
      frameCallback = callback;
      return 1;
    });
    const cancelAnimationFrameMock = mock(() => {});

    Object.defineProperty(window, "requestAnimationFrame", { value: requestAnimationFrameMock, configurable: true });
    Object.defineProperty(window, "cancelAnimationFrame", { value: cancelAnimationFrameMock, configurable: true });
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: () => ({
        clearRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        set strokeStyle(_: string) {},
        set lineWidth(_: number) {},
      }),
      configurable: true,
    });

    const stream = { getTracks: () => [{ stop: mock(() => {}) }] } as unknown as MediaStream;
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: mock(async () => stream),
      },
      configurable: true,
    });

    class AudioContextMock {
      createMediaStreamSource() {
        return { connect: () => {} };
      }
      createAnalyser() {
        return {
          fftSize: 0,
          frequencyBinCount: 8,
          getByteTimeDomainData: (buffer: Uint8Array) => buffer.fill(128),
        };
      }
      close() {
        return Promise.resolve();
      }
    }

    Object.defineProperty(globalThis, "AudioContext", {
      value: AudioContextMock,
      configurable: true,
    });

    render(<SessionComposer provider="opencode" session={session} />);

    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(await screen.findByText("0:00")).toBeTruthy();
    frameCallback?.(0);

    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(screen.queryByText("0:00")).toBeNull();

    expect(screen.getByText("Sisyphus")).toBeTruthy();
    fireEvent.keyDown(window, { key: "t", ctrlKey: true });
    expect(screen.getByText("Hephaestus")).toBeTruthy();
  });

  test("selects agents and files from the slash palette", () => {
    render(<SessionComposer provider="opencode" session={session} />);

    const input = screen.getByPlaceholderText(/Ask anything\.\.\./i);
    fireEvent.change(input, { target: { value: "/atlas" } });
    fireEvent.click(screen.getByText("Atlas"));
    expect(screen.getByText("Atlas")).toBeTruthy();

    fireEvent.change(input, { target: { value: "/tokens" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("tokens.rs")).toBeTruthy();
  });

  test("closes dropdowns on outside click", () => {
    render(<SessionComposer provider="opencode" session={session} />);

    fireEvent.click(screen.getByLabelText(/open model picker/i));
    expect(screen.getByText("GPT-5.3 Codex")).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("GPT-5.3 Codex")).toBeNull();
  });

  test("submits message payload with attachments and reasoning state", async () => {
    const onSubmit = mock(() => {});
    render(<SessionComposer provider="opencode" session={session} onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(/Ask anything\.\.\./i);
    fireEvent.change(input, { target: { value: "@tok" } });
    fireEvent.click(screen.getByText("src/auth/tokens.rs"));

    fireEvent.change(input, { target: { value: "Ship the auth refactor" } });
    fireEvent.click(screen.getByLabelText(/open reasoning picker/i));
    fireEvent.click(screen.getByText("Low"));
    fireEvent.click(screen.getByLabelText(/send message/i));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: "sisyphus",
          attachments: [
            {
              itemCount: undefined,
              name: "tokens.rs",
              path: "src/auth/tokens.rs",
              type: "file",
            },
          ],
          branch: "main",
          continueIn: "local",
          message: "Ship the auth refactor",
          modelId: "gpt-5.4",
          permission: "full",
          planMode: false,
          provider: "opencode",
          reasoningLevel: "low",
        }),
      );
    });

    await waitFor(() => {
      expect((screen.getByPlaceholderText(/Ask anything\.\.\./i) as HTMLTextAreaElement).value).toBe("");
      expect(screen.queryByText("tokens.rs")).toBeNull();
    });
  });
});
