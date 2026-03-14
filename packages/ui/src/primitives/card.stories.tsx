import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

const meta = {
  title: "Primitives/Card",
  component: Card,
  render: () => (
    <Card className="w-[320px]">
      <CardHeader>
        <CardTitle>Workspace Review</CardTitle>
      </CardHeader>
      <CardContent>3 files changed, apply-back pending.</CardContent>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
