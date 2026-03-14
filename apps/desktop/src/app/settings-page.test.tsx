import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { RuntimeSettingsPage } from "./settings-page";

const request = vi.fn();

vi.mock("./runtime-api", () => ({
  useRuntimeApi: () => ({ request }),
}));

// Provider setup page mock — avoid real network calls inside settings
vi.mock("./provider-setup-page", () => ({
  RuntimeProviderSetupPage: () => <div>Provider Setup Page</div>,
}));

// Remote access page mock
vi.mock("./remote-access-page", () => ({
  RuntimeRemoteAccessPage: () => <div>Remote Access Page</div>,
}));

const mockSettings = {
  remoteAccess: {
    enabled: false,
    lanEnabled: false,
    relayEnabled: false,
    relayEndpoint: "relay.lunaria.app",
  },
  settings: {},
};

const mockPlugins = [
  {
    id: "git-integration-pro",
    name: "Git Integration Pro",
    version: "2.1.0",
    enabled: true,
    healthStatus: "healthy",
    capabilities: ["git", "file_read"],
  },
  {
    id: "docker-plugin",
    name: "Docker Plugin",
    version: "1.0.0",
    enabled: false,
    healthStatus: "healthy",
    capabilities: ["docker"],
  },
];

const mockInstallReview = {
  id: "my-plugin",
  source: "registry",
  trusted: false,
  warnings: ["unsigned_plugin"],
  manifestUrl: "https://example.com/manifest.json",
  title: "My Plugin",
};

function renderPage(section = "") {
  const path = section ? `/settings/${section}` : "/settings";
  const routePath = section ? "/settings/:section" : "/settings";
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={<RuntimeSettingsPage />} />
        <Route path="/settings" element={<RuntimeSettingsPage />} />
        <Route path="/setup" element={<div>Setup Wizard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RuntimeSettingsPage", () => {
  beforeEach(() => {
    request.mockReset();
    request.mockImplementation(async (path: string, init?: RequestInit) => {
      if (path === "/api/v1/settings" && (!init || !init.method || init.method === "GET")) {
        return mockSettings;
      }
      if (path === "/api/v1/settings" && init?.method === "POST") {
        return undefined;
      }
      if (path === "/api/v1/plugins" && (!init || !init.method || init.method === "GET")) {
        return mockPlugins;
      }
      if (path === "/api/v1/plugins/install-review" && init?.method === "POST") {
        return mockInstallReview;
      }
      if (path.match(/\/api\/v1\/plugins\/.+/) && init?.method === "POST") {
        return undefined;
      }
      throw new Error(`Unexpected request: ${path}`);
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the General section by default", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "General" })).toBeInTheDocument();
  });

  it("renders remote access toggle in general section", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "General" });
    expect(screen.getByText("Remote access")).toBeInTheDocument();
  });

  it("renders relay endpoint display", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "General" });
    expect(await screen.findByText("relay.lunaria.app")).toBeInTheDocument();
  });

  it("shows relay transport toggle in general section", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "General" });
    expect(screen.getByText("Relay transport")).toBeInTheDocument();
  });

  it("posts settings update when remote access toggle fires", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "General" });
    await screen.findByText("relay.lunaria.app");

    const toggleButtons = screen.getAllByRole("button").filter((b) =>
      b.className.includes("rounded-full"),
    );
    expect(toggleButtons.length).toBeGreaterThan(0);
    fireEvent.click(toggleButtons[0]!);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith(
        "/api/v1/settings",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("renders plugins section when navigating to plugins", async () => {
    renderPage("plugins");
    expect(await screen.findByRole("heading", { name: "Plugins / Extensions" })).toBeInTheDocument();
  });

  it("lists plugins from API in plugins section", async () => {
    renderPage("plugins");
    expect(await screen.findByText("Git Integration Pro")).toBeInTheDocument();
    expect(await screen.findByText("Docker Plugin")).toBeInTheDocument();
  });

  it("shows plugin version and health status", async () => {
    renderPage("plugins");
    await screen.findByText("Git Integration Pro");
    expect(screen.getByText(/v2\.1\.0.*healthy.*git, file_read/)).toBeInTheDocument();
  });

  it("renders plugin toggle state correctly", async () => {
    renderPage("plugins");
    await screen.findByText("Git Integration Pro");

    const toggleButtons = screen.getAllByRole("button").filter((b) =>
      b.className.includes("rounded-full"),
    );
    expect(toggleButtons.length).toBeGreaterThan(0);
  });

  it("sends plugin toggle request on click", async () => {
    renderPage("plugins");
    await screen.findByText("Git Integration Pro");

    const toggleButtons = screen.getAllByRole("button").filter((b) =>
      b.className.includes("rounded-full"),
    );
    fireEvent.click(toggleButtons[0]!);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith(
        "/api/v1/plugins/git-integration-pro",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("renders deeplink install review textarea", async () => {
    renderPage("plugins");
    await screen.findByRole("heading", { name: "Plugins / Extensions" });
    expect(
      screen.getByPlaceholderText(/lunaria:\/\/plugin\/install/i),
    ).toBeInTheDocument();
  });

  it("sends install review request and shows result", async () => {
    renderPage("plugins");
    await screen.findByRole("heading", { name: "Plugins / Extensions" });

    const textarea = screen.getByPlaceholderText(/lunaria:\/\/plugin\/install/i);
    fireEvent.change(textarea, {
      target: { value: "lunaria://plugin/install?id=my-plugin&source=registry" },
    });
    fireEvent.click(screen.getByText("Review Deeplink"));

    await waitFor(() => {
      expect(screen.getByText("My Plugin")).toBeInTheDocument();
      expect(screen.getByText("unsigned_plugin")).toBeInTheDocument();
      expect(screen.getByText("https://example.com/manifest.json")).toBeInTheDocument();
      expect(screen.getByText("Untrusted")).toBeInTheDocument();
    });
  });

  it("renders the Setup Wizard panel in advanced section", async () => {
    renderPage("advanced");
    expect(await screen.findByRole("heading", { name: "Setup Wizard" })).toBeInTheDocument();
  });

  it("renders the re-open setup wizard button", async () => {
    renderPage("advanced");
    await screen.findByRole("heading", { name: "Setup Wizard" });
    expect(screen.getByRole("button", { name: "Re-open Setup Wizard" })).toBeInTheDocument();
  });

  it("renders providers sub-page when section is providers", async () => {
    renderPage("providers");
    expect(await screen.findByText("Provider Setup Page")).toBeInTheDocument();
  });

  it("renders remote access sub-page when section is remote", async () => {
    renderPage("remote");
    expect(await screen.findByText("Remote Access Page")).toBeInTheDocument();
  });

  it("renders sidebar navigation", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "General" });
    expect(screen.getByText("Plugins / Extensions")).toBeInTheDocument();
  });
});
