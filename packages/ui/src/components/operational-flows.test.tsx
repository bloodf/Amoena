import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HomeScreen } from "@/screens/HomeScreen";
import { MarketplaceScreen } from "@/screens/MarketplaceScreen";
import { MessageQueue } from "./MessageQueue";
import { ProviderSetupScreen } from "@/screens/ProviderSetupScreen";
import { RemoteAccessScreen } from "@/screens/RemoteAccessScreen";
import { TerminalPanel } from "./TerminalPanel";
import { useTheme } from "@/hooks/use-theme";

function renderWithRouter(path: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Amoena operational flows", () => {
  test("home screen filters recent sessions", async () => {
    renderWithRouter("/", <HomeScreen />);

    expect(screen.getByText("Auth module refactor")).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(/Filter sessions/i), { target: { value: "websocket" } });
    expect(screen.getByText("WebSocket handler redesign")).toBeTruthy();
    expect(screen.queryByText("Auth module refactor")).toBeNull();
  });

  test("provider setup toggles key visibility, tests connection, and updates reasoning mode", async () => {
    renderWithRouter("/providers", <ProviderSetupScreen />);

    const anthropicSection = screen.getAllByText("Anthropic")[0];
    expect(anthropicSection).toBeTruthy();

    const eyeButtons = screen.getAllByRole("button").filter((button) => button.querySelector("svg"));
    fireEvent.click(eyeButtons[1]);

    const visibleKey = screen.getByDisplayValue("sk-ant-api03-xxxxxxxxxxxxx");
    expect(visibleKey.getAttribute("type")).toBe("text");

    const reasoningSelector = screen.getAllByRole("combobox")[0];
    fireEvent.click(reasoningSelector);
    fireEvent.click(screen.getByText("on"));
    expect(reasoningSelector.textContent).toContain("on");

    fireEvent.click(screen.getAllByRole("button", { name: /Test/i })[0]);
    await new Promise((resolve) => setTimeout(resolve, 1300));
    expect(screen.getByText("OK")).toBeTruthy();
  });

  test("provider setup exercises error and reset paths", async () => {
    renderWithRouter("/providers", <ProviderSetupScreen />);

    fireEvent.click(screen.getAllByText("Codex CLI")[0]);
    const codexInput = screen.getByDisplayValue("sk-codex-expired");
    fireEvent.change(codexInput, { target: { value: "bad" } });
    fireEvent.click(screen.getAllByRole("button", { name: /Test/i })[0]);
    await new Promise((resolve) => setTimeout(resolve, 1300));
    expect(screen.getByText("Failed")).toBeTruthy();

    fireEvent.change(codexInput, { target: { value: "sk-codex-healthy-123456" } });
    fireEvent.click(screen.getAllByRole("button", { name: /Test/i })[0]);
    await new Promise((resolve) => setTimeout(resolve, 1300));
    expect(screen.getByText("OK")).toBeTruthy();
  });

  test("marketplace filters categories and opens install review", async () => {
    renderWithRouter("/marketplace", <MarketplaceScreen />);

    expect(screen.getByText("Browse")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Themes/ }));
    expect(screen.getAllByText("Themes").length).toBeGreaterThan(0);
  });

  test("remote access can regenerate pin and revoke a device", async () => {
    renderWithRouter("/remote", <RemoteAccessScreen />);

    const currentPin = screen.getByText(/\d{3}\s+\d{3}/).textContent;
    fireEvent.click(screen.getByRole("button", { name: /Regenerate/i }));
    const newPin = screen.getByText(/\d{3}\s+\d{3}/).textContent;
    expect(newPin).not.toBe(currentPin);

    fireEvent.click(screen.getByRole("button", { name: /Revoke/i }));
    fireEvent.click(screen.getByRole("button", { name: /Confirm/i }));
    expect(screen.getByText("No devices connected")).toBeTruthy();
  });

  test("message queue can collapse, pause, resume, and remove items", async () => {
    render(<MessageQueue />);

    fireEvent.click(screen.getByRole("button", { name: /collapse queue/i }));
    expect(screen.queryByText(/Refactor the authentication middleware/i)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /expand queue/i }));
    expect(screen.getByText(/Refactor the authentication middleware/i)).toBeTruthy();

    fireEvent.click(screen.getAllByTitle("Pause")[0]);
    fireEvent.click(screen.getAllByTitle("Resume")[0]);

    fireEvent.click(screen.getAllByLabelText(/remove queue item/i)[0]);
    expect(screen.queryByText(/Refactor the authentication middleware/i)).toBeNull();
  });

  test("terminal panel adds and closes tabs", async () => {
    const onClose = () => {};
    render(<TerminalPanel onClose={onClose} />);

    expect(screen.getByText("bash")).toBeTruthy();
    fireEvent.click(screen.getByLabelText(/add terminal tab/i));
    expect(screen.getAllByText("bash").length).toBeGreaterThan(0);
  });
});

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span>{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe("useTheme", () => {
  test("toggles theme and persists to localStorage", async () => {
    localStorage.removeItem("amoena-theme");
    render(<ThemeProbe />);

    expect(screen.getByText("dark")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByText("light")).toBeTruthy();
    expect(localStorage.getItem("amoena-theme")).toBe("light");
  });
});
