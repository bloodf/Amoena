import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";

function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const win = getCurrentWindow();
    win.isMaximized().then(setIsMaximized).catch(() => {});

    const unlisten = win.onResized(() => {
      win.isMaximized().then(setIsMaximized).catch(() => {});
    });

    return () => {
      unlisten.then((fn) => fn()).catch(() => {});
    };
  }, []);

  const handleMinimize = () => getCurrentWindow().minimize().catch(() => {});
  const handleMaximize = () =>
    isMaximized
      ? getCurrentWindow().unmaximize().catch(() => {})
      : getCurrentWindow().maximize().catch(() => {});
  const handleClose = () => getCurrentWindow().close().catch(() => {});

  // macOS — traffic lights
  if (window.__TAURI_OS_PLUGIN_INTERNALS__?.platform === "macos") {
    return (
      <div className="flex items-center gap-2 pl-3">
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="h-3 w-3 rounded-full bg-[#ff5f56] hover:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        />
        <button
          type="button"
          aria-label="Minimize"
          onClick={handleMinimize}
          className="h-3 w-3 rounded-full bg-[#ffbd2e] hover:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        />
        <button
          type="button"
          aria-label={isMaximized ? "Restore" : "Maximize"}
          onClick={handleMaximize}
          className="h-3 w-3 rounded-full bg-[#27c93f] hover:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
        />
      </div>
    );
  }

  // Windows / Linux — right-side controls
  return (
    <div className="ml-auto flex items-center">
      <button
        type="button"
        aria-label="Minimize"
        onClick={handleMinimize}
        className="flex h-full w-10 items-center justify-center text-foreground/70 hover:bg-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/30"
      >
        <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
          <rect width="10" height="1" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={isMaximized ? "Restore" : "Maximize"}
        onClick={handleMaximize}
        className="flex h-full w-10 items-center justify-center text-foreground/70 hover:bg-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/30"
      >
        {isMaximized ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="2" y="0" width="8" height="8" />
            <rect x="0" y="2" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0" y="0" width="10" height="10" />
          </svg>
        )}
      </button>
      <button
        type="button"
        aria-label="Close"
        onClick={handleClose}
        className="flex h-full w-10 items-center justify-center text-foreground/70 hover:bg-red-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="0" y1="0" x2="10" y2="10" />
          <line x1="10" y1="0" x2="0" y2="10" />
        </svg>
      </button>
    </div>
  );
}

export function Titlebar() {
  const isMacOS = window.__TAURI_OS_PLUGIN_INTERNALS__?.platform === "macos";

  return (
    <header
      data-tauri-drag-region
      className="flex h-9 w-full select-none items-center bg-background/80 backdrop-blur-sm border-b border-border/40"
    >
      {/* macOS traffic lights sit left of the drag region */}
      {isMacOS && <WindowControls />}

      {/* App name centered — pointer-events-none keeps drag working */}
      <span
        data-tauri-drag-region
        className="pointer-events-none flex-1 text-center text-xs font-medium text-foreground/60"
      >
        Lunaria
      </span>

      {/* Windows/Linux controls on the right */}
      {!isMacOS && <WindowControls />}
    </header>
  );
}

// Augment window type for platform detection used above
declare global {
  interface Window {
    __TAURI_OS_PLUGIN_INTERNALS__?: {
      platform?: string;
    };
  }
}
