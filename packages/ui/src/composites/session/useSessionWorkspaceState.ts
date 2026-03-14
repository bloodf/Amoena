import { useEffect, useRef, useState } from "react";
import type { SessionConfig } from "@/screens/NewSessionScreen";
import { initialSessionRecords } from "./data";
import type { SessionRecord, WorkspaceTabItem } from "./types";

export function useSessionWorkspaceState(locationState: unknown) {
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [sidePanelWidth, setSidePanelWidth] = useState(300);
  const [terminalHeight, setTerminalHeight] = useState(180);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [sessions, setSessions] = useState<SessionRecord[]>(initialSessionRecords);
  const [tabs, setTabs] = useState<WorkspaceTabItem[]>(initialSessionRecords.map((session) => ({ type: "session" as const, id: session.id })));
  const [activeTabId, setActiveTabId] = useState("1");
  const [composerMessage, setComposerMessage] = useState("");
  const [tabDropIndex, setTabDropIndex] = useState<number | null>(null);
  const dragTabItem = useRef<number | null>(null);

  const handleNewSession = (config?: Partial<SessionConfig>) => {
    const newId = String(Date.now());
    const newSession: SessionRecord = {
      id: newId,
      title: config?.name || "New Session",
      model: config?.model || "Claude 4 Sonnet",
      provider: (config?.provider as SessionRecord["provider"]) || "claude",
      hasActivity: false,
      permission: config?.permission || "default",
      continueIn: config?.workTarget || "local",
      branch: "main",
      isEmpty: true,
    };
    setSessions((previous) => [...previous, newSession]);
    setTabs((previous) => [...previous, { type: "session", id: newId }]);
    setActiveTabId(newId);
  };

  useEffect(() => {
    const state = locationState as { newSession?: SessionConfig } | null;
    if (state?.newSession) {
      handleNewSession(state.newSession);
      window.history.replaceState({}, document.title);
    }
    // intentional: only respond to initial routed state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationState]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const activeSession = activeTab?.type === "session" ? sessions.find((session) => session.id === activeTabId) : null;

  const updateSession = (id: string, updates: Partial<SessionRecord>) => {
    setSessions((previous) => previous.map((session) => (session.id === id ? { ...session, ...updates } : session)));
  };

  const handleCloseTab = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const sessionTabs = tabs.filter((tab) => tab.type === "session");
    const tab = tabs.find((entry) => entry.id === id);
    if (tab?.type === "session" && sessionTabs.length <= 1) return;

    const next = tabs.filter((entry) => entry.id !== id);
    setTabs(next);
    if (activeTabId === id) setActiveTabId(next[0].id);
  };

  const handleOpenFile = (fileName: string) => {
    const existing = tabs.find((tab) => tab.type === "file" && tab.fileName === fileName);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    const fileTabId = `file-${fileName}-${Date.now()}`;
    setTabs((previous) => [...previous, { type: "file", id: fileTabId, fileName }]);
    setActiveTabId(fileTabId);
  };

  const handleSuggestionClick = (prompt: string) => {
    setComposerMessage(prompt);
  };

  const handleTabDragStart = (index: number) => {
    dragTabItem.current = index;
  };

  const handleTabDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (dragTabItem.current === null || dragTabItem.current === index) {
      setTabDropIndex(null);
      return;
    }
    setTabDropIndex(index);
  };

  const handleTabDragEnd = () => {
    if (dragTabItem.current === null || tabDropIndex === null) {
      dragTabItem.current = null;
      setTabDropIndex(null);
      return;
    }
    const items = [...tabs];
    const dragged = items[dragTabItem.current];
    items.splice(dragTabItem.current, 1);
    const insertAt = tabDropIndex > dragTabItem.current ? tabDropIndex - 1 : tabDropIndex;
    items.splice(insertAt, 0, dragged);
    setTabs(items);
    dragTabItem.current = null;
    setTabDropIndex(null);
  };

  const handleTabDragLeave = () => setTabDropIndex(null);

  const handleTabCloseKey = (id: string, event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCloseTab(id, event as unknown as React.MouseEvent);
    }
  };

  const startTerminalResize = (event: React.MouseEvent) => {
    const startY = event.clientY;
    const startHeight = terminalHeight;
    const onMove = (moveEvent: MouseEvent) => {
      setTerminalHeight(Math.max(80, Math.min(400, startHeight - (moveEvent.clientY - startY))));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const startSidePanelResize = (event: React.MouseEvent) => {
    const startX = event.clientX;
    const startWidth = sidePanelWidth;
    const onMove = (moveEvent: MouseEvent) => {
      setSidePanelWidth(Math.max(240, Math.min(480, startWidth - (moveEvent.clientX - startX))));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return {
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
    handleNewSession,
    handleOpenFile,
    handleSuggestionClick,
    handleTabDragStart,
    handleTabDragOver,
    handleTabDragEnd,
    handleTabDragLeave,
    handleTabCloseKey,
    startTerminalResize,
    startSidePanelResize,
  };
}
