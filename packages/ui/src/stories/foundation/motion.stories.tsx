import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  amoenaMotionTokens,
  amoenaTransitionTokens,
} from "@lunaria/tokens";

const meta = {
  title: "Foundation/Motion",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const { duration, easing } = amoenaMotionTokens;

function DurationDemo() {
  const [active, setActive] = useState(false);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setActive(!active)}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        {active ? "Reset" : "Animate"}
      </button>

      <div className="space-y-4">
        {(Object.entries(duration) as [string, string][]).map(
          ([name, value]) => (
            <div key={name} className="flex items-center gap-4">
              <div className="w-20 shrink-0 text-right">
                <span className="text-xs font-mono font-semibold text-primary">
                  {name}
                </span>
              </div>
              <div className="w-16 shrink-0">
                <span className="text-xs font-mono text-muted-foreground">
                  {value}
                </span>
              </div>
              <div className="flex-1 relative h-10 bg-muted/50 rounded-md overflow-hidden">
                <div
                  className="absolute top-1 bottom-1 left-1 w-10 rounded bg-primary"
                  style={{
                    transitionProperty: "transform",
                    transitionDuration: value,
                    transitionTimingFunction: "ease",
                    transform: active
                      ? "translateX(calc(100cqw - 3.5rem))"
                      : "translateX(0)",
                    containerType: "inline-size",
                  }}
                />
                <div
                  className="absolute top-1 bottom-1 left-1 w-10 rounded bg-primary"
                  style={{
                    transitionProperty: "transform",
                    transitionDuration: value,
                    transitionTimingFunction: "ease",
                    transform: active
                      ? `translateX(${280}px)`
                      : "translateX(0)",
                  }}
                />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export const Durations: Story = {
  name: "Duration Tokens",
  render: () => (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Duration Tokens
      </h1>
      <p className="text-muted-foreground mb-8">
        Click &ldquo;Animate&rdquo; to compare how each duration feels. The
        blocks translate across the track at their respective speed.
      </p>
      <DurationDemo />
    </div>
  ),
};

function EasingDemo() {
  const [active, setActive] = useState(false);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setActive(!active)}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        {active ? "Reset" : "Animate"}
      </button>

      <div className="space-y-4">
        {(Object.entries(easing) as [string, string][]).map(
          ([name, value]) => (
            <div key={name} className="flex items-center gap-4">
              <div className="w-24 shrink-0 text-right">
                <span className="text-xs font-mono font-semibold text-primary">
                  {name}
                </span>
              </div>
              <div className="w-24 shrink-0">
                <span className="text-xs font-mono text-muted-foreground">
                  {value}
                </span>
              </div>
              <div className="flex-1 relative h-10 bg-muted/50 rounded-md overflow-hidden">
                <div
                  className="absolute top-1 bottom-1 left-1 w-10 rounded bg-accent-foreground"
                  style={{
                    transitionProperty: "transform",
                    transitionDuration: "600ms",
                    transitionTimingFunction: value,
                    transform: active
                      ? `translateX(${280}px)`
                      : "translateX(0)",
                  }}
                />
              </div>
            </div>
          ),
        )}
        {/* additional common easings for reference */}
        {(
          [
            ["linear", "linear"],
            ["ease-in", "ease-in"],
            ["ease-out", "ease-out"],
          ] as const
        ).map(([name, value]) => (
          <div key={name} className="flex items-center gap-4">
            <div className="w-24 shrink-0 text-right">
              <span className="text-xs font-mono text-muted-foreground italic">
                {name}
              </span>
            </div>
            <div className="w-24 shrink-0">
              <span className="text-xs font-mono text-muted-foreground">
                {value}
              </span>
            </div>
            <div className="flex-1 relative h-10 bg-muted/30 rounded-md overflow-hidden">
              <div
                className="absolute top-1 bottom-1 left-1 w-10 rounded bg-muted-foreground/60"
                style={{
                  transitionProperty: "transform",
                  transitionDuration: "600ms",
                  transitionTimingFunction: value,
                  transform: active
                    ? `translateX(${280}px)`
                    : "translateX(0)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Easings: Story = {
  name: "Easing Curves",
  render: () => (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Easing Functions
      </h1>
      <p className="text-muted-foreground mb-8">
        Design system easings shown with a slow 600ms duration for clarity.
        Token values are highlighted; common CSS comparison curves shown in grey.
      </p>
      <EasingDemo />
    </div>
  ),
};

export const TransitionPresets: Story = {
  name: "Transition Presets",
  render: () => {
    const presets = Object.entries(amoenaTransitionTokens) as [
      string,
      string,
    ][];

    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Transition Presets
        </h1>
        <p className="text-muted-foreground mb-8">
          Pre-configured CSS transition shorthand values for common use-cases.
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
              </tr>
            </thead>
            <tbody>
              {presets.map(([name, value], i) => (
                <tr
                  key={name}
                  className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}
                >
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-primary">
                    {name}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-foreground">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Keyframe Animations
          </h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {(
                  Object.entries(amoenaMotionTokens.keyframes) as [
                    string,
                    string,
                  ][]
                ).map(([name, value], i) => (
                  <tr
                    key={name}
                    className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}
                  >
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-primary">
                      {name}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-foreground">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
};
