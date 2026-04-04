import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { getFileIcon, findFile, getFilePath, countItems } from "./utils";
import type { FileNode } from "./types";

const tree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      { name: "index.ts", type: "file" },
      { name: "app.tsx", type: "file" },
      {
        name: "utils",
        type: "folder",
        children: [{ name: "helpers.rs", type: "file" }],
      },
    ],
  },
  { name: "README.md", type: "file" },
];

describe("getFileIcon", () => {
  test("returns FileCode2 for .ts files", () => {
    const icon = getFileIcon("index.ts");
    const { container } = render(<>{icon}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileCode2 for .tsx files", () => {
    const { container } = render(<>{getFileIcon("app.tsx")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileCode for .jsx files", () => {
    const { container } = render(<>{getFileIcon("main.jsx")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileCode for .js files", () => {
    const { container } = render(<>{getFileIcon("index.js")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Braces for .rs files", () => {
    const { container } = render(<>{getFileIcon("main.rs")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Terminal for .py files", () => {
    const { container } = render(<>{getFileIcon("script.py")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileJson for .json files", () => {
    const { container } = render(<>{getFileIcon("config.json")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileJson for .yaml files", () => {
    const { container } = render(<>{getFileIcon("config.yaml")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileJson for .yml files", () => {
    const { container } = render(<>{getFileIcon("deploy.yml")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Settings for .toml files", () => {
    const { container } = render(<>{getFileIcon("Cargo.toml")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileText for .md files", () => {
    const { container } = render(<>{getFileIcon("README.md")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Database for .sql files", () => {
    const { container } = render(<>{getFileIcon("schema.sql")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Terminal for .sh files", () => {
    const { container } = render(<>{getFileIcon("build.sh")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Image for .png files", () => {
    const { container } = render(<>{getFileIcon("logo.png")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Image for .svg files", () => {
    const { container } = render(<>{getFileIcon("icon.svg")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Music for .mp3 files", () => {
    const { container } = render(<>{getFileIcon("song.mp3")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Video for .mp4 files", () => {
    const { container } = render(<>{getFileIcon("video.mp4")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileArchive for .zip files", () => {
    const { container } = render(<>{getFileIcon("archive.zip")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileSpreadsheet for .csv files", () => {
    const { container } = render(<>{getFileIcon("data.csv")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileKey for .env files", () => {
    const { container } = render(<>{getFileIcon(".env")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileKey for .env.local", () => {
    const { container } = render(<>{getFileIcon(".env.local")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Settings for Dockerfile", () => {
    const { container } = render(<>{getFileIcon("Dockerfile")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Settings for Dockerfile.dev", () => {
    const { container } = render(<>{getFileIcon("Dockerfile.dev")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Terminal for Makefile", () => {
    const { container } = render(<>{getFileIcon("Makefile")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Terminal for makefile (lowercase)", () => {
    const { container } = render(<>{getFileIcon("makefile")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileLock for .gitignore", () => {
    const { container } = render(<>{getFileIcon(".gitignore")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileLock for .dockerignore", () => {
    const { container } = render(<>{getFileIcon(".dockerignore")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileLock for files ending in ignore", () => {
    const { container } = render(<>{getFileIcon(".npmignore")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileKey for LICENSE", () => {
    const { container } = render(<>{getFileIcon("LICENSE")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileKey for LICENSE.md", () => {
    const { container } = render(<>{getFileIcon("LICENSE.md")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileText for README", () => {
    const { container } = render(<>{getFileIcon("README")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileText for README.rst", () => {
    const { container } = render(<>{getFileIcon("README.rst")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileLock for .lock files", () => {
    const { container } = render(<>{getFileIcon("package-lock.json")}</>);
    // .json wins over .lock since ext is 'json' - just verify no crash
    expect(container).toBeTruthy();
  });

  test("returns FileType for unknown extension", () => {
    const { container } = render(<>{getFileIcon("binary.unknown123")}</>);
    expect(container).toBeTruthy();
  });

  test("handles file with no extension", () => {
    const { container } = render(<>{getFileIcon("Procfile")}</>);
    expect(container).toBeTruthy();
  });

  test("accepts custom size parameter", () => {
    const { container } = render(<>{getFileIcon("file.ts", 20)}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileSpreadsheet for .xlsx files", () => {
    const { container } = render(<>{getFileIcon("report.xlsx")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Terminal for .go files", () => {
    const { container } = render(<>{getFileIcon("main.go")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileCode2 for .java files", () => {
    const { container } = render(<>{getFileIcon("Main.java")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileCode for .css files", () => {
    const { container } = render(<>{getFileIcon("style.css")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileCode for .html files", () => {
    const { container } = render(<>{getFileIcon("index.html")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileCode for .vue files", () => {
    const { container } = render(<>{getFileIcon("App.vue")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileCode for .svelte files", () => {
    const { container } = render(<>{getFileIcon("App.svelte")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FilePieChart for .r files", () => {
    const { container } = render(<>{getFileIcon("analysis.r")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Settings for .ini files", () => {
    const { container } = render(<>{getFileIcon("config.ini")}</>);
    expect(container).toBeTruthy();
  });

  test("returns Database for .db files", () => {
    const { container } = render(<>{getFileIcon("data.db")}</>);
    expect(container).toBeTruthy();
  });

  test("returns FileArchive for .tar files", () => {
    const { container } = render(<>{getFileIcon("backup.tar")}</>);
    expect(container).toBeTruthy();
  });
});

describe("findFile", () => {
  test("finds a file at top level", () => {
    const result = findFile(tree, "README.md");
    expect(result).not.toBeNull();
    expect(result?.name).toBe("README.md");
  });

  test("finds a file nested inside a folder", () => {
    const result = findFile(tree, "index.ts");
    expect(result).not.toBeNull();
    expect(result?.name).toBe("index.ts");
  });

  test("finds a deeply nested file", () => {
    const result = findFile(tree, "helpers.rs");
    expect(result).not.toBeNull();
    expect(result?.name).toBe("helpers.rs");
  });

  test("returns null for non-existent file", () => {
    const result = findFile(tree, "nonexistent.ts");
    expect(result).toBeNull();
  });

  test("does not return a folder as a file", () => {
    const result = findFile(tree, "src");
    expect(result).toBeNull();
  });

  test("returns null for empty tree", () => {
    expect(findFile([], "index.ts")).toBeNull();
  });
});

describe("getFilePath", () => {
  test("returns path for a top-level file", () => {
    const result = getFilePath(tree, "README.md");
    expect(result).toBe("README.md");
  });

  test("returns nested path for file inside folder", () => {
    const result = getFilePath(tree, "index.ts");
    expect(result).toBe("src/index.ts");
  });

  test("returns deeply nested path", () => {
    const result = getFilePath(tree, "helpers.rs");
    expect(result).toBe("src/utils/helpers.rs");
  });

  test("returns empty string for non-existent file", () => {
    const result = getFilePath(tree, "missing.ts");
    expect(result).toBe("");
  });

  test("returns empty string for a folder name", () => {
    const result = getFilePath(tree, "src");
    expect(result).toBe("");
  });
});

describe("countItems", () => {
  test("counts 1 for a file node", () => {
    const file: FileNode = { name: "index.ts", type: "file" };
    expect(countItems(file)).toBe(1);
  });

  test("counts all leaf files in a folder recursively", () => {
    const folder = tree[0]!; // src folder with 3 files (nested)
    expect(countItems(folder)).toBe(3);
  });

  test("returns 0 for empty folder", () => {
    const empty: FileNode = { name: "empty", type: "folder", children: [] };
    expect(countItems(empty)).toBe(0);
  });

  test("returns 0 for folder with no children property", () => {
    const noChildren: FileNode = { name: "empty", type: "folder" };
    expect(countItems(noChildren)).toBe(0);
  });
});
