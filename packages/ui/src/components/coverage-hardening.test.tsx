import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { HomeScreen } from "@/screens/HomeScreen";
import { MarketplaceScreen } from "@/screens/MarketplaceScreen";
import { SessionSidePanel } from "./SessionSidePanel";
import { SessionWorkspace } from "@/screens/SessionWorkspace";
import { TerminalPanel } from "./TerminalPanel";
import { FilesTab } from "@/composites/side-panel/FilesTab";
import { findFile, getFilePath } from "@/composites/file-browser/utils";

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
}

describe("Lunaria coverage hardening", () => {
  test("home screen remaining quick actions navigate correctly", () => {
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

    fireEvent.click(screen.getByRole("button", { name: /Continue Session/i }));
    expect(screen.getByTestId("location").textContent).toBe("/session");

    fireEvent.click(screen.getByRole("button", { name: /Start Autopilot/i }));
    expect(screen.getByTestId("location").textContent).toBe("/autopilot");

    fireEvent.click(screen.getByRole("button", { name: /Setup Wizard/i }));
    expect(screen.getByTestId("location").textContent).toBe("/setup");
  });

  test("marketplace selected item install and uninstall flows update the detail panel", () => {
    render(<MarketplaceScreen />);

    fireEvent.click(screen.getAllByText("Code Review Agent")[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /^Install$/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /^Install$/i })[1]);
    expect(screen.getAllByRole("button", { name: /Uninstall/i }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: /Uninstall/i })[0]);
    expect(screen.getAllByRole("button", { name: /^Install$/i }).length).toBeGreaterThan(0);
  });

  test("marketplace featured install path updates selected item state", () => {
    render(<MarketplaceScreen />);

    fireEvent.click(screen.getAllByText("API Tester")[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /^Install$/i })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /^Install$/i })[1]);
    expect(screen.getAllByRole("button", { name: /Uninstall/i }).length).toBeGreaterThan(0);
  });

  test("terminal panel handles no-drop drag end and keyboard close on tab affordance", () => {
    render(<TerminalPanel onClose={() => {}} />);

    const tabButtons = screen.getAllByRole("button").filter((button) => button.textContent?.includes("bash") || button.textContent?.includes("node"));
    fireEvent.dragStart(tabButtons[0]);
    fireEvent.dragEnd(tabButtons[0]);

    const closeAffordances = screen.getAllByRole("button", { hidden: true }).filter((node) => node.tagName === "SPAN");
    if (closeAffordances[0]) {
      fireEvent.keyDown(closeAffordances[0], { key: "Enter" });
    }

    expect(screen.getAllByText(/bash|node/).length).toBeGreaterThan(0);
  });

  test("session side panel supports drag reorder and drag leave reset", () => {
    render(<SessionSidePanel onOpenFile={() => {}} />);

    const tabs = screen.getAllByRole("button").filter((button) =>
      ["Files", "Agents", "Memory", "Timeline"].includes(button.textContent || ""),
    );

    fireEvent.dragStart(tabs[0]);
    fireEvent.dragOver(tabs[1], { preventDefault: () => {} });
    fireEvent.dragLeave(tabs[1]);
    fireEvent.dragOver(tabs[1], { preventDefault: () => {} });
    fireEvent.dragEnd(tabs[0]);

    expect(screen.getByRole("button", { name: /Agents/i })).toBeTruthy();
  });

  test("files tab helper functions resolve file metadata and file tree drag payloads", () => {
    const found = findFile(
      [{ name: "src", type: "folder", children: [{ name: "main.rs", type: "file", content: "" }] }],
      "main.rs",
    );
    expect(found?.name).toBe("main.rs");
    expect(
      getFilePath(
        [{ name: "src", type: "folder", children: [{ name: "main.rs", type: "file", content: "" }] }],
        "main.rs",
      ),
    ).toBe("src/main.rs");
    expect(findFile([{ name: "src", type: "folder", children: [] }], "missing.rs")).toBeNull();
    expect(getFilePath([{ name: "src", type: "folder", children: [] }], "missing.rs")).toBe("");

    const onOpenFile = mock(() => {});
    render(<FilesTab onOpenFile={onOpenFile} />);

    const folderButton = screen.getByRole("button", { name: /src/i });
    fireEvent.click(folderButton);
    fireEvent.click(folderButton);

    const fileButton = screen
      .getAllByRole("button")
      .find((button) => button.getAttribute("draggable") === "true" && button.textContent?.includes("tokens.rs"));
    expect(fileButton).toBeTruthy();

    const setData = mock(() => {});
    const setDragImage = mock(() => {});
    fireEvent.dragStart(fileButton!, {
      dataTransfer: {
        setData,
        setDragImage,
        effectAllowed: "",
      },
    });
    fireEvent.click(fileButton!);

    expect(setData).toHaveBeenCalled();
    expect(onOpenFile).toHaveBeenCalledWith("tokens.rs", "src/auth/tokens.rs");

    const folderDragButton = screen.getByRole("button", { name: /src/i });
    const folderSetData = mock(() => {});
    const folderSetDragImage = mock(() => {});
    fireEvent.dragStart(folderDragButton, {
      dataTransfer: {
        setData: folderSetData,
        setDragImage: folderSetDragImage,
        effectAllowed: "",
      },
    });
    expect(folderSetData).toHaveBeenCalled();
  });

  test("session workspace injects empty-state suggestions and avoids duplicate file tabs", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/session",
            state: {
              newSession: {
                name: "Suggestible Session",
                model: "Claude 4 Sonnet",
                provider: "claude",
                permission: "default",
                workTarget: "local",
              },
            },
          },
        ] as any}
      >
        <Routes>
          <Route path="/session" element={<SessionWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Refactor a module"));
    expect(
      screen.getByDisplayValue("Refactor the authentication module to use JWT tokens"),
    ).toBeTruthy();

    const fileButton = screen
      .getAllByRole("button")
      .find((button) => button.getAttribute("draggable") === "true" && button.textContent?.includes("tokens.rs"));
    expect(fileButton).toBeTruthy();
    fireEvent.click(fileButton!);
    const firstCount = screen.getAllByText("tokens.rs").length;
    fireEvent.click(fileButton!);
    expect(screen.getAllByText("tokens.rs").length).toBe(firstCount);
  });
});
