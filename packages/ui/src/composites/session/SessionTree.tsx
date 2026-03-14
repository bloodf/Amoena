import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface SessionSummary {
  id: string;
  sessionMode: string;
  tuiType: string;
  workingDir: string;
  status: string;
  createdAt: string;
}

interface SessionTreeNode {
  session: SessionSummary;
  children: SessionTreeNode[];
}

interface SessionTreeProps {
  tree: SessionTreeNode | null;
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
}

function TreeNode({
  node,
  depth,
  activeSessionId,
  onSelectSession,
}: {
  node: SessionTreeNode;
  depth: number;
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isActive = node.session.id === activeSessionId;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm hover:bg-muted transition-colors ${
          isActive ? "bg-accent text-accent-foreground" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelectSession(node.session.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-xs w-4 h-4 flex items-center justify-center"
          >
            {expanded ? "▾" : "▸"}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="font-mono text-xs truncate">{node.session.id.slice(0, 8)}</span>
        <span
          className={`text-xs ml-auto ${
            node.session.status === "running" ? "text-green-500" : "text-muted-foreground"
          }`}
        >
          {node.session.status}
        </span>
      </div>
      {expanded &&
        node.children.map((child) => (
          <TreeNode
            key={child.session.id}
            node={child}
            depth={depth + 1}
            activeSessionId={activeSessionId}
            onSelectSession={onSelectSession}
          />
        ))}
    </div>
  );
}

export function SessionTree({ tree, activeSessionId, onSelectSession }: SessionTreeProps) {
  const { t } = useTranslation();
  if (!tree) {
    return <p className="text-sm text-muted-foreground p-4">{t("sessionTree.empty")}</p>;
  }

  return (
    <div className="flex flex-col py-2">
      <h3 className="text-sm font-semibold px-4 mb-2">{t("sessionTree.title")}</h3>
      <TreeNode
        node={tree}
        depth={0}
        activeSessionId={activeSessionId}
        onSelectSession={onSelectSession}
      />
    </div>
  );
}
