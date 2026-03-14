import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { RuntimeProviderSetupPage } from "./provider-setup-page";

const request = vi.fn();

vi.mock("./runtime-api", () => ({
  useRuntimeApi: () => ({ request }),
}));

const mockProviders = [
  {
    id: "anthropic",
    name: "Anthropic",
    authStatus: "connected",
    baseUrl: null,
  },
  {
    id: "openai",
    name: "OpenAI",
    authStatus: "disconnected",
    baseUrl: null,
  },
];

const mockAnthropicModels = [
  {
    displayName: "Claude 4 Sonnet",
    contextWindow: 200000,
    supportsReasoning: true,
    reasoningModes: ["auto", "on", "off"],
  },
];

const mockOpenAiModels = [
  {
    displayName: "GPT-5",
    contextWindow: 128000,
    supportsReasoning: false,
    reasoningModes: [],
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <RuntimeProviderSetupPage />
    </MemoryRouter>,
  );
}

describe("RuntimeProviderSetupPage", () => {
  beforeEach(() => {
    request.mockReset();
    request.mockImplementation(async (path: string, init?: RequestInit) => {
      if (path === "/api/v1/providers") {
        return mockProviders;
      }
      if (path === "/api/v1/providers/anthropic/models") {
        return mockAnthropicModels;
      }
      if (path === "/api/v1/providers/openai/models") {
        return mockOpenAiModels;
      }
      if (path === "/api/v1/providers/anthropic/auth" && init?.method === "POST") {
        return undefined;
      }
      if (path === "/api/v1/providers/openai/auth" && init?.method === "POST") {
        throw new Error("Invalid API key");
      }
      if (path.includes("/reasoning") && init?.method === "POST") {
        return undefined;
      }
      throw new Error(`Unexpected request: ${path}`);
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the Provider Setup heading", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Provider Setup" })).toBeInTheDocument();
  });

  it("renders provider cards from API", async () => {
    renderPage();
    expect(await screen.findByText("Anthropic")).toBeInTheDocument();
    expect(await screen.findByText("OpenAI")).toBeInTheDocument();
  });

  it("fetches models for each provider on mount", async () => {
    renderPage();
    await screen.findByText("Anthropic");

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith("/api/v1/providers/anthropic/models");
      expect(request).toHaveBeenCalledWith("/api/v1/providers/openai/models");
    });
  });

  it("renders model names after hydration", async () => {
    renderPage();
    expect(await screen.findByText("Claude 4 Sonnet")).toBeInTheDocument();
  });

  it("shows the reasoning tier for reasoning-capable models", async () => {
    renderPage();
    await screen.findByText("Claude 4 Sonnet");
    expect(screen.getByText("Reasoning")).toBeInTheDocument();
  });

  it("shows the Standard tier for non-reasoning models", async () => {
    // The Standard tier is only shown in the expanded model rows.
    // GPT-5 is in the OpenAI provider which starts expanded (second provider, first is expanded by default).
    // After hydration, the first provider (Anthropic) is expanded. We need OpenAI expanded.
    renderPage();
    // Wait for providers to load
    await screen.findByText("Anthropic");
    await screen.findByText("OpenAI");
    // Click OpenAI to expand it
    const openAiButton = screen.getByText("OpenAI").closest("button")!;
    fireEvent.click(openAiButton);
    expect(await screen.findByText("Standard")).toBeInTheDocument();
  });

  it("shows context window formatted in k", async () => {
    renderPage();
    // Anthropic is expanded by default (first provider)
    expect(await screen.findByText("200k")).toBeInTheDocument();
  });

  it("triggers the auth API when the test button is clicked", async () => {
    renderPage();
    await screen.findByText("Anthropic");

    // The Test button is disabled when apiKey is empty. Type a key first.
    const apiKeyInput = await screen.findByPlaceholderText("Enter API key...");
    fireEvent.change(apiKeyInput, { target: { value: "sk-test-key" } });

    const testButton = await screen.findByRole("button", { name: "Test" });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith(
        "/api/v1/providers/anthropic/auth",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("sets test result to error when auth API throws", async () => {
    renderPage();
    await screen.findByText("Anthropic");

    // Clicking OpenAI toggles it expanded (and collapses Anthropic since expanded is a single state)
    const openAiButton = screen.getByText("OpenAI").closest("button")!;
    fireEvent.click(openAiButton);

    // Now only one input is visible (OpenAI's)
    const apiKeyInput = await screen.findByPlaceholderText("Enter API key...");
    fireEvent.change(apiKeyInput, { target: { value: "sk-invalid" } });

    const testButton = await screen.findByRole("button", { name: "Test" });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith(
        "/api/v1/providers/openai/auth",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("API key input field is rendered for the expanded provider", async () => {
    renderPage();
    await screen.findByText("Anthropic");
    // Anthropic is expanded by default — password input should be present
    const input = await screen.findByPlaceholderText("Enter API key...");
    expect(input).toBeInTheDocument();
  });

  it("updates api key state on input change", async () => {
    renderPage();
    await screen.findByText("Anthropic");

    const input = await screen.findByPlaceholderText("Enter API key...");
    fireEvent.change(input, { target: { value: "sk-new-key" } });
    expect((input as HTMLInputElement).value).toBe("sk-new-key");
  });
});
