import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "./slider";

const meta = {
  title: "Primitives/Slider",
  component: Slider,
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    className: "w-64",
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomRange: Story = {
  args: { defaultValue: [25], min: 0, max: 100 },
};

export const SmallStep: Story = {
  args: { defaultValue: [0.5], min: 0, max: 1, step: 0.1 },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: [40] },
};
