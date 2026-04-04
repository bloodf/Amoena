import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { CommandPalette } from "./CommandPalette";
import { HomeScreen } from "@/screens/HomeScreen";
import { StatusBar } from "./StatusBar";

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

describe("navigation and status surfaces", () => {
  test("home quick actions navigate to target routes", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <HomeScreen />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Open Workspace/i }));
    expect(screen.getByTestId("location").textContent).toBe("/workspaces");

    fireEvent.click(screen.getByRole("button", { name: /Provider Setup/i }));
    expect(screen.getByTestId("location").textContent).toBe("/providers");
  });

  test("home rows and provider health actions navigate from repeated handlers", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <HomeScreen />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("New Session"));
    expect(screen.getByTestId("location").textContent).toBe("/session/new");

    fireEvent.click(screen.getByText("Auth module refactor"));
    expect(screen.getByTestId("location").textContent).toBe("/session");

    fireEvent.click(screen.getByText("View all →"));
    expect(screen.getByTestId("location").textContent).toBe("/workspaces");

    fireEvent.click(screen.getByText("amoena-runtime"));
    expect(screen.getByTestId("location").textContent).toBe("/workspaces");

    fireEvent.click(screen.getAllByText("Anthropic")[0]);
    expect(screen.getByTestId("location").textContent).toBe("/providers");
  });

  test("command palette filters and closes on escape", () => {
    const onClose = vi.fn(() => {});
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="*" element={<CommandPalette open onClose={onClose} />} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(/Search commands, files, agents, chat history/i);
    fireEvent.change(input, { target: { value: "workspace" } });
    expect(screen.getByText("Workspaces")).toBeTruthy();
    fireEvent.keyDown(input, { key: "Escape" });
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        expect(onClose).toHaveBeenCalled();
        resolve();
      }, 200),
    );
  });

  test("command palette enter selects highlighted result", () => {
    const onClose = vi.fn(() => {});
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <CommandPalette open onClose={onClose} />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(/Search commands, files, agents, chat history/i);
    fireEvent.change(input, { target: { value: "memory browser" } });
    fireEvent.keyDown(input, { key: "Enter" });
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        expect(onClose).toHaveBeenCalled();
        resolve();
      }, 200),
    );
  });

  test("command palette shows empty state and closes when clicking backdrop", () => {
    const onClose = vi.fn(() => {});
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="*" element={<CommandPalette open onClose={onClose} />} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(/Search commands, files, agents, chat history/i);
    fireEvent.change(input, { target: { value: "zzzzzz" } });
    expect(screen.getByText("No results found")).toBeTruthy();

    fireEvent.click(screen.getByText("No results found").parentElement!.parentElement!.parentElement!);
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        expect(onClose).toHaveBeenCalled();
        resolve();
      }, 200),
    );
  });

  test("command palette keyboard navigation can trigger a command action", () => {
    const onClose = vi.fn(() => {});
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="*" element={<CommandPalette open onClose={onClose} />} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(/Search commands, files, agents, chat history/i);
    fireEvent.change(input, { target: { value: "new session" } });
    fireEvent.keyDown(input, { key: "Enter" });
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        expect(onClose).toHaveBeenCalled();
        resolve();
      }, 200),
    );
  });

  test("status bar changes runtime location and expands rate limits", () => {
    render(<StatusBar />);

    fireEvent.click(screen.getByRole("button", { name: /Local/i }));
    fireEvent.click(screen.getByText("Relay"));
    expect(screen.getByText("Relay")).toBeTruthy();

    const rateButton = screen.getByRole("button", { name: /86% 92% 98%/i });
    fireEvent.click(rateButton);
    expect(screen.getByText("Rate Limits by Provider")).toBeTruthy();
    expect(screen.getAllByText("Anthropic").length).toBeGreaterThan(0);
  });

  test("status bar can switch through all runtime states and close dropdowns via outside click", () => {
    render(<StatusBar />);

    fireEvent.click(screen.getByRole("button", { name: /Local/i }));
    fireEvent.click(screen.getByText("Offline"));
    expect(screen.getByText("Offline")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Offline/i }));
    fireEvent.click(screen.getByText("Degraded"));
    expect(screen.getByText("Degraded")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /86% 92% 98%/i }));
    expect(screen.getByText("Rate Limits by Provider")).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Rate Limits by Provider")).toBeNull();
  });

  test("home screen empty search shows empty state", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="*" element={<HomeScreen />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/Filter sessions/i), { target: { value: "missing-session" } });
    expect(screen.getByText(/No sessions match "missing-session"/i)).toBeTruthy();
  });

  test("command palette navigation, agent, and history results all execute", () => {
    const cases = [
      { query: "marketplace", label: "Marketplace", path: "/marketplace" },
      { query: "claude 4 sonnet", label: "Claude 4 Sonnet", path: "/session" },
      { query: "websocket reconnection", label: "WebSocket reconnection strategy", path: "/session" },
    ];

    for (const item of cases) {
      const onClose = vi.fn(() => {});
      const view = render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route
              path="*"
              element={
                <>
                  <CommandPalette open onClose={onClose} />
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      const input = screen.getByPlaceholderText(/Search commands, files, agents, chat history/i);
      fireEvent.change(input, { target: { value: item.query } });
      fireEvent.click(screen.getByText(item.label));

      expect(screen.getByTestId("location").textContent).toBe(item.path);
      view.unmount();
    }
  });

  test("command palette executes the full actionable catalog", () => {
    const actionableLabels = [
      ["New Session", "/session"],
      ["Quick Prompt", "/session"],
      ["Start Autopilot", "/autopilot"],
      ["Settings", "/settings"],
      ["Memory Browser", "/memory"],
      ["Agent Management", "/agents"],
      ["Workspaces", "/workspaces"],
      ["Marketplace", "/marketplace"],
      ["Remote Access", "/remote"],
      ["Claude 4 Sonnet", "/session"],
      ["Gemini 2.5 Pro", "/session"],
      ["GPT-5.4", "/session"],
      ["How to implement JWT refresh tokens?", "/session"],
      ["Design a rate limiter with sliding window", "/session"],
      ["Optimize database connection pooling", "/session"],
      ["WebSocket reconnection strategy", "/session"],
    ] as const;

    for (const [label, path] of actionableLabels) {
      const onClose = vi.fn(() => {});
      const view = render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route
              path="*"
              element={
                <>
                  <CommandPalette open onClose={onClose} />
                  <LocationProbe />
                </>
              }
            />
          </Routes>
        </MemoryRouter>,
      );

      fireEvent.click(screen.getByText(label));
      expect(screen.getByTestId("location").textContent).toBe(path);
      view.unmount();
    }
  });
});
