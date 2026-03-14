import { useNavigate, useLocation } from "react-router-dom";
import { SessionSidePanel } from "@/components/SessionSidePanel";
import { TerminalPanel } from "@/components/TerminalPanel";
import { MessageTimeline } from "@/components/MessageTimeline";
import { SessionComposer } from "@/components/SessionComposer";
import { EmptySessionState } from "@/components/EmptySessionState";
import { MessageQueue } from "@/components/MessageQueue";
import { FileEditorTab } from "@/components/FileEditorTab";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { WorkspaceResizeHandle } from "@/composites/session/WorkspaceResizeHandle";
import { WorkspaceTabs } from "@/composites/session/WorkspaceTabs";
import { useSessionWorkspaceState } from "@/composites/session/useSessionWorkspaceState";

export function SessionWorkspace() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sidePanelOpen,
    sidePanelWidth,
    terminalHeight,
    terminalOpen,
    sessions,
    tabs,
    activeTabId,
    composerMessage,
    tabDropIndex,
    dragTabItem,
    activeTab,
    activeSession,
    setSidePanelOpen,
    setTerminalOpen,
    setActiveTabId,
    setComposerMessage,
    updateSession,
    handleCloseTab,
    handleOpenFile,
    handleSuggestionClick,
    handleTabDragStart,
    handleTabDragOver,
    handleTabDragEnd,
    handleTabDragLeave,
    handleTabCloseKey,
    startTerminalResize,
    startSidePanelResize,
  } = useSessionWorkspaceState(location.state);

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <WorkspaceTabs
          tabs={tabs}
          sessions={sessions}
          activeTabId={activeTabId}
          dragIndex={dragTabItem.current}
          dropIndex={tabDropIndex}
          onTabClick={setActiveTabId}
          onTabClose={handleCloseTab}
          onTabCloseKey={handleTabCloseKey}
          onTabDragStart={handleTabDragStart}
          onTabDragOver={handleTabDragOver}
          onTabDragEnd={handleTabDragEnd}
          onDragLeave={handleTabDragLeave}
          onNewSession={() => navigate("/session/new")}
        />
        <div className="flex items-center h-9 border-b border-border bg-surface-0 flex-shrink-0 px-0">
          <div className="flex-1" />
          <button
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
            className="flex items-center justify-center h-9 w-9 flex-shrink-0 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-surface-2/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
            aria-label={sidePanelOpen ? "Hide side panel" : "Show side panel"}
          >
            {sidePanelOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
          </button>
        </div>

        {/* Content area — session or file editor */}
        {activeTab?.type === "file" ? (
          <div className="flex-1 overflow-hidden">
            <FileEditorTab fileName={activeTab.fileName} />
          </div>
        ) : activeSession ? (
          <>
            <div className="flex-1 overflow-hidden">
              {activeSession.isEmpty ? (
                <EmptySessionState
                  provider={activeSession.provider}
                  model={activeSession.model}
                  sessionName={activeSession.title}
                  onSuggestionClick={handleSuggestionClick}
                />
              ) : (
                <MessageTimeline />
              )}
            </div>

            <MessageQueue />

            <SessionComposer
              provider={activeSession.provider}
              session={activeSession}
              onUpdateSession={(updates) => updateSession(activeTabId, updates)}
              externalMessage={composerMessage}
              onExternalMessageConsumed={() => setComposerMessage("")}
            />
          </>
        ) : null}

        {/* Terminal */}
        {terminalOpen && (
          <>
            <WorkspaceResizeHandle orientation="horizontal" onResizeStart={startTerminalResize} />
            <div style={{ height: terminalHeight }} className="flex-shrink-0">
              <TerminalPanel onClose={() => setTerminalOpen(false)} />
            </div>
          </>
        )}

        {!terminalOpen && (
          <button
            onClick={() => setTerminalOpen(true)}
            className="h-6 border-t border-border bg-surface-0 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer transition-colors flex items-center justify-center"
            aria-label="Open terminal"
          >
            Terminal
          </button>
        )}
      </div>

      {/* Right Side Panel */}
      {sidePanelOpen && (
        <>
          <WorkspaceResizeHandle orientation="vertical" onResizeStart={startSidePanelResize} />
          <div className="flex-shrink-0 border-l border-border" style={{ width: sidePanelWidth }}>
            <SessionSidePanel onOpenFile={handleOpenFile} />
          </div>
        </>
      )}
    </div>
  );
}
