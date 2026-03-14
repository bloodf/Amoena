import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import {
  Bot,
  Clock,
  FileText,
  MessageSquare,
  Settings,
  Terminal,
  Zap,
} from "lucide-react";
import { CommandPaletteFooter } from "./CommandPaletteFooter";
import { CommandPaletteFrame } from "./CommandPaletteFrame";
import { CommandPaletteSearch } from "./CommandPaletteSearch";
import { CommandPaletteResults } from "./CommandPaletteResults";
import type { CommandPaletteItem } from "./data";

/* ─── CommandPaletteFooter ─── */

const footerMeta = {
  title: "Composites/Shell/CommandPalette/Footer",
  component: CommandPaletteFooter,
} satisfies Meta<typeof CommandPaletteFooter>;

export default footerMeta;
type FooterStory = StoryObj<typeof footerMeta>;

export const Footer: FooterStory = {};

/* ─── CommandPaletteFrame ─── */

export const FrameOpen = {
  render: () => (
    <CommandPaletteFrame isClosing={false} onClose={fn()} onKeyDown={fn()}>
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        Frame content area
      </div>
    </CommandPaletteFrame>
  ),
  parameters: { layout: "fullscreen" },
} satisfies StoryObj;

export const FrameClosing = {
  render: () => (
    <CommandPaletteFrame isClosing={true} onClose={fn()} onKeyDown={fn()}>
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        Closing animation state
      </div>
    </CommandPaletteFrame>
  ),
  parameters: { layout: "fullscreen" },
} satisfies StoryObj;

export const FrameWithContent = {
  render: () => (
    <CommandPaletteFrame isClosing={false} onClose={fn()} onKeyDown={fn()}>
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="text-sm text-foreground">Search bar placeholder</span>
      </div>
      <div className="space-y-2 px-4 py-3">
        {["Item 1", "Item 2", "Item 3"].map((item) => (
          <div
            key={item}
            className="rounded-md bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            {item}
          </div>
        ))}
      </div>
      <CommandPaletteFooter />
    </CommandPaletteFrame>
  ),
  parameters: { layout: "fullscreen" },
} satisfies StoryObj;

/* ─── CommandPaletteSearch ─── */

export const SearchEmpty = {
  render: () => {
    const ref = { current: null as HTMLInputElement | null };
    return (
      <div className="w-[520px] rounded-lg border border-border bg-surface-1">
        <CommandPaletteSearch
          query=""
          onQueryChange={fn()}
          inputRef={ref}
        />
      </div>
    );
  },
} satisfies StoryObj;

export const SearchWithQuery = {
  render: () => {
    const ref = { current: null as HTMLInputElement | null };
    return (
      <div className="w-[520px] rounded-lg border border-border bg-surface-1">
        <CommandPaletteSearch
          query="auth middleware"
          onQueryChange={fn()}
          inputRef={ref}
        />
      </div>
    );
  },
} satisfies StoryObj;

/* ─── CommandPaletteResults ─── */

const sampleItems: CommandPaletteItem[] = [
  { type: "command", icon: MessageSquare, label: "New Session", shortcut: "⌘N" },
  { type: "command", icon: Terminal, label: "Toggle Terminal", shortcut: "⌘`" },
  { type: "command", icon: Zap, label: "Quick Prompt", shortcut: "⌘J" },
  { type: "navigation", icon: Settings, label: "Settings" },
  { type: "file", icon: FileText, label: "src/auth/tokens.rs", description: "JWT token handling" },
  { type: "file", icon: FileText, label: "src/main.rs", description: "Entry point" },
  { type: "agent", icon: Bot, label: "Claude 4 Sonnet", description: "JWT Auth Refactor session" },
  { type: "history", icon: Clock, label: "How to implement JWT refresh tokens?", description: "Claude 4 Sonnet · 2 min ago" },
];

function groupItems(items: CommandPaletteItem[]): Record<string, CommandPaletteItem[]> {
  return items.reduce<Record<string, CommandPaletteItem[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});
}

export const ResultsDefault = {
  render: () => (
    <div className="w-[520px] rounded-lg border border-border bg-surface-1">
      <CommandPaletteResults
        groups={groupItems(sampleItems)}
        selectedIndex={0}
        onHover={fn()}
        onSelect={fn()}
      />
    </div>
  ),
} satisfies StoryObj;

export const ResultsWithSelection = {
  render: () => (
    <div className="w-[520px] rounded-lg border border-border bg-surface-1">
      <CommandPaletteResults
        groups={groupItems(sampleItems)}
        selectedIndex={3}
        onHover={fn()}
        onSelect={fn()}
      />
    </div>
  ),
} satisfies StoryObj;

export const ResultsEmpty = {
  render: () => (
    <div className="w-[520px] rounded-lg border border-border bg-surface-1 py-8 text-center text-[13px] text-muted-foreground">
      No results found
    </div>
  ),
} satisfies StoryObj;

export const ResultsFilesOnly = {
  render: () => {
    const fileItems: CommandPaletteItem[] = [
      { type: "file", icon: FileText, label: "src/auth/tokens.rs", description: "JWT token handling" },
      { type: "file", icon: FileText, label: "src/main.rs", description: "Entry point" },
      { type: "file", icon: FileText, label: "src/api/routes.rs", description: "API route definitions" },
      { type: "file", icon: FileText, label: "src/auth/middleware.rs", description: "Auth middleware" },
      { type: "file", icon: FileText, label: "src/config.rs", description: "Configuration" },
    ];
    return (
      <div className="w-[520px] rounded-lg border border-border bg-surface-1">
        <CommandPaletteResults
          groups={groupItems(fileItems)}
          selectedIndex={1}
          onHover={fn()}
          onSelect={fn()}
        />
      </div>
    );
  },
} satisfies StoryObj;
