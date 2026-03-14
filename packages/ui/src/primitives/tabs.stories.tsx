import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "Primitives/Tabs",
  render: () => (
    <Tabs defaultValue="review" className="w-[420px]">
      <TabsList>
        <TabsTrigger value="review">Review</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="agents">Agents</TabsTrigger>
      </TabsList>
      <TabsContent value="review">Review tab content</TabsContent>
      <TabsContent value="files">Files tab content</TabsContent>
      <TabsContent value="agents">Agents tab content</TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
