import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Monitor as MonitorIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComposerAttachmentDock } from "@/composites/composer/ComposerAttachmentDock";
import { ComposerDropdown, ComposerToolbar } from "@/composites/composer/ComposerToolbar";
import { ComposerInputArea } from "@/composites/composer/ComposerInputArea";
import type { ComposerAttachment, PaletteGroup, PaletteItem } from "@/composites/composer/types";
import { ComposerFilePicker, ComposerSkillsPicker, ComposerUnifiedPalette } from "@/composites/composer/ComposerPaletteMenu";
import {
  composerBranches,
  composerContinueInOptions,
  composerPermissionOptions,
  composerProviderAgents,
  composerProviderModels,
  composerReasoningLevels,
  composerSkills,
  type ComposerProvider,
} from "@/composites/composer/config";
import { getNextComposerAgentId } from "@/composites/composer/palette";
import { useComposerInteractions } from "@/composites/composer/useComposerInteractions";
import { useComposerRecording } from "@/composites/composer/useComposerRecording";
import { useComposerToolbarMenus } from "@/composites/composer/useComposerToolbarMenus";

// --- Main Component ---

interface SessionComposerProps {
  provider?: ComposerProvider;
  session?: {
    provider: string;
    permission: string;
    continueIn: "local" | "worktree" | "cloud";
    branch: string;
  };
  onUpdateSession?: (updates: any) => void;
  externalMessage?: string;
  onExternalMessageConsumed?: () => void;
  isGenerating?: boolean;
  onInterrupt?: () => void;
  onSubmit?: (payload: {
    message: string;
    attachments: ComposerAttachment[];
    reasoningLevel: string;
    modelId: string;
    agentId: string;
    planMode: boolean;
    provider: ComposerProvider;
    permission?: string;
    continueIn?: "local" | "worktree" | "cloud";
    branch?: string;
  }) => void | Promise<void>;
}

export function SessionComposer({
  provider: externalProvider,
  session,
  onUpdateSession,
  externalMessage,
  onExternalMessageConsumed,
  isGenerating,
  onInterrupt,
  onSubmit,
}: SessionComposerProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { canvasRef, isRecording, recordingLabel, startRecording, stopRecording } = useComposerRecording();

  const activeProvider = (externalProvider || "opencode") as ComposerProvider;
  const [activeModel, setActiveModel] = useState("gpt-5.4");
  const [reasoningLevel, setReasoningLevel] = useState("high");
  const [activeAgent, setActiveAgent] = useState("");
  const [planMode, setPlanMode] = useState(false);

  const models = composerProviderModels[activeProvider].models;
  const agents = composerProviderAgents[activeProvider];
  const canSubmit = Boolean(message.trim() || attachments.length > 0);

  // Handle external message injection (from suggestion cards)
  useEffect(() => {
    if (externalMessage) {
      setMessage(externalMessage);
      onExternalMessageConsumed?.();
      textareaRef.current?.focus();
    }
  }, [externalMessage, onExternalMessageConsumed]);

  useEffect(() => {
    const provAgents = composerProviderAgents[activeProvider];
    setActiveAgent(provAgents[0]?.id || "");
    const provModels = composerProviderModels[activeProvider].models;
    setActiveModel(provModels[0]?.id || "");
  }, [activeProvider]);

  const activeModelLabel = models.find(m => m.id === activeModel)?.label || models[0]?.label || activeModel;
  const activeAgentData = agents.find(a => a.id === activeAgent) || agents[0];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [message]);

  const {
    isDragOver,
    showFilePicker,
    showUnifiedPalette,
    showSkills,
    selectedIndex,
    filteredFiles,
    filteredSkills,
    flatPaletteItems,
    paletteGroups,
    closeAutocomplete,
    handleInput,
    insertFileRef,
    handlePaletteSelect,
    insertSkill,
    removeAttachment,
    handleKeyDown,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openUnifiedPalette,
  } = useComposerInteractions({
    message,
    setMessage,
    attachments,
    setAttachments,
    textareaRef,
    agents,
    onCycleAgent: () => setActiveAgent((previous) => getNextComposerAgentId(previous, composerProviderAgents[activeProvider])),
    onSelectAgent: setActiveAgent,
    onAutocompleteOpen: () => closeToolbarMenus(),
  });

  const { menus, closeToolbarMenus, closeAllMenus, toggleMenu, closeMenu, setShowPlusMenu } = useComposerToolbarMenus(closeAutocomplete);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !onSubmit) {
      return;
    }

    const submission = onSubmit({
      message: message.trim(),
      attachments,
      reasoningLevel,
      modelId: activeModel,
      agentId: activeAgent,
      planMode,
      provider: activeProvider,
      permission: session?.permission,
      continueIn: session?.continueIn,
      branch: session?.branch,
    });

    setMessage("");
    setAttachments([]);
    closeAllMenus();
    closeAutocomplete();
    await submission;
  }, [
    activeProvider,
    activeAgent,
    activeModel,
    attachments,
    canSubmit,
    closeAllMenus,
    closeAutocomplete,
    message,
    onSubmit,
    planMode,
    reasoningLevel,
    session?.branch,
    session?.continueIn,
    session?.permission,
  ]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "t") {
        e.preventDefault();
        setActiveAgent((prev) => getNextComposerAgentId(prev, composerProviderAgents[activeProvider]));
      }
      if (e.ctrlKey && e.key === "p") {
        e.preventDefault();
        openUnifiedPalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeProvider, openUnifiedPalette]);

  const isShellMode = message.startsWith("!");
  const ContinueIcon = composerContinueInOptions.find(o => o.id === session?.continueIn)?.icon || MonitorIcon;

  return (
    <div
      className={cn("relative border-t border-border bg-surface-0", isDragOver && "ring-2 ring-primary/50")}
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary rounded z-10 flex items-center justify-center pointer-events-none">
          <span className="text-[13px] font-medium text-primary">Drop to attach</span>
        </div>
      )}

      <ComposerAttachmentDock attachments={attachments} onRemove={removeAttachment} />

      {/* Textarea + send/mic on the right */}
      <div className="relative px-3 pt-2 pb-1">
        {/* File Picker */}
        {showFilePicker && filteredFiles.length > 0 ? (
          <ComposerFilePicker files={filteredFiles} selectedIndex={selectedIndex} onSelect={insertFileRef} />
        ) : null}

        {/* Unified Palette */}
        {showUnifiedPalette && flatPaletteItems.length > 0 ? (
          <ComposerUnifiedPalette groups={paletteGroups} selectedIndex={selectedIndex} onSelect={handlePaletteSelect} />
        ) : null}

        {/* Skills picker */}
        {showSkills && filteredSkills.length > 0 ? (
          <ComposerSkillsPicker skills={filteredSkills} selectedIndex={selectedIndex} onSelect={(skill) => insertSkill(skill as (typeof composerSkills)[0])} />
        ) : null}

        <ComposerInputArea
          isRecording={isRecording}
          recordingTime={recordingLabel}
          isShellMode={isShellMode}
          message={message}
          canSubmit={canSubmit}
          textareaRef={textareaRef}
          canvasRef={canvasRef}
          onMessageChange={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onRecordingToggle={isRecording ? stopRecording : startRecording}
          onSubmit={() => {
            void handleSubmit();
          }}
        />
        {isGenerating && onInterrupt && (
          <button
            onClick={onInterrupt}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            title="Stop generation"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="2" width="10" height="10" rx="1" />
            </svg>
          </button>
        )}
      </div>

      <ComposerToolbar
        providerName={composerProviderModels[activeProvider].name}
        activeProvider={activeProvider}
        activeAgentName={activeAgentData.name}
        activeAgentColor={activeAgentData.color}
        activeAgentRole={activeAgentData.role}
        agents={agents}
        activeAgentId={activeAgent}
        models={models}
        activeModelId={activeModel}
        activeModelLabel={activeModelLabel}
        reasoningLevel={reasoningLevel}
        reasoningLevels={composerReasoningLevels}
        continueOptions={composerContinueInOptions}
        permissionOptions={composerPermissionOptions}
        branchOptions={composerBranches}
        session={session}
        planMode={planMode}
        menus={menus}
        onToggleMenu={toggleMenu}
        onCloseMenu={closeMenu}
        onTogglePlanMode={() => {
          setPlanMode(!planMode);
          setShowPlusMenu(false);
        }}
        onSelectAgent={(id) => {
          setActiveAgent(id);
          closeMenu("agent");
        }}
        onSelectModel={(id) => {
          setActiveModel(id);
          closeMenu("model");
        }}
        onSelectReasoning={(id) => {
          setReasoningLevel(id);
          closeMenu("reasoning");
        }}
        onSelectContinueIn={(id) => {
          onUpdateSession?.({ continueIn: id });
          closeMenu("continueIn");
        }}
        onSelectPermission={(id) => {
          onUpdateSession?.({ permission: id });
          closeMenu("permission");
        }}
        onSelectBranch={(branch) => {
          onUpdateSession?.({ branch });
          closeMenu("branch");
        }}
      />
    </div>
  );
}
