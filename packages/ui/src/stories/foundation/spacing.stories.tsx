import type { Meta, StoryObj } from "@storybook/react-vite";
import { amoenaSpacingTokens } from "@lunaria/tokens";

const meta = {
  title: "Foundation/Spacing",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const spacingEntries = Object.entries(amoenaSpacingTokens) as [
  string,
  string,
][];

export const Scale: Story = {
  name: "Spacing Scale",
  render: () => (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Spacing Tokens
      </h1>
      <p className="text-muted-foreground mb-8">
        A consistent spacing scale used across the entire design system.
        Visualised as blocks proportional to each value.
      </p>

      <div className="space-y-3">
        {spacingEntries.map(([name, value]) => (
          <div key={name} className="flex items-center gap-4">
            <div className="w-12 shrink-0 text-right">
              <span className="text-xs font-mono font-semibold text-primary">
                {name}
              </span>
            </div>
            <div className="w-16 shrink-0">
              <span className="text-xs font-mono text-muted-foreground">
                {value}
              </span>
            </div>
            <div
              className="h-6 rounded-sm bg-primary/80 transition-all"
              style={{ width: value === "0px" ? "2px" : value }}
            />
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Grid: Story = {
  name: "Spacing Grid",
  render: () => (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Spacing Grid
      </h1>
      <p className="text-muted-foreground mb-8">
        Spacing tokens rendered as proportional squares.
      </p>

      <div className="flex flex-wrap gap-6 items-end">
        {spacingEntries
          .filter(([, value]) => parseInt(value) >= 4)
          .map(([name, value]) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="rounded-md bg-primary/20 border border-primary/40"
                style={{ width: value, height: value }}
              />
              <span className="text-[10px] font-mono font-semibold text-primary">
                {name}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {value}
              </span>
            </div>
          ))}
      </div>
    </div>
  ),
};

export const Table: Story = {
  name: "Reference Table",
  render: () => (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Spacing Reference
      </h1>
      <p className="text-muted-foreground mb-8">
        Complete lookup table for every spacing token.
      </p>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted text-left">
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                Token
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                Value
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                Preview
              </th>
            </tr>
          </thead>
          <tbody>
            {spacingEntries.map(([name, value], i) => (
              <tr
                key={name}
                className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}
              >
                <td className="px-4 py-2 text-xs font-mono font-semibold text-primary">
                  {name}
                </td>
                <td className="px-4 py-2 text-xs font-mono text-foreground">
                  {value}
                </td>
                <td className="px-4 py-2">
                  <div
                    className="h-3 rounded-sm bg-primary/60"
                    style={{ width: value === "0px" ? "2px" : value }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};
