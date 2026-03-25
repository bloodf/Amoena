import type { Meta, StoryObj } from "@storybook/react-vite";
import { amoenaTypographyTokens } from "@lunaria/tokens";

const meta = {
  title: "Foundation/Typography",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const { fontFamily, fontWeight, fontSize } = amoenaTypographyTokens;

const pangram = "The quick brown fox jumps over the lazy dog";

export const FontSizes: Story = {
  name: "Font Sizes",
  render: () => (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">Font Sizes</h1>
      <p className="text-muted-foreground mb-8">
        Type scale from xs to 4xl with corresponding line-height and
        letter-spacing values.
      </p>

      <div className="space-y-6">
        {(
          Object.entries(fontSize) as [
            string,
            { size: string; lineHeight: string; letterSpacing: string },
          ][]
        ).map(([name, entry]) => (
          <div
            key={name}
            className="flex items-baseline gap-6 border-b border-border pb-4"
          >
            <div className="w-16 shrink-0">
              <span className="text-xs font-mono font-semibold text-primary">
                {name}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-foreground truncate"
                style={{
                  fontSize: entry.size,
                  lineHeight: entry.lineHeight,
                  letterSpacing: entry.letterSpacing,
                }}
              >
                {pangram}
              </p>
            </div>
            <div className="hidden md:flex shrink-0 gap-4 text-[11px] font-mono text-muted-foreground">
              <span>{entry.size}</span>
              <span className="text-border">/</span>
              <span>lh: {entry.lineHeight}</span>
              <span className="text-border">/</span>
              <span>ls: {entry.letterSpacing}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const FontFamilies: Story = {
  name: "Font Families",
  render: () => (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Font Families
      </h1>
      <p className="text-muted-foreground mb-8">
        The design system uses two typefaces for distinct purposes.
      </p>

      <div className="space-y-10">
        {(Object.entries(fontFamily) as [string, string][]).map(
          ([name, value]) => (
            <div key={name}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
                  {name}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  {value}
                </span>
              </div>
              <div className="space-y-2" style={{ fontFamily: value }}>
                <p className="text-4xl text-foreground">{pangram}</p>
                <p className="text-lg text-foreground">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                </p>
                <p className="text-lg text-foreground">
                  abcdefghijklmnopqrstuvwxyz
                </p>
                <p className="text-lg text-foreground">0123456789 !@#$%^&*()</p>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  name: "Font Weights",
  render: () => (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">Font Weights</h1>
      <p className="text-muted-foreground mb-8">
        Available weight variants for the Inter type family.
      </p>

      <div className="space-y-4">
        {(Object.entries(fontWeight) as [string, string][]).map(
          ([name, value]) => (
            <div
              key={name}
              className="flex items-baseline gap-6 border-b border-border pb-4"
            >
              <div className="w-28 shrink-0 flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-primary">
                  {name}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  ({value})
                </span>
              </div>
              <p
                className="text-2xl text-foreground"
                style={{ fontWeight: value }}
              >
                {pangram}
              </p>
            </div>
          ),
        )}
      </div>
    </div>
  ),
};

export const TypeScale: Story = {
  name: "Type Scale Table",
  render: () => (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Type Scale Reference
      </h1>
      <p className="text-muted-foreground mb-8">
        Complete reference table with all typography metrics.
      </p>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted text-left">
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                Token
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                Size
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                Line Height
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                Letter Spacing
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                Preview
              </th>
            </tr>
          </thead>
          <tbody>
            {(
              Object.entries(fontSize) as [
                string,
                { size: string; lineHeight: string; letterSpacing: string },
              ][]
            ).map(([name, entry], i) => (
              <tr
                key={name}
                className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}
              >
                <td className="px-4 py-3 text-xs font-mono font-semibold text-primary">
                  {name}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-foreground">
                  {entry.size}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-foreground">
                  {entry.lineHeight}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-foreground">
                  {entry.letterSpacing}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-foreground"
                    style={{
                      fontSize: entry.size,
                      lineHeight: entry.lineHeight,
                      letterSpacing: entry.letterSpacing,
                    }}
                  >
                    Aa
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};
