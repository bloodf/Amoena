import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface QueueMessage {
  id: string;
  content: string;
  queueType: "app" | "cli";
  status: string;
  orderIndex: number;
}

interface QueuePanelProps {
  messages: QueueMessage[];
  onEdit: (id: string, content: string) => void;
  onRemove: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onFlush: () => void;
}

export function QueuePanel({ messages, onEdit, onRemove, onReorder, onFlush }: QueuePanelProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const isAppQueue = messages.some((m) => m.queueType === "app");
  const pendingMessages = messages.filter((m) => m.status === "pending");

  const handleStartEdit = (msg: QueueMessage) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      onEdit(editingId, editContent);
      setEditingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{t("queue.title")}</h3>
        <div className="flex gap-2">
          <span className="text-xs text-muted-foreground">{pendingMessages.length} {t("queue.pending")}</span>
          {pendingMessages.length > 0 && (
            <button
              onClick={onFlush}
              className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("queue.sendNext")}
            </button>
          )}
        </div>
      </div>

      {messages.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">{t("queue.empty")}</p>
      )}

      <div className="flex flex-col gap-1">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2 p-2 rounded border bg-card">
            <div className="flex-1 min-w-0">
              {editingId === msg.id ? (
                <div className="flex gap-1">
                  <input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 text-sm px-2 py-1 border rounded bg-background"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground"
                  >
                    {t("queue.save")}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs px-2 py-1 rounded border"
                  >
                    {t("queue.cancel")}
                  </button>
                </div>
              ) : (
                <p className="text-sm truncate">{msg.content}</p>
              )}
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{msg.queueType}</span>
                <span
                  className={`text-xs ${
                    msg.status === "pending"
                      ? "text-yellow-500"
                      : msg.status === "sent"
                        ? "text-green-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {msg.status}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleStartEdit(msg)}
                className="text-xs px-1 hover:text-primary"
              >
                {t("queue.edit")}
              </button>
              <button
                onClick={() => onRemove(msg.id)}
                className="text-xs px-1 hover:text-destructive"
              >
                {t("queue.remove")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isAppQueue && messages.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">{t("queue.cliDisabled")}</p>
      )}
    </div>
  );
}
