import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { ExtensionPanel } from "./ExtensionPanel";

const extensions = [
  { id: "ext-1", name: "Git Helper", version: "1.0.0", publisher: "Amoena", description: "Advanced git integration", enabled: true, permissions: ["fs.read", "fs.write"] },
  { id: "ext-2", name: "Code Formatter", version: "0.5.0", description: "Auto-format code on save", enabled: false, permissions: ["fs.write"] },
];

function makeHandlers() {
  return {
    onToggle: mock(() => {}),
    onUninstall: mock(() => {}),
    onInstall: mock(() => {}),
  };
}

describe("ExtensionPanel", () => {
  test("shows empty state when no extensions", () => {
    render(<ExtensionPanel extensions={[]} {...makeHandlers()} />);
    const paras = document.querySelectorAll("p");
    expect(paras.length).toBeGreaterThan(0);
  });

  test("renders extension list", () => {
    render(<ExtensionPanel extensions={extensions} {...makeHandlers()} />);
    expect(screen.getByText("Git Helper")).toBeTruthy();
    expect(screen.getByText("Code Formatter")).toBeTruthy();
  });

  test("shows enabled/disabled status", () => {
    render(<ExtensionPanel extensions={extensions} {...makeHandlers()} />);
    // enabled ext shows "extensions.enabled" key (or translated value)
    const buttons = screen.getAllByRole("button");
    const statusButtons = buttons.filter(
      (b) => b.textContent?.includes("enabled") || b.textContent?.includes("disabled") || b.textContent?.includes("extensions.enabled") || b.textContent?.includes("extensions.disabled"),
    );
    expect(statusButtons.length).toBeGreaterThan(0);
  });

  test("calls onToggle on toggle button click for enabled extension", () => {
    const handlers = makeHandlers();
    render(<ExtensionPanel extensions={extensions} {...handlers} />);
    const toggleButtons = screen.getAllByRole("button").filter(
      (b) => b.textContent?.includes("enabled") || b.textContent?.includes("disabled") || b.textContent?.includes("extensions.enabled") || b.textContent?.includes("extensions.disabled"),
    );
    fireEvent.click(toggleButtons[0]);
    expect(handlers.onToggle).toHaveBeenCalledWith("ext-1", false);
  });

  test("calls onToggle on toggle button click for disabled extension", () => {
    const handlers = makeHandlers();
    render(<ExtensionPanel extensions={extensions} {...handlers} />);
    const toggleButtons = screen.getAllByRole("button").filter(
      (b) => b.textContent?.includes("enabled") || b.textContent?.includes("disabled") || b.textContent?.includes("extensions.enabled") || b.textContent?.includes("extensions.disabled"),
    );
    fireEvent.click(toggleButtons[1]);
    expect(handlers.onToggle).toHaveBeenCalledWith("ext-2", true);
  });

  test("calls onUninstall on uninstall click", () => {
    const handlers = makeHandlers();
    render(<ExtensionPanel extensions={extensions} {...handlers} />);
    const uninstallButtons = screen.getAllByRole("button").filter(
      (b) => b.textContent?.includes("uninstall") || b.textContent?.includes("extensions.uninstall"),
    );
    fireEvent.click(uninstallButtons[0]);
    expect(handlers.onUninstall).toHaveBeenCalledWith("ext-1");
  });

  test("calls onInstall on Install button click", () => {
    const handlers = makeHandlers();
    render(<ExtensionPanel extensions={extensions} {...handlers} />);
    const installBtn = screen.getAllByRole("button").find(
      (b) => b.className.includes("primary") || b.textContent?.includes("install") || b.textContent?.includes("extensions.install"),
    );
    expect(installBtn).toBeTruthy();
    fireEvent.click(installBtn!);
    expect(handlers.onInstall).toHaveBeenCalled();
  });
});
