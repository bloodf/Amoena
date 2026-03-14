import { describe, expect, test } from "bun:test";
import { getEditorLanguage } from "./utils";

describe("getEditorLanguage", () => {
  test("returns typescript for .ts files", () => {
    expect(getEditorLanguage("foo.ts")).toBe("typescript");
  });

  test("returns tsx for .tsx files", () => {
    expect(getEditorLanguage("App.tsx")).toBe("tsx");
  });

  test("returns javascript for .js files", () => {
    expect(getEditorLanguage("index.js")).toBe("javascript");
  });

  test("returns jsx for .jsx files", () => {
    expect(getEditorLanguage("App.jsx")).toBe("jsx");
  });

  test("returns yaml for .yml files", () => {
    expect(getEditorLanguage("config.yml")).toBe("yaml");
  });

  test("returns plaintext for unknown extension", () => {
    expect(getEditorLanguage("data.xyz")).toBe("plaintext");
  });

  test("returns plaintext for file with no extension", () => {
    expect(getEditorLanguage("Makefile")).toBe("plaintext");
  });

  test("handles case-insensitive extensions", () => {
    expect(getEditorLanguage("style.CSS")).toBe("css");
  });
});
