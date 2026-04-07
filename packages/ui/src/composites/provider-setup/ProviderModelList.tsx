import { Circle } from "lucide-react";
import { cn } from '../../lib/utils.ts';
import { ProviderLogo } from "../shared/ProviderLogo";
import { ProviderApiKeyRow } from "./ProviderApiKeyRow";
import { ProviderModelRow } from "./ProviderModelRow";
import type { ProviderData } from "./types";

interface ProviderModelListProps {
  provider: ProviderData;
  expanded: boolean;
  testingProvider: string | null;
  testResult?: "success" | "error";
  showKey: boolean;
  onToggleExpand: () => void;
  onToggleShowKey: () => void;
  onApiKeyChange: (value: string) => void;
  onTest: () => void;
  onReasoningModeChange: (modelName: string, mode: string) => void;
}

function mapLogoProvider(color: string) {
  if (color === "tui-claude") return "claude";
  if (color === "tui-opencode") return "opencode";
  if (color === "tui-codex") return "codex";
  if (color === "tui-gemini") return "gemini";
  return "ollama";
}

export function ProviderModelList({
  provider,
  expanded,
  testingProvider,
  testResult,
  showKey,
  onToggleExpand,
  onToggleShowKey,
  onApiKeyChange,
  onTest,
  onReasoningModeChange,
}: ProviderModelListProps) {
  return (
    <div className="overflow-hidden rounded border border-border">
      <button
        onClick={onToggleExpand}
        className="flex w-full items-center px-4 py-3 transition-colors hover:bg-surface-2"
      >
        <span className="text-muted-foreground">{expanded ? "⌄" : "›"}</span>
        <ProviderLogo provider={mapLogoProvider(provider.color)} size={18} className="ml-2" />
        <span className="ml-2.5 flex-1 text-left text-[13px] font-medium text-foreground">{provider.name}</span>
        <Circle
          size={7}
          className={cn(
            "fill-current",
            provider.status === "connected" && "text-green",
            provider.status === "error" && "text-destructive",
            provider.status === "disconnected" && "text-muted-foreground",
          )}
        />
        <span
          className={cn(
            "ml-2 text-[11px] capitalize",
            provider.status === "connected" && "text-green",
            provider.status === "error" && "text-destructive",
            provider.status === "disconnected" && "text-muted-foreground",
          )}
        >
          {provider.status}
        </span>
        <span className="ml-4 text-[11px] text-muted-foreground">{provider.models.length} models</span>
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-border px-4 py-4">
          <ProviderApiKeyRow
            providerName={provider.name}
            apiKey={provider.apiKey}
            showKey={showKey}
            testingProvider={testingProvider}
            testResult={testResult}
            onToggleShowKey={onToggleShowKey}
            onApiKeyChange={onApiKeyChange}
            onTest={onTest}
          />

          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Models</span>
            <div className="mt-2 space-y-1">
              {provider.models.map((model) => <ProviderModelRow key={model.name} model={model} onReasoningModeChange={onReasoningModeChange} />)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
