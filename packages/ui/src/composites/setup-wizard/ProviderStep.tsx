import { Check } from "lucide-react";
import { Button } from '../../primitives/button.tsx';
import { Input } from '../../primitives/input.tsx';
import { ProviderLogo } from "../shared/ProviderLogo";
import { setupWizardProviders } from "./data";

export function SetupWizardProviderStep({
  selectedProvider,
  apiKey,
  testStatus,
  onSelectProvider,
  onApiKeyChange,
  onTest,
}: {
  selectedProvider: number;
  apiKey: string;
  testStatus: "idle" | "testing" | "success" | "error";
  onSelectProvider: (index: number) => void;
  onApiKeyChange: (value: string) => void;
  onTest: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="mb-6 text-center">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Connect a Provider</h2>
        <p className="text-sm text-muted-foreground">Add at least one API key to start using AI agents.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">Provider</label>
          <div className="flex gap-2">
            {setupWizardProviders.map((provider, index) => (
              <Button
                key={provider.name}
                onClick={() => onSelectProvider(index)}
                variant="outline"
                className={selectedProvider === index ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground"}
              >
                <ProviderLogo provider={provider.providerId} size={16} />
                {provider.name}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">API Key</label>
          <Input type="password" value={apiKey} onChange={(event) => onApiKeyChange(event.target.value)} placeholder="sk-ant-..." className="font-mono text-[13px]" />
        </div>
        <Button onClick={onTest} disabled={apiKey.length < 5 || testStatus === "testing"} variant="outline" className={apiKey.length >= 5 ? "text-foreground hover:bg-surface-3" : "cursor-not-allowed text-muted-foreground"}>
          {testStatus === "idle" ? "Test Connection" : null}
          {testStatus === "testing" ? "Testing..." : null}
          {testStatus === "success" ? (
            <span className="flex items-center gap-1.5 text-success">
              <Check size={12} /> Connected
            </span>
          ) : null}
          {testStatus === "error" ? "Failed — Retry" : null}
        </Button>
      </div>
    </div>
  );
}
