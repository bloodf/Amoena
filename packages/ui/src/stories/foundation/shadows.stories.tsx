import type { Meta, StoryObj } from "@storybook/react-vite";
import { lunariaShadowTokens } from "@lunaria/tokens";

const meta = {
  title: "Foundation/Shadows",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type ShadowLevel = keyof typeof lunariaShadowTokens.dark;

const shadowNames: ShadowLevel[] = [
  "xs",
  "sm",
  "DEFAULT",
  "md",
  "lg",
  "xl",
  "2xl",
  "inner",
  "none",
];

function ShadowCard({
  name,
  shadow,
}: {
  name: string;
  shadow: string;
}) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-6 flex flex-col items-center justify-center gap-3 min-h-[120px]"
      style={{ boxShadow: shadow }}
    >
      <span className="text-sm font-semibold text-foreground">{name}</span>
      <span className="text-[10px] font-mono text-muted-foreground text-center leading-relaxed max-w-[200px] break-all">
        {shadow}
      </span>
    </div>
  );
}

export const DarkShadows: Story = {
  name: "Dark Theme Shadows",
  render: () => (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Shadow Tokens — Dark
      </h1>
      <p className="text-muted-foreground mb-8">
        Shadow elevation levels for dark backgrounds. Higher values have
        stronger opacity to remain visible.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {shadowNames.map((name) => (
          <ShadowCard
            key={name}
            name={name}
            shadow={lunariaShadowTokens.dark[name]}
          />
        ))}
      </div>
    </div>
  ),
};

export const LightShadows: Story = {
  name: "Light Theme Shadows",
  render: () => (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Shadow Tokens — Light
      </h1>
      <p className="text-muted-foreground mb-8">
        Shadow elevation levels for light backgrounds. Subtler opacity values
        for a softer appearance.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {shadowNames.map((name) => (
          <ShadowCard
            key={name}
            name={name}
            shadow={lunariaShadowTokens.light[name]}
          />
        ))}
      </div>
    </div>
  ),
};

export const Comparison: Story = {
  name: "Side-by-Side Comparison",
  render: () => (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Shadow Comparison
      </h1>
      <p className="text-muted-foreground mb-8">
        Dark and light shadow variants rendered side by side for comparison.
      </p>

      <div className="space-y-6">
        {shadowNames.map((name) => (
          <div
            key={name}
            className="flex items-center gap-6"
          >
            <div className="w-20 shrink-0 text-right">
              <span className="text-xs font-mono font-semibold text-primary">
                {name}
              </span>
            </div>
            <div className="flex-1 flex gap-4">
              <div
                className="flex-1 rounded-lg p-4 flex items-center justify-center text-xs font-mono text-muted-foreground"
                style={{
                  backgroundColor: "hsl(270 7% 7%)",
                  boxShadow: lunariaShadowTokens.dark[name],
                  color: "hsl(0 0% 88%)",
                }}
              >
                dark
              </div>
              <div
                className="flex-1 rounded-lg p-4 flex items-center justify-center text-xs font-mono text-muted-foreground"
                style={{
                  backgroundColor: "hsl(0 0% 98%)",
                  boxShadow: lunariaShadowTokens.light[name],
                  color: "hsl(240 10% 10%)",
                }}
              >
                light
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
