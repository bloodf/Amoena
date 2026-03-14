import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { Breadcrumb } from "./Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Shared/Breadcrumb",
  component: Breadcrumb,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Home: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const SingleLevel: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/agents"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const NestedPath: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/settings/general"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const DeepNested: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/settings/editor/keybindings"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
};
