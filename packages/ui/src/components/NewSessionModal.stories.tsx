import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { NewSessionModal } from "./NewSessionModal";

const meta: Meta<typeof NewSessionModal> = {
  title: "Components/Screens/NewSessionModal",
  component: NewSessionModal,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof NewSessionModal>;

export const Open: Story = {
  args: {
    open: true,
    onClose: fn(),
    onCreateSession: fn(),
  },
};

export const Closed: Story = {
  args: {
    open: false,
    onClose: fn(),
    onCreateSession: fn(),
  },
};
