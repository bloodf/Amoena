import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileEditorHeader } from "@/composites/file-editor/FileEditorHeader";
import { HighlightedCode } from "@/composites/file-editor/HighlightedCode";

const meta = {
  title: "Components/File Editor",
} satisfies Meta;

export default meta;

const sampleCode = `export function issueToken(userId: string) {\n  return {\n    sub: userId,\n    exp: Date.now() + 900_000,\n  };\n}`;

export const Header: StoryObj = {
  render: () => <FileEditorHeader fileName="tokens.ts" filePath="src/auth/tokens.ts" editMode={false} hasUnsaved={false} onEdit={() => {}} onSave={() => {}} onCancel={() => {}} />,
};

export const CodeBlock: StoryObj = {
  render: () => (
    <div className="h-[320px] overflow-auto bg-background">
      <HighlightedCode content={sampleCode} fileName="tokens.ts" />
    </div>
  ),
};
