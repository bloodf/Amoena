export interface FileNode {
  name: string;
  type: "folder" | "file";
  path?: string;
  itemCount?: number;
  inferredTypes?: string[];
  truncated?: boolean;
  children?: FileNode[];
  content?: string;
}
