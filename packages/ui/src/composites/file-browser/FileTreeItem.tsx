import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileIcon, countItems } from "./utils";
import type { FileNode } from "./types";

export function FileTreeItem({
  item,
  depth = 0,
  onOpenFile,
  parentPath = "",
}: {
  item: FileNode;
  depth?: number;
  onOpenFile: (name: string, path?: string) => void;
  parentPath?: string;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isFolder = item.type === "folder";
  const fullPath = item.path ?? (parentPath ? `${parentPath}/${item.name}` : item.name);

  const handleDragStart = (event: React.DragEvent) => {
    const data = {
      type: item.type,
      name: item.name,
      path: fullPath,
      itemCount: isFolder ? item.itemCount ?? countItems(item) : undefined,
      inferredTypes: isFolder ? item.inferredTypes : undefined,
      truncated: isFolder ? item.truncated ?? false : undefined,
    };
    event.dataTransfer.setData("lunaria/file", JSON.stringify(data));
    event.dataTransfer.effectAllowed = "copy";

    const ghost = document.createElement("div");
    ghost.textContent = isFolder ? fullPath : item.name;
    ghost.style.cssText =
      "position:absolute;top:-100px;left:-100px;padding:4px 10px;background:#242328;border:1px solid #333;border-radius:4px;font-size:11px;font-family:JetBrains Mono,monospace;color:#E0E0E0;white-space:nowrap;";
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  return (
    <div>
      <button
        draggable
        onDragStart={handleDragStart}
        onClick={() => (isFolder ? setOpen(!open) : onOpenFile(item.name, item.path ?? fullPath))}
        className={cn(
          "group flex w-full items-center gap-1.5 px-2 py-1 text-left text-[12px] transition-colors hover:bg-[rgba(255,255,255,0.05)]",
          isFolder ? "text-muted-foreground" : "text-foreground",
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        {isFolder ? (open ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : null}
        {isFolder ? <Folder size={13} className="flex-shrink-0 text-muted-foreground" /> : getFileIcon(item.name, 13)}
        <span className="flex-1 truncate font-mono">{item.name}</span>
        <div className="hidden flex-shrink-0 items-center gap-0.5 group-hover:flex">
          <span title="Drag to attach">
            <GripVertical size={10} className="cursor-grab text-muted-foreground" />
          </span>
        </div>
      </button>
      {isFolder && open && item.children?.map((child) => <FileTreeItem key={child.name} item={child} depth={depth + 1} onOpenFile={onOpenFile} parentPath={fullPath} />)}
    </div>
  );
}
