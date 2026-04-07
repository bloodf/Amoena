import { AlertTriangle, Check, Eye, EyeOff } from "lucide-react";
import { Button } from '../../primitives/button.tsx';
import { Input } from '../../primitives/input.tsx';

export function ProviderApiKeyRow({
  providerName,
  apiKey,
  showKey,
  testingProvider,
  testResult,
  onToggleShowKey,
  onApiKeyChange,
  onTest,
}: {
  providerName: string;
  apiKey: string;
  showKey: boolean;
  testingProvider: string | null;
  testResult?: "success" | "error";
  onToggleShowKey: () => void;
  onApiKeyChange: (value: string) => void;
  onTest: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-16 text-[12px] text-muted-foreground">API Key</label>
      <div className="relative flex-1">
        <Input
          type={showKey ? "text" : "password"}
          value={apiKey}
          onChange={(event) => onApiKeyChange(event.target.value)}
          placeholder="Enter API key..."
          className="pr-8 font-mono text-[12px]"
        />
        <button onClick={onToggleShowKey} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors" aria-label={showKey ? "Hide API key" : "Show API key"}>
          {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
      <Button onClick={onTest} disabled={testingProvider === providerName || !apiKey} variant="outline" size="sm" className="min-w-[70px] text-[11px]">
        {testingProvider === providerName ? "Testing..." : null}
        {testingProvider !== providerName && testResult === "success" ? (
          <span className="flex items-center justify-center gap-1 text-green">
            <Check size={12} /> OK
          </span>
        ) : null}
        {testingProvider !== providerName && testResult === "error" ? (
          <span className="flex items-center justify-center gap-1 text-destructive">
            <AlertTriangle size={12} /> Failed
          </span>
        ) : null}
        {testingProvider !== providerName && !testResult ? "Test" : null}
      </Button>
    </div>
  );
}
