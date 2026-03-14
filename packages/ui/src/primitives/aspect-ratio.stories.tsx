import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "./aspect-ratio";

const meta = {
  title: "Primitives/AspectRatio",
  component: AspectRatio,
  args: {
    ratio: 16 / 9,
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[450px]">
      <AspectRatio {...args} className="rounded-md bg-muted">
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          16:9
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  args: { ratio: 1 },
  render: (args) => (
    <div className="w-[300px]">
      <AspectRatio {...args} className="rounded-md bg-muted">
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          1:1
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  args: { ratio: 3 / 4 },
  render: (args) => (
    <div className="w-[250px]">
      <AspectRatio {...args} className="rounded-md bg-muted">
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          3:4
        </div>
      </AspectRatio>
    </div>
  ),
};

export const AllRatios: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      {[
        { ratio: 1, label: "1:1" },
        { ratio: 4 / 3, label: "4:3" },
        { ratio: 16 / 9, label: "16:9" },
        { ratio: 21 / 9, label: "21:9" },
        { ratio: 3 / 4, label: "3:4" },
      ].map(({ ratio, label }) => (
        <div key={label} className="w-[180px]">
          <AspectRatio ratio={ratio} className="rounded-md bg-muted">
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {label}
            </div>
          </AspectRatio>
          <p className="mt-1 text-center text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  ),
};
