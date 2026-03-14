import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { FileTreeItem } from "./FileTreeItem";
import type { FileNode } from "./types";

/* ───────────────────────────────────────────────────────────
   Meta – all file-browser sub-component stories
   ─────────────────────────────────────────────────────────── */

const meta = {
  title: "Composites/Session/FileBrowser",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const singleFile: FileNode = {
  name: "tokens.rs",
  type: "file",
  content: "pub struct Token {}",
};

const folderWithChildren: FileNode = {
  name: "auth",
  type: "folder",
  children: [
    { name: "tokens.rs", type: "file", content: "pub struct Token {}" },
    { name: "middleware.rs", type: "file", content: "pub fn auth_middleware() {}" },
    { name: "rate_limit.rs", type: "file", content: "pub fn rate_limit() {}" },
  ],
};

const deepTree: FileNode = {
  name: "src",
  type: "folder",
  children: [
    {
      name: "auth",
      type: "folder",
      children: [
        { name: "tokens.rs", type: "file", content: "" },
        { name: "middleware.rs", type: "file", content: "" },
        {
          name: "strategies",
          type: "folder",
          children: [
            { name: "jwt.rs", type: "file", content: "" },
            { name: "session.rs", type: "file", content: "" },
            { name: "oauth.rs", type: "file", content: "" },
          ],
        },
      ],
    },
    {
      name: "handlers",
      type: "folder",
      children: [
        { name: "api.rs", type: "file", content: "" },
        { name: "websocket.rs", type: "file", content: "" },
      ],
    },
    { name: "main.rs", type: "file", content: "" },
    { name: "config.ts", type: "file", content: "" },
    { name: "Cargo.toml", type: "file", content: "" },
  ],
};

export const SingleFileItem: Story = {
  name: "FileTreeItem / Single File",
  render: () => (
    <div style={{ width: 300 }}>
      <FileTreeItem item={singleFile} onOpenFile={fn()} />
    </div>
  ),
};

export const FolderWithChildren: Story = {
  name: "FileTreeItem / Folder",
  render: () => (
    <div style={{ width: 300 }}>
      <FileTreeItem item={folderWithChildren} onOpenFile={fn()} />
    </div>
  ),
};

export const DeepTree: Story = {
  name: "FileTreeItem / Deep Tree",
  render: () => (
    <div style={{ width: 300 }}>
      <FileTreeItem item={deepTree} onOpenFile={fn()} />
    </div>
  ),
};

export const NestedDepth: Story = {
  name: "FileTreeItem / Nested Depth",
  render: () => (
    <div style={{ width: 300 }}>
      <FileTreeItem item={folderWithChildren} depth={2} onOpenFile={fn()} />
    </div>
  ),
};

export const MixedFileTypes: Story = {
  name: "FileTreeItem / Mixed Types",
  render: () => (
    <div style={{ width: 300 }}>
      <FileTreeItem
        item={{
          name: "project",
          type: "folder",
          children: [
            { name: "README.md", type: "file", content: "" },
            { name: "package.json", type: "file", content: "" },
            { name: ".env", type: "file", content: "" },
            { name: "Dockerfile", type: "file", content: "" },
            { name: "schema.sql", type: "file", content: "" },
            { name: "styles.css", type: "file", content: "" },
            { name: "index.tsx", type: "file", content: "" },
            { name: "archive.zip", type: "file", content: "" },
            { name: "logo.png", type: "file", content: "" },
          ],
        }}
        onOpenFile={fn()}
      />
    </div>
  ),
};

export const EmptyFolder: Story = {
  name: "FileTreeItem / Empty Folder",
  render: () => (
    <div style={{ width: 300 }}>
      <FileTreeItem item={{ name: "empty-dir", type: "folder", children: [] }} onOpenFile={fn()} />
    </div>
  ),
};
