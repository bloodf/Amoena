import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { FileEditorHeader } from "./FileEditorHeader";
import { HighlightedCode } from "./HighlightedCode";

/* ───────────────────────────────────────────────────────────
   Meta – all file-editor sub-component stories
   ─────────────────────────────────────────────────────────── */

const meta = {
  title: "Composites/Session/FileEditor",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Header / View Mode",
  render: () => (
    <FileEditorHeader fileName="tokens.rs" filePath="src/auth/tokens.rs" editMode={false} hasUnsaved={false} onEdit={fn()} onSave={fn()} onCancel={fn()} />
  ),
};

export const EditMode: Story = {
  name: "Header / Edit Mode (No Changes)",
  render: () => (
    <FileEditorHeader fileName="tokens.rs" filePath="src/auth/tokens.rs" editMode={true} hasUnsaved={false} onEdit={fn()} onSave={fn()} onCancel={fn()} />
  ),
};

export const EditModeUnsaved: Story = {
  name: "Header / Edit Mode (Unsaved)",
  render: () => (
    <FileEditorHeader fileName="tokens.rs" filePath="src/auth/tokens.rs" editMode={true} hasUnsaved={true} onEdit={fn()} onSave={fn()} onCancel={fn()} />
  ),
};

export const TypeScriptFile: Story = {
  name: "Header / TypeScript File",
  render: () => (
    <FileEditorHeader fileName="config.ts" filePath="src/config.ts" editMode={false} hasUnsaved={false} onEdit={fn()} onSave={fn()} onCancel={fn()} />
  ),
};

export const DeepNestedPath: Story = {
  name: "Header / Deep Nested Path",
  render: () => (
    <FileEditorHeader
      fileName="middleware.rs"
      filePath="src/auth/middleware/rate_limit/middleware.rs"
      editMode={false}
      hasUnsaved={false}
      onEdit={fn()}
      onSave={fn()}
      onCancel={fn()}
    />
  ),
};

/* ───────────────────────────────────────────────────────────
   HighlightedCode
   ─────────────────────────────────────────────────────────── */

const sampleRustCode = `use jsonwebtoken::{encode, decode, Header, Validation};
use chrono::{Utc, Duration};

pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

impl AuthService {
    pub fn issue_tokens(&self, user_id: &str) -> Result<TokenPair> {
        let access_claims = Claims {
            sub: user_id.to_string(),
            exp: (Utc::now() + Duration::minutes(15)).timestamp() as usize,
            iat: Utc::now().timestamp() as usize,
        };
        let access_token = encode(&Header::default(), &access_claims, &self.key)?;
        Ok(TokenPair { access_token, refresh_token: "...".into(), expires_in: 900 })
    }
}`;

const sampleTsCode = `import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["admin", "user", "viewer"]),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;`;

const sampleJsonCode = `{
  "name": "lunaria",
  "version": "0.8.1",
  "dependencies": {
    "jsonwebtoken": "^9.2.0",
    "chrono": "0.4"
  }
}`;

export const HighlightedCodeRust: Story = {
  render: () => (
    <div style={{ height: 400 }} className="overflow-auto bg-surface-0">
      <HighlightedCode content={sampleRustCode} fileName="tokens.rs" />
    </div>
  ),
};

export const HighlightedCodeTypeScript: Story = {
  render: () => (
    <div style={{ height: 400 }} className="overflow-auto bg-surface-0">
      <HighlightedCode content={sampleTsCode} fileName="schema.ts" />
    </div>
  ),
};

export const HighlightedCodeJson: Story = {
  render: () => (
    <div style={{ height: 300 }} className="overflow-auto bg-surface-0">
      <HighlightedCode content={sampleJsonCode} fileName="Cargo.toml" />
    </div>
  ),
};

export const HighlightedCodeEmpty: Story = {
  render: () => (
    <div style={{ height: 200 }} className="overflow-auto bg-surface-0">
      <HighlightedCode content="" fileName="empty.txt" />
    </div>
  ),
};
