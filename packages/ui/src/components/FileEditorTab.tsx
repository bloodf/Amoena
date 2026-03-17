import { useState } from 'react';
import { mockFileTree } from '@/composites/file-browser/data';
import { findFile, getFilePath } from '@/composites/file-browser/utils';
import { FileEditorHeader } from '@/composites/file-editor/FileEditorHeader';
import { HighlightedCode } from '@/composites/file-editor/HighlightedCode';

interface FileEditorTabProps {
  fileName: string;
  filePath?: string;
  fileContent?: string;
  onSaveContent?: (content: string) => void;
}

export function FileEditorTab({
  fileName,
  filePath,
  fileContent,
  onSaveContent,
}: FileEditorTabProps) {
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [savedContent, setSavedContent] = useState<string | null>(null);

  const fileNode = findFile(mockFileTree, fileName);
  const originalContent = fileContent ?? fileNode?.content ?? '';
  const displayContent = savedContent ?? originalContent;
  const hasUnsaved = editMode && editContent !== displayContent;
  const resolvedFilePath = filePath ?? getFilePath(mockFileTree, fileName);

  const handleEdit = () => {
    setEditMode(true);
    setEditContent(displayContent);
  };

  const handleSave = () => {
    setSavedContent(editContent);
    onSaveContent?.(editContent);
    setEditMode(false);
  };

  const handleCancel = () => {
    // hasUnsaved is tracked and surfaced via the header; cancel always discards
    setEditMode(false);
    setEditContent(displayContent);
  };

  return (
    <div className="flex flex-col h-full">
      <FileEditorHeader
        fileName={fileName}
        filePath={resolvedFilePath}
        editMode={editMode}
        hasUnsaved={hasUnsaved}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* Editor content */}
      <div className="flex-1 overflow-auto bg-surface-0">
        {editMode ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full bg-surface-0 text-[12px] font-mono text-foreground p-4 resize-none focus:outline-none leading-relaxed"
            spellCheck={false}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
              }
            }}
          />
        ) : (
          <HighlightedCode content={displayContent} fileName={fileName} />
        )}
      </div>
    </div>
  );
}
