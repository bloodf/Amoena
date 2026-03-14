export function getEditorLanguage(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    css: "css",
    json: "json",
    md: "markdown",
    sh: "bash",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    html: "markup",
  };
  return map[ext] || "plaintext";
}
