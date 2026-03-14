import React from "react";
import { useTranslation } from "react-i18next";

interface PermissionRequest {
  requestId: string;
  toolName: string;
  input: Record<string, unknown>;
  sessionId: string;
}

interface PermissionDialogProps {
  request: PermissionRequest | null;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string, reason?: string) => void;
}

export function PermissionDialog({ request, onApprove, onDeny }: PermissionDialogProps) {
  const { t } = useTranslation();
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">{t("permission.title")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("permission.description")} <span className="font-mono font-medium">{request.toolName}</span>
        </p>
        <div className="bg-muted rounded p-3 mb-4 max-h-32 overflow-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {JSON.stringify(request.input, null, 2)}
          </pre>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onDeny(request.requestId)}
            className="px-4 py-2 text-sm rounded border hover:bg-muted transition-colors"
          >
            {t("permission.deny")}
          </button>
          <button
            onClick={() => onApprove(request.requestId)}
            className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("permission.approve")}
          </button>
        </div>
      </div>
    </div>
  );
}
