export interface Opinion {
  title: string;
  desc: string;
  value: string;
  scope: "global" | "workspace";
  editable: boolean;
}

export const initialOpinionCategories: { name: string; opinions: Opinion[] }[] = [
  {
    name: "Code Style",
    opinions: [
      { title: "Formatting", desc: "Code formatting rules and preferences", value: "Prettier + 2-space indent", scope: "global" as const, editable: false },
      { title: "Import style", desc: "Module import organization", value: "Grouped, absolute paths", scope: "global" as const, editable: false },
      { title: "Error handling", desc: "Preferred error handling patterns", value: "Result types, no exceptions", scope: "workspace" as const, editable: false },
      { title: "Naming convention", desc: "Variable and function naming", value: "snake_case for Rust, camelCase for TS", scope: "workspace" as const, editable: false },
    ],
  },
  {
    name: "Architecture",
    opinions: [
      { title: "State management", desc: "Preferred state management approach", value: "Server-first, minimal client state", scope: "global" as const, editable: false },
      { title: "API design", desc: "API design conventions", value: "REST + JSON:API spec", scope: "global" as const, editable: false },
      { title: "Database access", desc: "How to interact with databases", value: "Repository pattern, no raw SQL in handlers", scope: "workspace" as const, editable: false },
    ],
  },
  {
    name: "Testing",
    opinions: [
      { title: "Test strategy", desc: "Testing pyramid preferences", value: "Integration-heavy, selective unit tests", scope: "global" as const, editable: false },
      { title: "Mocking approach", desc: "When and how to use mocks", value: "Minimal mocking, prefer fakes", scope: "global" as const, editable: false },
      { title: "Coverage target", desc: "Code coverage expectations", value: "80% for critical paths, no blanket requirement", scope: "workspace" as const, editable: false },
    ],
  },
  {
    name: "Documentation",
    opinions: [
      { title: "Comment style", desc: "When and how to write comments", value: "Explain why, not what. Doc comments on public APIs.", scope: "global" as const, editable: false },
      { title: "README", desc: "README structure preferences", value: "Quick start first, architecture second", scope: "global" as const, editable: false },
    ],
  },
];
