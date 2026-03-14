import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { StatusBarDropdown } from "./StatusBarDropdown";
import { RuntimeMenu } from "./RuntimeMenu";
import { RateLimitsMenu } from "./RateLimitsMenu";

/* ─── StatusBarDropdown ─── */

const statusBarDropdownMeta = {
  title: "Composites/Shell/StatusBar/StatusBarDropdown",
  component: StatusBarDropdown,
  args: {
    open: true,
    onClose: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: 300, paddingTop: 250 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusBarDropdown>;

export default statusBarDropdownMeta;
type DropdownStory = StoryObj<typeof statusBarDropdownMeta>;

export const DropdownOpen: DropdownStory = {
  args: {
    open: true,
    className: "w-64",
    children: (
      <div className="px-3 py-2 text-[12px] text-foreground">
        <p className="font-medium">Dropdown content</p>
        <p className="text-muted-foreground text-[11px] mt-1">
          This is a generic status bar dropdown panel.
        </p>
      </div>
    ),
  },
};

export const DropdownClosed: DropdownStory = {
  args: {
    open: false,
    children: <div>This should not be visible</div>,
  },
};

export const DropdownWithList: DropdownStory = {
  args: {
    open: true,
    className: "w-72",
    children: (
      <div>
        <div className="border-b border-border px-3 py-1.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Options
          </span>
        </div>
        {["Alpha", "Beta", "Gamma"].map((item) => (
          <button
            key={item}
            className="flex w-full items-center px-3 py-2 text-left text-[12px] text-foreground transition-colors hover:bg-surface-2"
          >
            {item}
          </button>
        ))}
      </div>
    ),
  },
};

/* ─── RuntimeMenu (separate file for co-location) ─── */

export const RuntimeMenuLocal = {
  render: () => (
    <div style={{ position: "relative", height: 300, paddingTop: 250 }}>
      <RuntimeMenu
        open={false}
        runtimeLocation="local"
        onToggle={fn()}
        onClose={fn()}
        onSelect={fn()}
      />
    </div>
  ),
} satisfies StoryObj;

export const RuntimeMenuOpen = {
  render: () => (
    <div style={{ position: "relative", height: 300, paddingTop: 250 }}>
      <RuntimeMenu
        open={true}
        runtimeLocation="local"
        onToggle={fn()}
        onClose={fn()}
        onSelect={fn()}
      />
    </div>
  ),
} satisfies StoryObj;

export const RuntimeMenuRelay = {
  render: () => (
    <div style={{ position: "relative", height: 300, paddingTop: 250 }}>
      <RuntimeMenu
        open={false}
        runtimeLocation="relay"
        onToggle={fn()}
        onClose={fn()}
        onSelect={fn()}
      />
    </div>
  ),
} satisfies StoryObj;

export const RuntimeMenuOffline = {
  render: () => (
    <div style={{ position: "relative", height: 300, paddingTop: 250 }}>
      <RuntimeMenu
        open={false}
        runtimeLocation="offline"
        onToggle={fn()}
        onClose={fn()}
        onSelect={fn()}
      />
    </div>
  ),
} satisfies StoryObj;

/* ─── RateLimitsMenu ─── */

export const RateLimitsMenuClosed = {
  render: () => (
    <div style={{ position: "relative", height: 400, paddingTop: 350 }}>
      <RateLimitsMenu open={false} onToggle={fn()} onClose={fn()} />
    </div>
  ),
} satisfies StoryObj;

export const RateLimitsMenuOpen = {
  render: () => (
    <div style={{ position: "relative", height: 400, paddingTop: 350 }}>
      <RateLimitsMenu open={true} onToggle={fn()} onClose={fn()} />
    </div>
  ),
} satisfies StoryObj;
