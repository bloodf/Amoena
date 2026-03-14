import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "./chart";

const data = [
  { provider: "Anthropic", used: 142 },
  { provider: "OpenAI", used: 38 },
  { provider: "Google", used: 7 },
];

const config: ChartConfig = {
  used: { label: "Used", color: "hsl(300 100% 36%)" },
};

const meta = {
  title: "Primitives/Chart",
  render: () => (
    <ChartContainer config={config} className="h-[240px] w-[420px]">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="provider" />
        <Bar dataKey="used" fill="var(--color-used)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RateLimitUsage: Story = {};
