import {
  Braces,
  Database,
  FileArchive,
  FileCode,
  FileCode2,
  FileJson,
  FileKey,
  FileLock,
  FilePieChart,
  FileSpreadsheet,
  FileText,
  FileType,
  FileType2,
  Image,
  Music,
  Settings,
  Terminal,
  Video,
} from "lucide-react";
import type { FileNode } from "./types";

export function getFileIcon(filename: string, size = 13) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const iconProps = { size, className: "text-muted-foreground flex-shrink-0" };

  const iconMap: Record<string, React.ReactNode> = {
    tsx: <FileCode2 {...iconProps} />, ts: <FileCode2 {...iconProps} />,
    jsx: <FileCode {...iconProps} />, js: <FileCode {...iconProps} />,
    rs: <Braces {...iconProps} />, py: <Terminal {...iconProps} />,
    go: <Terminal {...iconProps} />, java: <FileCode2 {...iconProps} />,
    cpp: <FileCode {...iconProps} />, c: <FileCode {...iconProps} />,
    h: <FileCode {...iconProps} />, hpp: <FileCode {...iconProps} />,
    swift: <FileCode2 {...iconProps} />, kt: <FileCode2 {...iconProps} />,
    rb: <Terminal {...iconProps} />, php: <FileCode {...iconProps} />,
    scala: <FileCode2 {...iconProps} />, r: <FilePieChart {...iconProps} />,
    m: <FileCode {...iconProps} />, cs: <FileCode2 {...iconProps} />,
    fs: <FileCode {...iconProps} />, elm: <FileCode {...iconProps} />,
    ex: <FileCode {...iconProps} />, exs: <FileCode {...iconProps} />,
    erl: <FileCode {...iconProps} />, hs: <FileCode {...iconProps} />,
    clj: <FileCode {...iconProps} />, cljs: <FileCode {...iconProps} />,
    groovy: <FileCode {...iconProps} />, lua: <FileCode {...iconProps} />,
    pl: <Terminal {...iconProps} />, pm: <Terminal {...iconProps} />,
    raku: <Terminal {...iconProps} />,
    html: <FileCode {...iconProps} />, htm: <FileCode {...iconProps} />,
    css: <FileCode {...iconProps} />, scss: <FileCode {...iconProps} />,
    sass: <FileCode {...iconProps} />, less: <FileCode {...iconProps} />,
    vue: <FileCode {...iconProps} />, svelte: <FileCode {...iconProps} />,
    astro: <FileCode {...iconProps} />, svg: <Image {...iconProps} />,
    json: <FileJson {...iconProps} />, yaml: <FileJson {...iconProps} />,
    yml: <FileJson {...iconProps} />, toml: <Settings {...iconProps} />,
    ini: <Settings {...iconProps} />, conf: <Settings {...iconProps} />,
    config: <Settings {...iconProps} />, env: <FileKey {...iconProps} />,
    lock: <FileLock {...iconProps} />, gradle: <Settings {...iconProps} />,
    cmake: <Settings {...iconProps} />, ninja: <Settings {...iconProps} />,
    md: <FileText {...iconProps} />, mdx: <FileText {...iconProps} />,
    txt: <FileType {...iconProps} />, rtf: <FileType {...iconProps} />,
    doc: <FileType2 {...iconProps} />, docx: <FileType2 {...iconProps} />,
    pdf: <FileType2 {...iconProps} />, tex: <FileType {...iconProps} />,
    odt: <FileType2 {...iconProps} />, pages: <FileType2 {...iconProps} />,
    sql: <Database {...iconProps} />, db: <Database {...iconProps} />,
    sqlite: <Database {...iconProps} />, prisma: <Database {...iconProps} />,
    sh: <Terminal {...iconProps} />, bash: <Terminal {...iconProps} />,
    zsh: <Terminal {...iconProps} />, fish: <Terminal {...iconProps} />,
    ps1: <Terminal {...iconProps} />, bat: <Terminal {...iconProps} />,
    cmd: <Terminal {...iconProps} />,
    png: <Image {...iconProps} />, jpg: <Image {...iconProps} />,
    jpeg: <Image {...iconProps} />, gif: <Image {...iconProps} />,
    webp: <Image {...iconProps} />, bmp: <Image {...iconProps} />,
    ico: <Image {...iconProps} />, mp3: <Music {...iconProps} />,
    wav: <Music {...iconProps} />, flac: <Music {...iconProps} />,
    aac: <Music {...iconProps} />, ogg: <Music {...iconProps} />,
    mp4: <Video {...iconProps} />, avi: <Video {...iconProps} />,
    mov: <Video {...iconProps} />, mkv: <Video {...iconProps} />,
    webm: <Video {...iconProps} />,
    zip: <FileArchive {...iconProps} />, tar: <FileArchive {...iconProps} />,
    gz: <FileArchive {...iconProps} />, bz2: <FileArchive {...iconProps} />,
    xz: <FileArchive {...iconProps} />, "7z": <FileArchive {...iconProps} />,
    rar: <FileArchive {...iconProps} />,
    csv: <FileSpreadsheet {...iconProps} />, xls: <FileSpreadsheet {...iconProps} />,
    xlsx: <FileSpreadsheet {...iconProps} />, numbers: <FileSpreadsheet {...iconProps} />,
  };

  if (filename === "Dockerfile" || filename.startsWith("Dockerfile")) return <Settings {...iconProps} />;
  if (filename === "Makefile" || filename === "makefile") return <Terminal {...iconProps} />;
  if (filename === ".gitignore" || filename === ".dockerignore" || filename.endsWith("ignore")) return <FileLock {...iconProps} />;
  if (filename === "LICENSE" || filename.startsWith("LICENSE")) return <FileKey {...iconProps} />;
  if (filename === "README" || filename.startsWith("README")) return <FileText {...iconProps} />;
  if (filename === ".env" || filename.startsWith(".env")) return <FileKey {...iconProps} />;

  return iconMap[ext] || <FileType {...iconProps} />;
}

export function findFile(tree: FileNode[], name: string): FileNode | null {
  for (const node of tree) {
    if (node.name === name && node.type === "file") return node;
    if (node.children) {
      const found = findFile(node.children, name);
      if (found) return found;
    }
  }
  return null;
}

export function getFilePath(tree: FileNode[], target: string, prefix = ""): string {
  for (const node of tree) {
    const path = prefix ? `${prefix}/${node.name}` : node.name;
    if (node.name === target && node.type === "file") return path;
    if (node.children) {
      const found = getFilePath(node.children, target, path);
      if (found) return found;
    }
  }
  return "";
}

export function countItems(node: FileNode): number {
  if (node.type === "file") return 1;
  return node.children?.reduce((acc, child) => acc + countItems(child), 0) || 0;
}
