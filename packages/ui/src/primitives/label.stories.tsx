import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";

const meta = {
  title: "Primitives/Label",
  component: Label,
  args: {
    children: "Email address",
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHtmlFor: Story = {
  args: { htmlFor: "email", children: "Your email" },
};

export const PeerDisabledStyle: Story = {
  name: "Peer-disabled style",
  decorators: [
    (Story) => (
      <div className="flex items-center gap-2">
        <input type="text" id="demo" disabled className="peer" />
        <Story />
      </div>
    ),
  ],
  args: { htmlFor: "demo", children: "Disabled field label" },
};
