import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from './toggle';
import { Bold } from 'lucide-react';

const meta = {
  title: 'Primitives/Toggle',
  component: Toggle,
  args: {
    children: 'Toggle',
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Small: Story = {
  args: { size: 'sm', children: 'Small' },
};

export const Large: Story = {
  args: { size: 'lg', children: 'Large' },
};

export const Pressed: Story = {
  args: { defaultPressed: true, children: 'On' },
};

export const WithIcon: Story = {
  args: { 'aria-label': 'Bold' },
  render: (args) => (
    <Toggle {...args}>
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Toggle variant="default" size="sm">
          sm
        </Toggle>
        <Toggle variant="default" size="default">
          md
        </Toggle>
        <Toggle variant="default" size="lg">
          lg
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="outline" size="sm">
          sm
        </Toggle>
        <Toggle variant="outline" size="default">
          md
        </Toggle>
        <Toggle variant="outline" size="lg">
          lg
        </Toggle>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};
