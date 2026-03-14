import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileEditorTab } from "./FileEditorTab";

const meta = {
  title: "Components/Session/FileEditorTab",
  component: FileEditorTab,
  parameters: { layout: "fullscreen" },
  args: {
    fileName: "tokens.rs",
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileEditorTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TypeScriptFile: Story = {
  args: {
    fileName: "config.ts",
  },
};

export const MiddlewareFile: Story = {
  args: {
    fileName: "middleware.rs",
  },
};

export const JsonFile: Story = {
  args: {
    fileName: "Cargo.toml",
  },
};

export const NonExistentFile: Story = {
  args: {
    fileName: "not-found.txt",
  },
};
