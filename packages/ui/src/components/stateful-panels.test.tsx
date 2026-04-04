import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, mock, test, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { FileEditorTab } from "./FileEditorTab";
import { MessageQueue } from "./MessageQueue";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { SessionSidePanel } from "./SessionSidePanel";
import { TerminalPanel } from "./TerminalPanel";
import { FilesTab } from "@/composites/side-panel/FilesTab";
import { TimelineTab } from "@/composites/side-panel/TimelineTab";

function renderSettingsAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/settings/:section" element={<SettingsScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Amoena stateful panels", () => {
  test("renders privacy settings content", () => {
    renderSettingsAt("/settings/privacy");

    expect(screen.getByText("Usage analytics")).toBeTruthy();
    expect(screen.getByText("Auto-redact secrets")).toBeTruthy();
    expect(screen.getByText("Clear all session history")).toBeTruthy();
  });

  test("renders advanced settings content", () => {
    renderSettingsAt("/settings/advanced");

    expect(screen.getByText("Developer mode")).toBeTruthy();
    expect(screen.getByText("Experimental features")).toBeTruthy();
    expect(screen.getByText("Axum runtime port")).toBeTruthy();
  });

  test("renders remote settings content", () => {
    renderSettingsAt("/settings/remote");

    expect(screen.getAllByText("Remote Access").length).toBeGreaterThan(0);
    expect(screen.getByText("LAN Direct")).toBeTruthy();
    expect(screen.getByText("Allow remote terminal access")).toBeTruthy();
  });

  test("renders memory settings content", () => {
    renderSettingsAt("/settings/memory");

    expect(screen.getByText("Observation retention")).toBeTruthy();
    expect(screen.getByText("Auto-inject relevant memory")).toBeTruthy();
    expect(screen.getByText(/Export Memory/i)).toBeTruthy();
  });

  test("renders permissions settings content", () => {
    renderSettingsAt("/settings/permissions");

    expect(screen.getByText("Default approval mode")).toBeTruthy();
    expect(screen.getByText("File deletion")).toBeTruthy();
    expect(screen.getByText(/Per-workspace permission overrides/i)).toBeTruthy();
  });

  test("renders keybindings and plugin settings content", () => {
    render(
      <MemoryRouter initialEntries={["/settings/keybindings"]}>
        <Routes>
          <Route path="/settings/:section" element={<SettingsScreen />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Open Command Palette")).toBeTruthy();
    expect(screen.getAllByText("⌘K").length).toBeGreaterThan(0);
  });

  test("renders plugin settings content", () => {
    render(
      <MemoryRouter initialEntries={["/settings/plugins"]}>
        <Routes>
          <Route path="/settings/:section" element={<SettingsScreen />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Git Integration Pro").length).toBeGreaterThan(0);
    expect(screen.getByText(/Browse Marketplace/i)).toBeTruthy();
  });

  test("renders themes settings content", () => {
    renderSettingsAt("/settings/themes");

    expect(screen.getByText("Amoena Dark")).toBeTruthy();
    expect(screen.getByText("Accent color")).toBeTruthy();
    expect(screen.getByText("UI density")).toBeTruthy();
  });

  test("renders notifications settings content", () => {
    renderSettingsAt("/settings/notifications");

    expect(screen.getByText("Show toast notifications")).toBeTruthy();
    expect(screen.getByText("Critical alerts")).toBeTruthy();
    expect(screen.getByText("Mobile push notifications")).toBeTruthy();
  });

  test("renders workspace settings content", () => {
    renderSettingsAt("/settings/workspace");

    expect(screen.getByText("Default worktree location")).toBeTruthy();
    expect(screen.getByText("Clone strategy")).toBeTruthy();
    expect(screen.getByText("Merge-review behavior")).toBeTruthy();
  });

  test("renders general, editor, terminal, session, and providers settings content", () => {
    const general = renderSettingsAt("/settings/general");
    expect(screen.getByText("Startup behavior")).toBeTruthy();
    expect(screen.getByText("Auto-save sessions")).toBeTruthy();
    general.unmount();

    const editor = renderSettingsAt("/settings/editor");
    expect(screen.getByText("Diff view")).toBeTruthy();
    expect(screen.getByText("Minimap")).toBeTruthy();
    editor.unmount();

    const terminal = renderSettingsAt("/settings/terminal");
    expect(screen.getByText("Default shell")).toBeTruthy();
    expect(screen.getByText("Scrollback lines")).toBeTruthy();
    terminal.unmount();

    const session = renderSettingsAt("/settings/session-settings");
    expect(screen.getByText("Default reasoning mode")).toBeTruthy();
    expect(screen.getByText("Auto-include open files")).toBeTruthy();
    session.unmount();

    renderSettingsAt("/settings/providers");
    expect(screen.getByText("Provider Setup")).toBeTruthy();
    expect(screen.getAllByText("Anthropic").length).toBeGreaterThan(0);
    expect(screen.getByText("Ollama")).toBeTruthy();
  });

  test("settings sidebar navigation switches sections", () => {
    renderSettingsAt("/settings/general");

    fireEvent.click(screen.getByRole("button", { name: /Opinions/i }));
    expect(screen.getAllByText("Code Style").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Remote Access/i }));
    expect(screen.getAllByText("Remote Access").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Providers/i }));
    expect(screen.getByText("Provider Setup")).toBeTruthy();
  });

  test("file editor supports edit, save, and cancel flows", async () => {
    const user = userEvent.setup();
    render(<FileEditorTab fileName="tokens.rs" />);

    expect(screen.getAllByText("tokens.rs").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /edit/i }));

    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "updated token content");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByText(/updated token content/)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "discard me");
    await user.click(screen.getAllByRole("button")[1]);

    expect(screen.getByText(/updated token content/)).toBeTruthy();
  });

  test("timeline tab expands a checkpoint diff", () => {
    render(<TimelineTab />);

    expect(screen.getAllByText("Timeline").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /src\/auth\/jwt\.rs/i }));

    expect(screen.getByText(/ACCESS_TOKEN_EXPIRY: i64 = 900;.*15 minutes/)).toBeTruthy();
  });

  test("files tab opens a file from the tree", async () => {
    const user = userEvent.setup();
    const opened: string[] = [];

    render(<FilesTab onOpenFile={(fileName) => opened.push(fileName)} />);

    const target = screen
      .getAllByRole("button")
      .find((button) => button.getAttribute("draggable") === "true" && button.textContent?.includes("tokens.rs"));
    expect(target).toBeTruthy();
    await user.click(target!);
    expect(opened).toEqual(["tokens.rs"]);
  });

  test("message queue reorders, pauses, and fully removes items", async () => {
    const user = userEvent.setup();
    render(<MessageQueue />);

    const queueItems = screen.getAllByLabelText(/remove queue item/i);
    expect(queueItems.length).toBe(4);

    const draggableRows = screen.getAllByTitle(/Pause|Resume/i).map((button) => button.closest("div[class*='group']")!).filter(Boolean);
    fireEvent.dragStart(draggableRows[0]);
    fireEvent.dragOver(draggableRows[2]);
    fireEvent.dragEnd(draggableRows[0]);

    await user.click(screen.getAllByTitle("Pause")[0]);
    await user.click(screen.getAllByTitle("Resume")[0]);

    while (screen.queryAllByLabelText(/remove queue item/i).length > 0) {
      await user.click(screen.getAllByLabelText(/remove queue item/i)[0]);
    }
    expect(screen.queryByText(/Queue \(/i)).toBeNull();
  });

  test("terminal panel can add, close tabs, reorder, and close panel", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn(() => {});
    render(<TerminalPanel onClose={onClose} />);

    await user.click(screen.getByLabelText(/add terminal tab/i));
    expect(screen.getAllByText("bash").length).toBeGreaterThan(1);

    const tabButtons = screen.getAllByRole("button").filter((button) => button.textContent?.includes("bash") || button.textContent?.includes("node"));
    fireEvent.dragStart(tabButtons[0]);
    fireEvent.dragOver(tabButtons[1]);
    fireEvent.dragEnd(tabButtons[0]);

    const closeers = screen.getAllByRole("button").filter((button) => button.textContent === "");
    await user.click(closeers[closeers.length - 1]);
    expect(onClose).toHaveBeenCalled();
  });

  test("session side panel switches tabs", () => {
    render(<SessionSidePanel onOpenFile={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /agents/i }));
    expect(screen.getByText("Claude 4 Sonnet")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /memory/i }));
    expect(screen.getByPlaceholderText(/Search memory/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /timeline/i }));
    expect(screen.getAllByText("Timeline").length).toBeGreaterThan(0);
  });
});
