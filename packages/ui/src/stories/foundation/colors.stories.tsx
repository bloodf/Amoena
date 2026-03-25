import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  amoenaThemeTokens,
} from "@lunaria/tokens";

const meta = {
  title: "Foundation/Colors",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface SwatchProps {
  name: string;
  hsl: string;
  darkHsl?: string;
  lightHsl?: string;
}

function Swatch({ name, hsl }: SwatchProps) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-16 w-full rounded-md border border-border"
        style={{ backgroundColor: `hsl(${hsl})` }}
      />
      <span className="text-xs font-medium text-foreground truncate">
        {name}
      </span>
      <span className="text-[10px] font-mono text-muted-foreground">
        hsl({hsl})
      </span>
    </div>
  );
}

function DualSwatch({ name, darkHsl, lightHsl }: SwatchProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-16 rounded-md overflow-hidden border border-border">
        <div
          className="flex-1 flex items-end justify-center pb-1"
          style={{ backgroundColor: `hsl(${darkHsl})` }}
        >
          <span className="text-[9px] font-mono" style={{ color: `hsl(${darkHsl === "0 0% 100%" || (darkHsl && parseInt(darkHsl.split(" ").pop()!) > 60) ? "0 0% 10%" : "0 0% 90%"})` }}>
            dark
          </span>
        </div>
        <div
          className="flex-1 flex items-end justify-center pb-1"
          style={{ backgroundColor: `hsl(${lightHsl})` }}
        >
          <span className="text-[9px] font-mono" style={{ color: `hsl(${lightHsl === "0 0% 100%" || (lightHsl && parseInt(lightHsl.split(" ").pop()!) > 60) ? "0 0% 10%" : "0 0% 90%"})` }}>
            light
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-foreground truncate">
        {name}
      </span>
      <div className="flex gap-2">
        <span className="text-[10px] font-mono text-muted-foreground truncate">
          D: {darkHsl}
        </span>
      </div>
      <span className="text-[10px] font-mono text-muted-foreground truncate">
        L: {lightHsl}
      </span>
    </div>
  );
}

function ColorSection({ title, tokens }: { title: string; tokens: string[] }) {
  const dark = amoenaThemeTokens.dark;
  const light = amoenaThemeTokens.light;

  return (
    <div className="mb-10">
      <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tokens.map((token) => (
          <DualSwatch
            key={token}
            name={token}
            hsl=""
            darkHsl={dark[token] ?? ""}
            lightHsl={light[token] ?? ""}
          />
        ))}
      </div>
    </div>
  );
}

const colorGroups: { title: string; tokens: string[] }[] = [
  {
    title: "Core",
    tokens: ["background", "foreground"],
  },
  {
    title: "Primary & Ring",
    tokens: ["primary", "primary-foreground", "ring"],
  },
  {
    title: "Secondary",
    tokens: ["secondary", "secondary-foreground"],
  },
  {
    title: "Accent",
    tokens: ["accent", "accent-foreground"],
  },
  {
    title: "Muted",
    tokens: ["muted", "muted-foreground"],
  },
  {
    title: "Destructive",
    tokens: ["destructive", "destructive-foreground"],
  },
  {
    title: "Card & Popover",
    tokens: [
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
    ],
  },
  {
    title: "Border & Input",
    tokens: ["border", "input"],
  },
  {
    title: "Surfaces",
    tokens: ["surface-0", "surface-1", "surface-2", "surface-3"],
  },
  {
    title: "Text Hierarchy",
    tokens: ["text-primary", "text-secondary", "text-tertiary"],
  },
  {
    title: "Brand Colors",
    tokens: ["magenta", "purple", "deep-purple", "pink", "rose", "green"],
  },
  {
    title: "Provider Identity (TUI)",
    tokens: ["tui-claude", "tui-opencode", "tui-codex", "tui-gemini"],
  },
  {
    title: "Sidebar",
    tokens: [
      "sidebar-background",
      "sidebar-foreground",
      "sidebar-primary",
      "sidebar-primary-foreground",
      "sidebar-accent",
      "sidebar-accent-foreground",
      "sidebar-border",
      "sidebar-ring",
    ],
  },
  {
    title: "Status",
    tokens: [
      "warning",
      "warning-foreground",
      "success",
      "success-foreground",
    ],
  },
];

export const AllColors: Story = {
  render: () => (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">Color Tokens</h1>
      <p className="text-muted-foreground mb-8">
        All semantic color tokens from the Amoena design system. Each swatch
        shows dark (left) and light (right) theme values as HSL.
      </p>
      {colorGroups.map((group) => (
        <ColorSection
          key={group.title}
          title={group.title}
          tokens={group.tokens}
        />
      ))}
    </div>
  ),
};

export const LiveThemeColors: Story = {
  name: "Live Theme (CSS Variables)",
  render: () => {
    const liveTokens = [
      "background",
      "foreground",
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "destructive-foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
      "border",
      "input",
      "ring",
    ];

    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Live Theme Colors
        </h2>
        <p className="text-muted-foreground mb-6">
          These swatches use CSS custom properties and respond to the active
          Storybook theme toggle.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {liveTokens.map((token) => (
            <Swatch
              key={token}
              name={token}
              hsl={`var(--${token})`}
            />
          ))}
        </div>
      </div>
    );
  },
};
