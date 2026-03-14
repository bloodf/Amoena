import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./textarea";

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  args: {
    placeholder: "Type your message here…",
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue: "Luna is an AI memory engine that remembers everything you tell it.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "This textarea is disabled",
  },
};

export const WithRows: Story = {
  args: {
    rows: 8,
    placeholder: "Write a longer message…",
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[350px]">
      <Textarea placeholder="Default" />
      <Textarea placeholder="With value" defaultValue="Hello, Lunaria" />
      <Textarea placeholder="Disabled" disabled />
      <Textarea placeholder="Read-only" readOnly defaultValue="Read-only content" />
    </div>
  ),
};
