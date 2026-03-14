import { useState } from "react";
import { toast } from "sonner";
import { ScreenContainer, ScreenRoot, ScreenStack, ScreenTitle } from "@/components/screen";
import { initialProviders } from "@/composites/provider-setup/config";
import { ProviderModelList } from "@/composites/provider-setup/ProviderModelList";
import type { ProviderData } from "@/composites/provider-setup/types";

export function ProviderSetupScreen() {
  const [providers, setProviders] = useState(initialProviders);
  const [expanded, setExpanded] = useState<string | null>("Anthropic");
  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "success" | "error">>({});

  const toggleShowKey = (name: string) => {
    setShowKeys(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleTest = (name: string) => {
    setTestingProvider(name);
    setTestResults(prev => { const n = { ...prev }; delete n[name]; return n; });
    setTimeout(() => {
      const provider = providers.find(p => p.name === name);
      const success = provider?.apiKey && provider.apiKey.length > 10 && !provider.apiKey.includes("expired");
      setTestingProvider(null);
      setTestResults(prev => ({ ...prev, [name]: success ? "success" : "error" }));
      if (success) {
        setProviders(prev => prev.map(p => p.name === name ? { ...p, status: "connected" } : p));
        toast.success(`${name} connection verified`);
      } else {
        setProviders(prev => prev.map(p => p.name === name ? { ...p, status: "error" } : p));
        toast.error(`${name} connection failed`);
      }
    }, 1200);
  };

  const updateApiKey = (name: string, key: string) => {
    setProviders(prev => prev.map(p => p.name === name ? { ...p, apiKey: key } : p));
    setTestResults(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const updateReasoningMode = (providerName: string, modelName: string, mode: string) => {
    setProviders(prev => prev.map(p =>
      p.name === providerName ? {
        ...p, models: p.models.map(m => m.name === modelName ? { ...m, reasoningMode: mode } : m)
      } : p
    ));
  };

  return (
    <ScreenRoot>
      <ScreenContainer className="max-w-[800px]">
        <ScreenStack>
          <ScreenTitle>Provider Setup</ScreenTitle>

          <div className="space-y-2">
            {providers.map((p) => (
              <ProviderModelList
                key={p.name}
                provider={p}
                expanded={expanded === p.name}
                testingProvider={testingProvider}
                testResult={testResults[p.name]}
                showKey={showKeys.has(p.name)}
                onToggleExpand={() => setExpanded(expanded === p.name ? null : p.name)}
                onToggleShowKey={() => toggleShowKey(p.name)}
                onApiKeyChange={(value) => updateApiKey(p.name, value)}
                onTest={() => handleTest(p.name)}
                onReasoningModeChange={(modelName, mode) => updateReasoningMode(p.name, modelName, mode)}
              />
            ))}
          </div>
        </ScreenStack>
      </ScreenContainer>
    </ScreenRoot>
  );
}
