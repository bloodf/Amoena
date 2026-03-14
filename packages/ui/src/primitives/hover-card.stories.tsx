import type { Meta, StoryObj } from "@storybook/react-vite";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

const meta = {
  title: "Primitives/HoverCard",
  component: HoverCard,
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a href="#" className="underline">
          Hover me
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <p>Card content visible on hover.</p>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const Open: Story = {
  render: () => (
    <HoverCard defaultOpen>
      <HoverCardTrigger asChild>
        <a href="#" className="underline">
          Hover me
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <p>This hover card is open by default.</p>
      </HoverCardContent>
    </HoverCard>
  ),
};
