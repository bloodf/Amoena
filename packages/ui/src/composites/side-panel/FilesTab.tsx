import { mockFileTree } from "../file-browser/data";
import { FileTreeItem } from "../file-browser/FileTreeItem";

interface FilesTabProps {
  onOpenFile: (fileName: string, path?: string) => void;
}

export function FilesTab({ onOpenFile }: FilesTabProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {mockFileTree.map((item) => (
          <FileTreeItem key={item.name} item={item} onOpenFile={onOpenFile} />
        ))}
      </div>
    </div>
  );
}
