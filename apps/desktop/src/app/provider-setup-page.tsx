import { useEffect, useMemo, useState } from "react";

import {
  ProviderModelList,
  ScreenContainer,
  ScreenRoot,
  ScreenStack,
  ScreenTitle,
} from "@lunaria/ui";

import { useRuntimeApi } from "./runtime-api";

type ProviderSummary = {
  id: string;
  name: string;
  authStatus: string;
  baseUrl?: string | null;
};

type ProviderModel = {
  displayName: string;
  contextWindow?: number | null;
  supportsReasoning: boolean;
  reasoningModes: string[];
};

type ProviderData = {
  id: string;
  name: string;
  color: string;
  status: "connected" | "error" | "disconnected";
  apiKey: string;
  models: Array<{
    name: string;
    ctx: string;
    reasoning: boolean;
    tier: string;
    reasoningMode: string;
  }>;
};

function providerColor(providerId: string) {
  if (providerId === "anthropic") return "tui-claude";
  if (providerId === "openai") return "tui-opencode";
  if (providerId === "google") return "tui-gemini";
  if (providerId === "ollama") return "tui-ollama";
  return "tui-codex";
}

export function RuntimeProviderSetupPage() {
  const { request } = useRuntimeApi();
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "success" | "error">>({});

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const providerSummaries = await request<ProviderSummary[]>("/api/v1/providers");
      const hydrated = await Promise.all(
        providerSummaries.map(async (provider) => {
          const models = await request<any[]>(`/api/v1/providers/${provider.id}/models`);
          return {
            id: provider.id,
            name: provider.name,
            color: providerColor(provider.id),
            status:
              provider.authStatus === "connected"
                ? "connected"
                : provider.authStatus === "expired"
                  ? "error"
                  : "disconnected",
            apiKey: provider.baseUrl ?? "",
            models: models.map((model: ProviderModel) => ({
              name: model.displayName,
              ctx: model.contextWindow ? `${model.contextWindow / 1000}k` : "—",
              reasoning: model.supportsReasoning,
              tier: model.supportsReasoning ? "Reasoning" : "Standard",
              reasoningMode: model.reasoningModes?.[0] ?? "off",
            })),
          } satisfies ProviderData;
        }),
      );

      if (!cancelled) {
        setProviders(hydrated);
        setExpanded(hydrated[0]?.name ?? null);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [request]);

  const providersByName = useMemo(
    () => new Map(providers.map((provider) => [provider.name, provider])),
    [providers],
  );

  return (
    <ScreenRoot>
      <ScreenContainer className="max-w-[800px]">
        <ScreenStack>
          <ScreenTitle>Provider Setup</ScreenTitle>

          <div className="space-y-2">
            {providers.map((provider) => (
              <ProviderModelList
                key={provider.id}
                provider={provider}
                expanded={expanded === provider.name}
                testingProvider={testingProvider}
                testResult={testResults[provider.name]}
                showKey={showKeys.has(provider.name)}
                onToggleExpand={() => setExpanded(expanded === provider.name ? null : provider.name)}
                onToggleShowKey={() =>
                  setShowKeys((previous) => {
                    const next = new Set(previous);
                    if (next.has(provider.name)) next.delete(provider.name);
                    else next.add(provider.name);
                    return next;
                  })
                }
                onApiKeyChange={(value) =>
                  setProviders((previous) =>
                    previous.map((entry) =>
                      entry.name === provider.name ? { ...entry, apiKey: value } : entry,
                    ),
                  )
                }
                onTest={async () => {
                  const active = providersByName.get(provider.name);
                  if (!active) return;
                  setTestingProvider(provider.name);
                  try {
                    await request<void>(`/api/v1/providers/${provider.id}/auth`, {
                      method: "POST",
                      body: JSON.stringify({ apiKey: active.apiKey }),
                    });
                    setTestResults((previous) => ({ ...previous, [provider.name]: "success" }));
                  } catch {
                    setTestResults((previous) => ({ ...previous, [provider.name]: "error" }));
                  } finally {
                    setTestingProvider(null);
                  }
                }}
                onReasoningModeChange={async (modelName, mode) => {
                  const model = provider.models.find((entry) => entry.name === modelName);
                  if (!model) return;
                  await request<void>(
                    `/api/v1/providers/${provider.id}/models/${encodeURIComponent(modelName)}/reasoning`,
                    {
                      method: "POST",
                      body: JSON.stringify({ mode }),
                    },
                  );
                  setProviders((previous) =>
                    previous.map((entry) =>
                      entry.name === provider.name
                        ? {
                            ...entry,
                            models: entry.models.map((candidate) =>
                              candidate.name === modelName
                                ? { ...candidate, reasoningMode: mode }
                                : candidate,
                            ),
                          }
                        : entry,
                    ),
                  );
                }}
              />
            ))}
          </div>
        </ScreenStack>
      </ScreenContainer>
    </ScreenRoot>
  );
}
