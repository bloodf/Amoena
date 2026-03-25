import { useEffect, useState } from 'react';

type ElectronWindowBridge = {
  minimize: () => void;
  maximize: () => void;
  unmaximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;
  onMaximizeChange: (cb: (maximized: boolean) => void) => () => void;
  platform: string;
};

function getWindowBridge(): ElectronWindowBridge | null {
  const win = window as unknown as { amoenaWindow?: ElectronWindowBridge };
  return win.amoenaWindow ?? null;
}

function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false);
  const bridge = getWindowBridge();

  useEffect(() => {
    if (bridge === null) return;

    void bridge.isMaximized().then(setIsMaximized);
    const unlisten = bridge.onMaximizeChange(setIsMaximized);
    return unlisten;
  }, [bridge]);

  const handleMinimize = () => bridge?.minimize();
  const handleMaximize = () => (isMaximized ? bridge?.unmaximize() : bridge?.maximize());
  const handleClose = () => bridge?.close();

  const isMacOS = bridge?.platform === 'darwin';

  // macOS — traffic lights
  if (isMacOS) {
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
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
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
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        onClick={handleMaximize}
        className="flex h-full w-10 items-center justify-center text-foreground/70 hover:bg-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/30"
      >
        {isMaximized ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <rect x="2" y="0" width="8" height="8" />
            <rect
              x="0"
              y="2"
              width="8"
              height="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        ) : (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
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
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <line x1="0" y1="0" x2="10" y2="10" />
          <line x1="10" y1="0" x2="0" y2="10" />
        </svg>
      </button>
    </div>
  );
}

export function Titlebar() {
  const bridge = getWindowBridge();
  const isMacOS = bridge?.platform === 'darwin';

  return (
    <header
      className="flex h-9 w-full select-none items-center bg-background/80 backdrop-blur-sm border-b border-border/40"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* macOS traffic lights sit left of the drag region */}
      {isMacOS && <WindowControls />}

      {/* App name centered — pointer-events-none keeps drag working */}
      <span className="pointer-events-none flex-1 text-center text-xs font-medium text-foreground/60">
        Amoena
      </span>

      {/* Windows/Linux controls on the right */}
      {!isMacOS && <WindowControls />}
    </header>
  );
}
