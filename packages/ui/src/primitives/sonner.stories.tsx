import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster as SonnerToaster, toast } from "sonner";
import { Button } from "./button";

const meta = {
  title: "Primitives/Sonner",
  component: SonnerToaster,
  decorators: [
    (Story) => (
      <div className="min-h-[400px]">
        <Story />
        <SonnerToaster richColors position="bottom-right" />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof SonnerToaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast("Event has been created")}>
      Show Toast
    </Button>
  ),
};

export const Success: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.success("Memory saved successfully")}>
      Success Toast
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.error("Failed to save memory")}>
      Error Toast
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.info("New update available")}>
      Info Toast
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.warning("Storage almost full")}>
      Warning Toast
    </Button>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast("Event created", {
          description: "Friday, February 10, 2025 at 5:57 PM",
        })
      }
    >
      With Description
    </Button>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast("Memory deleted", {
          action: { label: "Undo", onClick: () => toast.info("Undone!") },
        })
      }
    >
      With Action
    </Button>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast("Default toast")}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success("Success toast")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error("Error toast")}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.info("Info toast")}>
        Info
      </Button>
      <Button variant="outline" onClick={() => toast.warning("Warning toast")}>
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          const promise = () => new Promise<{ name: string }>((resolve) => setTimeout(() => resolve({ name: "Amoena" }), 2000));
          toast.promise(promise(), {
            loading: "Loading…",
            success: (data) => `${data.name} is ready`,
            error: "Something went wrong",
          });
        }}
      >
        Promise
      </Button>
    </div>
  ),
};
