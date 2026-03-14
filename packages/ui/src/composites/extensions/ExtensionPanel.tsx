import React from "react";
import { useTranslation } from "react-i18next";

interface ExtensionSummary {
  id: string;
  name: string;
  version: string;
  publisher?: string;
  description: string;
  enabled: boolean;
  permissions: string[];
}

interface ExtensionPanelProps {
  extensions: ExtensionSummary[];
  onToggle: (id: string, enabled: boolean) => void;
  onUninstall: (id: string) => void;
  onInstall: () => void;
}

export function ExtensionPanel({
  extensions,
  onToggle,
  onUninstall,
  onInstall,
}: ExtensionPanelProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{t("extensions.title")}</h3>
        <button
          onClick={onInstall}
          className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {t("extensions.install")}
        </button>
      </div>

      {extensions.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("extensions.empty")}
        </p>
      )}

      {extensions.map((ext) => (
        <div key={ext.id} className="flex items-start gap-3 p-3 rounded border bg-card">
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold">
            {ext.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{ext.name}</span>
              <span className="text-xs text-muted-foreground">v{ext.version}</span>
            </div>
            {ext.publisher && (
              <span className="text-xs text-muted-foreground">{ext.publisher}</span>
            )}
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ext.description}</p>
            {ext.permissions.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {ext.permissions.map((p) => (
                  <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onToggle(ext.id, !ext.enabled)}
              className={`text-xs px-2 py-1 rounded ${
                ext.enabled
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {ext.enabled ? t("extensions.enabled") : t("extensions.disabled")}
            </button>
            <button
              onClick={() => onUninstall(ext.id)}
              className="text-xs px-2 py-1 rounded border hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              {t("extensions.uninstall")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
