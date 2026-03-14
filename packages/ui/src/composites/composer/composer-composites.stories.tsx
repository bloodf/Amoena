import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { ComposerAttachmentDock } from "./ComposerAttachmentDock";
import { ComposerInputArea } from "./ComposerInputArea";
import { ComposerToolbar } from "./ComposerToolbar";
import { ComposerFilePicker, ComposerSkillsPicker, ComposerUnifiedPalette } from "./ComposerPaletteMenu";
import {
  composerReasoningLevels,
  composerContinueInOptions,
  composerPermissionOptions,
  composerBranches,
  composerProviderAgents,
  composerProviderModels,
  composerSkills,
  composerBuiltinCommands,
} from "./config";
import type { ComposerAttachment, PaletteGroup } from "./types";
import { useRef } from "react";

/* ───────────────────────────────────────────────────────────
   Meta – all composer sub-component stories live under one
   Storybook node.
   ─────────────────────────────────────────────────────────── */

const meta = {
  title: "Composites/Session/Composer",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleAttachments: ComposerAttachment[] = [
  { type: "file", name: "tokens.rs", path: "src/auth/tokens.rs" },
  { type: "file", name: "middleware.rs", path: "src/auth/middleware.rs" },
  { type: "folder", name: "src/auth", path: "src/auth", itemCount: 5 },
];

export const AttachmentDockDefault: Story = {
  name: "AttachmentDock / Default",
  render: () => <ComposerAttachmentDock attachments={sampleAttachments} onRemove={fn()} />,
};

export const AttachmentDockSingleFile: Story = {
  name: "AttachmentDock / Single File",
  render: () => (
    <ComposerAttachmentDock
      attachments={[{ type: "file", name: "main.rs", path: "src/main.rs" }]}
      onRemove={fn()}
    />
  ),
};

export const AttachmentDockFoldersOnly: Story = {
  name: "AttachmentDock / Folders Only",
  render: () => (
    <ComposerAttachmentDock
      attachments={[
        { type: "folder", name: "src/auth", path: "src/auth", itemCount: 5 },
        { type: "folder", name: "src/handlers", path: "src/handlers", itemCount: 3 },
      ]}
      onRemove={fn()}
    />
  ),
};

export const AttachmentDockEmpty: Story = {
  name: "AttachmentDock / Empty",
  render: () => <ComposerAttachmentDock attachments={[]} onRemove={fn()} />,
};

export const AttachmentDockMany: Story = {
  name: "AttachmentDock / Many Items",
  render: () => (
    <ComposerAttachmentDock
      attachments={[
        { type: "file", name: "tokens.rs", path: "src/auth/tokens.rs" },
        { type: "file", name: "middleware.rs", path: "src/auth/middleware.rs" },
        { type: "file", name: "rate_limit.rs", path: "src/auth/rate_limit.rs" },
        { type: "file", name: "api.rs", path: "src/handlers/api.rs" },
        { type: "folder", name: "src", path: "src", itemCount: 24 },
        { type: "folder", name: "tests", path: "tests", itemCount: 8 },
      ]}
      onRemove={fn()}
    />
  ),
};

/* ───────────────────────────────────────────────────────────
   InputArea (exported as named story objects)
   ─────────────────────────────────────────────────────────── */

function InputAreaWrapper(props: Partial<React.ComponentProps<typeof ComposerInputArea>>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <div style={{ width: 600 }} className="rounded border border-border bg-surface-0 p-3">
      <ComposerInputArea
        isRecording={false}
        recordingTime="00:00"
        isShellMode={false}
        message=""
        textareaRef={textareaRef}
        canvasRef={canvasRef}
        onMessageChange={fn()}
        onKeyDown={fn()}
        onPaste={fn()}
        onRecordingToggle={fn()}
        {...props}
      />
    </div>
  );
}

export const InputAreaDefault: Story = {
  render: () => <InputAreaWrapper />,
};

export const InputAreaWithText: Story = {
  render: () => <InputAreaWrapper message="Refactor the authentication module to use JWT tokens" />,
};

export const InputAreaShellMode: Story = {
  render: () => <InputAreaWrapper isShellMode message="cargo build --release" />,
};

export const InputAreaRecording: Story = {
  render: () => <InputAreaWrapper isRecording recordingTime="01:23" />,
};

/* ───────────────────────────────────────────────────────────
   Toolbar
   ─────────────────────────────────────────────────────────── */

const defaultToolbarProps: React.ComponentProps<typeof ComposerToolbar> = {
  providerName: "OpenCode",
  activeProvider: "opencode",
  activeAgentName: "Sisyphus",
  activeAgentColor: "text-tui-opencode",
  activeAgentRole: "Ultraworker",
  agents: composerProviderAgents.opencode,
  activeAgentId: "sisyphus",
  models: composerProviderModels.opencode.models,
  activeModelId: "gpt-5.4",
  activeModelLabel: "GPT-5.4",
  reasoningLevel: "medium",
  reasoningLevels: composerReasoningLevels,
  continueOptions: composerContinueInOptions,
  permissionOptions: composerPermissionOptions,
  branchOptions: composerBranches,
  session: { continueIn: "local", permission: "default", branch: "main" },
  planMode: false,
  menus: { plus: false, agent: false, model: false, reasoning: false, continueIn: false, permission: false, branch: false },
  onToggleMenu: fn(),
  onCloseMenu: fn(),
  onTogglePlanMode: fn(),
  onSelectAgent: fn(),
  onSelectModel: fn(),
  onSelectReasoning: fn(),
  onSelectContinueIn: fn(),
  onSelectPermission: fn(),
  onSelectBranch: fn(),
};

export const ToolbarDefault: Story = {
  render: () => (
    <div className="bg-surface-0 border border-border rounded" style={{ width: 700 }}>
      <ComposerToolbar {...defaultToolbarProps} />
    </div>
  ),
};

export const ToolbarPlanMode: Story = {
  render: () => (
    <div className="bg-surface-0 border border-border rounded" style={{ width: 700 }}>
      <ComposerToolbar {...defaultToolbarProps} planMode />
    </div>
  ),
};

export const ToolbarClaudeProvider: Story = {
  render: () => (
    <div className="bg-surface-0 border border-border rounded" style={{ width: 700 }}>
      <ComposerToolbar
        {...defaultToolbarProps}
        providerName="Claude Code"
        activeProvider="claude"
        activeAgentName="Claude"
        activeAgentColor="text-tui-claude"
        activeAgentRole="Default Agent"
        agents={composerProviderAgents.claude}
        activeAgentId="default"
        models={composerProviderModels.claude.models}
        activeModelId="claude-4-sonnet"
        activeModelLabel="Claude 4 Sonnet"
        session={{ continueIn: "local", permission: "full", branch: "feature/jwt-auth" }}
      />
    </div>
  ),
};

export const ToolbarHighReasoning: Story = {
  render: () => (
    <div className="bg-surface-0 border border-border rounded" style={{ width: 700 }}>
      <ComposerToolbar {...defaultToolbarProps} reasoningLevel="extra-high" />
    </div>
  ),
};

export const ToolbarNoSession: Story = {
  render: () => (
    <div className="bg-surface-0 border border-border rounded" style={{ width: 700 }}>
      <ComposerToolbar {...defaultToolbarProps} session={undefined} />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   FilePicker
   ─────────────────────────────────────────────────────────── */

const mockFiles = [
  { path: "src/auth/tokens.rs", name: "tokens.rs", type: "file" as const },
  { path: "src/auth/middleware.rs", name: "middleware.rs", type: "file" as const },
  { path: "src/auth", name: "auth", type: "folder" as const },
  { path: "src/handlers/api.rs", name: "api.rs", type: "file" as const },
];

export const FilePickerDefault: Story = {
  render: () => (
    <div style={{ width: 500, height: 300 }} className="relative">
      <div className="absolute bottom-0 left-0 right-0">
        <ComposerFilePicker files={mockFiles} selectedIndex={0} onSelect={fn()} />
      </div>
    </div>
  ),
};

export const FilePickerSecondSelected: Story = {
  render: () => (
    <div style={{ width: 500, height: 300 }} className="relative">
      <div className="absolute bottom-0 left-0 right-0">
        <ComposerFilePicker files={mockFiles} selectedIndex={1} onSelect={fn()} />
      </div>
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   SkillsPicker
   ─────────────────────────────────────────────────────────── */

export const SkillsPickerDefault: Story = {
  render: () => (
    <div style={{ width: 500, height: 500 }} className="relative">
      <div className="absolute bottom-0 left-0 right-0">
        <ComposerSkillsPicker skills={composerSkills.slice(0, 6)} selectedIndex={0} onSelect={fn()} />
      </div>
    </div>
  ),
};

export const SkillsPickerThirdSelected: Story = {
  render: () => (
    <div style={{ width: 500, height: 500 }} className="relative">
      <div className="absolute bottom-0 left-0 right-0">
        <ComposerSkillsPicker skills={composerSkills.slice(0, 6)} selectedIndex={2} onSelect={fn()} />
      </div>
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   UnifiedPalette
   ─────────────────────────────────────────────────────────── */

const mockPaletteGroups: PaletteGroup[] = [
  {
    category: "commands",
    label: "Commands",
    items: composerBuiltinCommands.slice(0, 4).map((c) => ({
      category: "commands" as const,
      id: c.name,
      name: `/${c.name}`,
      desc: c.desc,
      Icon: c.Icon,
    })),
  },
  {
    category: "skills",
    label: "Skills",
    items: composerSkills.slice(0, 3).map((s) => ({
      category: "skills" as const,
      id: s.name,
      name: `$${s.name}`,
      desc: s.desc,
      Icon: s.Icon,
    })),
  },
];

export const UnifiedPaletteDefault: Story = {
  render: () => (
    <div style={{ width: 500, height: 500 }} className="relative">
      <div className="absolute bottom-0 left-0 right-0">
        <ComposerUnifiedPalette groups={mockPaletteGroups} selectedIndex={0} onSelect={fn()} />
      </div>
    </div>
  ),
};

export const UnifiedPaletteSecondGroup: Story = {
  render: () => (
    <div style={{ width: 500, height: 500 }} className="relative">
      <div className="absolute bottom-0 left-0 right-0">
        <ComposerUnifiedPalette groups={mockPaletteGroups} selectedIndex={4} onSelect={fn()} />
      </div>
    </div>
  ),
};
