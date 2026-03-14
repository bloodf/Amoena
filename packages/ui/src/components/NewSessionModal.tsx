import { useState } from "react";
import { ContextDropzone } from "@/composites/new-session/ContextDropzone";
import { ModelPicker } from "@/composites/new-session/ModelPicker";
import { NewSessionFieldLabel } from "@/composites/new-session/NewSessionFieldLabel";
import { NewSessionModalFooter } from "@/composites/new-session/NewSessionModalFooter";
import { NewSessionModalHeader } from "@/composites/new-session/NewSessionModalHeader";
import { PermissionPresetPicker } from "@/composites/new-session/PermissionPresetPicker";
import { ProviderPicker } from "@/composites/new-session/ProviderPicker";
import { ReasoningControls } from "@/composites/new-session/ReasoningControls";
import { SessionOptionGrid } from "@/composites/new-session/SessionOptionGrid";
import { newSessionPermissionPresets, newSessionProviders, newSessionReasoningDepths, newSessionWorkTargets } from "@/composites/new-session/data";

interface NewSessionModalProps {
  open: boolean;
  onClose: () => void;
  onCreateSession: (config: SessionConfig) => void;
}

interface SessionConfig {
  name: string;
  workTarget: "local" | "worktree" | "cloud";
  model: string;
  provider: string;
  reasoningMode: string;
  reasoningDepth: string;
  permission: string;
}

export function NewSessionModal({ open, onClose, onCreateSession }: NewSessionModalProps) {
  const [name, setName] = useState("");
  const [workTarget, setWorkTarget] = useState<"local" | "worktree" | "cloud">("local");
  const [selectedProvider, setSelectedProvider] = useState("claude");
  const [selectedModel, setSelectedModel] = useState("Claude 4 Sonnet");
  const [reasoningMode, setReasoningMode] = useState("auto");
  const [reasoningDepth, setReasoningDepth] = useState("high");
  const [permission, setPermission] = useState("default");

  if (!open) return null;

  const provider = newSessionProviders.find((provider) => provider.id === selectedProvider)!;

  const handleCreate = () => {
    onCreateSession({
      name: name || "New Session",
      workTarget,
      model: selectedModel,
      provider: selectedProvider,
      reasoningMode,
      reasoningDepth,
      permission,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-[560px] max-h-[85vh] bg-surface-1 border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden">
        <NewSessionModalHeader onClose={onClose} />

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Session name */}
          <div>
            <NewSessionFieldLabel>Session Name</NewSessionFieldLabel>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Describe what you're working on..."
              className="w-full bg-surface-2 border border-border rounded px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Work target */}
          <div>
            <NewSessionFieldLabel>Workspace Target</NewSessionFieldLabel>
            <SessionOptionGrid options={newSessionWorkTargets} selected={workTarget} onSelect={setWorkTarget} />
          </div>

          {/* TUI Provider Selection */}
          <div>
            <NewSessionFieldLabel>TUI Provider</NewSessionFieldLabel>
            <ProviderPicker
              providers={newSessionProviders}
              selectedProvider={selectedProvider}
              onSelect={(providerId) => {
                setSelectedProvider(providerId);
                setSelectedModel(newSessionProviders.find((provider) => provider.id === providerId)?.models[0] || selectedModel);
              }}
            />
          </div>

          {/* Model Selection */}
          <div>
            <NewSessionFieldLabel>Model / Runtime</NewSessionFieldLabel>
            <ModelPicker models={provider.models} selectedModel={selectedModel} onSelect={setSelectedModel} />
          </div>

          {/* Reasoning */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <NewSessionFieldLabel>Reasoning Mode</NewSessionFieldLabel>
            </div>
            <div>
              <NewSessionFieldLabel>Reasoning Depth</NewSessionFieldLabel>
            </div>
            <div className="col-span-2">
              <ReasoningControls
                mode={reasoningMode}
                depth={reasoningDepth}
                depths={newSessionReasoningDepths}
                onModeChange={setReasoningMode}
                onDepthChange={setReasoningDepth}
              />
            </div>
          </div>

          {/* Permission */}
          <div>
            <NewSessionFieldLabel>Permission Preset</NewSessionFieldLabel>
            <PermissionPresetPicker presets={newSessionPermissionPresets} selected={permission} onSelect={setPermission} />
          </div>

          {/* Attachments */}
          <div>
            <NewSessionFieldLabel>Initial Context (optional)</NewSessionFieldLabel>
            <ContextDropzone />
          </div>
        </div>

        <NewSessionModalFooter onClose={onClose} onCreate={handleCreate} />
      </div>
    </div>
  );
}
