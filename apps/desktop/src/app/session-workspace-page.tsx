import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Button,
  FileEditorTab,
  MessageTimeline,
  SessionComposer,
  WorkspaceTabs,
} from "@lunaria/ui";
import { MemoryTab } from "@/composites/side-panel/MemoryTab";
import { AgentsTab } from "@/composites/side-panel/AgentsTab";
import { PipelineStepper } from "@/composites/autopilot/PipelineStepper";
import type { AutopilotPipelinePhase } from "@/composites/autopilot/types";
import type { ManagedAgent } from "@/composites/agents/types";
import { FileTreeItem } from "@/composites/file-browser/FileTreeItem";

import { useRuntimeApi } from "./runtime-api";
import { useRuntimeContext } from "./runtime-context";
import {
  countTreeItems,
  findFileNodeByPath,
  inferTypes,
  interestingTranscriptEvent,
  toFileNode,
  toMemoryEntries,
  toTimelineMessages,
  toWorkspaceSession,
} from "./session-workspace/transforms";
import { useSessionHydration } from "./session-workspace/use-session-hydration";
import { useSessionStream } from "./session-workspace/use-session-stream";
import { useTerminalSession } from "./session-workspace/use-terminal-session";
import type {
  FileContentResponse,
  FileSaveRequest,
  MessageRecord,
  RuntimeFileNode,
  SessionMemoryResponse,
  TranscriptEvent,
} from "./session-workspace/types";
import { sideTabs } from "./session-workspace/types";

export function RuntimeSessionWorkspacePage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const {
    sessions,
    refreshSessions,
    session: runtimeSession,
    launchContext,
  } = useRuntimeContext();
  const { request } = useRuntimeApi();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessionId ?? null,
  );
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [agents, setAgents] = useState<ManagedAgent[]>([]);
  const [fileTree, setFileTree] = useState<RuntimeFileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<{
    path: string;
    content: string;
  } | null>(null);
  const [sideTab, setSideTab] = useState<(typeof sideTabs)[number]>("review");
  const [memory, setMemory] = useState<SessionMemoryResponse | null>(null);
  const [transcriptEvents, setTranscriptEvents] = useState<TranscriptEvent[]>(
    [],
  );
  const [autopilotPhase, setAutopilotPhase] =
    useState<AutopilotPipelinePhase | null>(null);

  const sessionTabs = useMemo(
    () => sessions.map((summary) => ({ type: "session" as const, id: summary.id })),
    [sessions],
  );
  const tabSessions = useMemo(() => sessions.map(toWorkspaceSession), [sessions]);
  const activeSession = useMemo(
    () => sessions.find((entry) => entry.id === activeSessionId) ?? sessions[0] ?? null,
    [activeSessionId, sessions],
  );
  const reviewEvents = useMemo(
    () => transcriptEvents.filter(interestingTranscriptEvent).slice(-12).reverse(),
    [transcriptEvents],
  );
  const timelineMessages = useMemo(
    () => toTimelineMessages(messages, transcriptEvents, streamingMessage),
    [messages, streamingMessage, transcriptEvents],
  );
  const memoryEntries = useMemo(() => toMemoryEntries(memory), [memory]);
  const { terminalSessionId, terminalOutput } = useTerminalSession({
    activeSession,
    request,
  });

  useEffect(() => {
    if (!activeSessionId && sessions[0]) {
      setActiveSessionId(sessions[0].id);
    }
  }, [activeSessionId, sessions]);

  useSessionHydration({
    activeSession,
    request,
    setMessages,
    setStreamingMessage,
    setAgents,
    setFileTree,
    setSelectedFile,
    setMemory,
    setTranscriptEvents,
    setAutopilotPhase,
  });

  useSessionStream({
    activeSession,
    runtimeSession: runtimeSession ?? null,
    launchContext: launchContext ?? null,
    request,
    setTranscriptEvents,
    setMessages,
    setStreamingMessage,
    setAgents,
    setMemory,
    setAutopilotPhase,
  });

  async function openFile(path: string) {
    const file = await request<FileContentResponse>(
      `/api/v1/files/content?path=${encodeURIComponent(path)}`,
    );
    setSelectedFile(file);
  }

  async function saveFileContent(payload: FileSaveRequest) {
    await request(`/api/v1/files/content`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setSelectedFile((previous) =>
      previous ? { ...previous, content: payload.content } : previous,
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col overflow-hidden">
        <WorkspaceTabs
          tabs={sessionTabs}
          sessions={tabSessions}
          activeTabId={activeSession?.id ?? ""}
          dragIndex={null}
          dropIndex={null}
          onTabClick={(id) => {
            setActiveSessionId(id);
            navigate(`/session/${id}`);
          }}
          onTabClose={async (id, event) => {
            event.stopPropagation();
            await request(`/api/v1/sessions/${id}`, { method: "DELETE" });
            const remainingSessions = sessions.filter((session) => session.id !== id);
            await refreshSessions();
            const nextSessionId = remainingSessions[0]?.id ?? null;
            setActiveSessionId(nextSessionId);
            navigate(nextSessionId ? `/session/${nextSessionId}` : "/session/new");
          }}
          onTabCloseKey={async (id, event) => {
            if (event.key !== "Enter" && event.key !== " ") {
              return;
            }
            event.preventDefault();
            await request(`/api/v1/sessions/${id}`, { method: "DELETE" });
            const remainingSessions = sessions.filter((session) => session.id !== id);
            await refreshSessions();
            const nextSessionId = remainingSessions[0]?.id ?? null;
            setActiveSessionId(nextSessionId);
            navigate(nextSessionId ? `/session/${nextSessionId}` : "/session/new");
          }}
          onTabDragStart={() => {}}
          onTabDragOver={() => {}}
          onTabDragEnd={() => {}}
          onDragLeave={() => {}}
          onNewSession={async () => {
            const created = await request<{ id: string }>("/api/v1/sessions", {
              method: "POST",
              body: JSON.stringify({
                workingDir: ".",
                sessionMode: "native",
                tuiType: "native",
              }),
            });
            await refreshSessions();
            navigate(`/session/${created.id}`);
          }}
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto border-r border-border p-4">
            {autopilotPhase ? (
              <div className="mb-4 rounded-lg border border-border bg-surface-1 p-3">
                <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Autopilot pipeline
                </div>
                <PipelineStepper currentPhase={autopilotPhase} />
              </div>
            ) : null}
            {selectedFile ? (
              <FileEditorTab
                fileName={selectedFile.path.split("/").pop() ?? selectedFile.path}
                filePath={selectedFile.path}
                fileContent={selectedFile.content}
                onSaveContent={(content) =>
                  saveFileContent({
                    path: selectedFile.path,
                    content,
                  })
                }
              />
            ) : (
              <MessageTimeline
                messages={timelineMessages}
                isStreaming={Boolean(streamingMessage)}
              />
            )}
          </div>

          <div className="w-[340px] flex-shrink-0 overflow-hidden">
            <div className="flex border-b border-border">
              {sideTabs.map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 px-3 py-2 text-sm capitalize ${
                    sideTab === tab
                      ? "bg-surface-2 text-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setSideTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="h-full overflow-y-auto p-3">
              {sideTab === "review" ? (
                reviewEvents.length > 0 ? (
                  <div className="space-y-2">
                    {reviewEvents.map((event) => (
                      <div key={event.id} className="rounded border border-border bg-surface-1 p-3">
                        <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {event.eventType.replace(".", " ")}
                        </div>
                        <pre className="whitespace-pre-wrap text-xs text-foreground">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Tool calls, permission requests, and mailbox events will appear here.
                  </div>
                )
              ) : null}

              {sideTab === "files" ? (
                <div className="space-y-1">
                  {fileTree.map((item) => (
                    <FileTreeItem
                      key={item.path}
                      item={toFileNode(item)}
                      onOpenFile={(_, path) => {
                        if (path) {
                          void openFile(path);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : null}

              {sideTab === "agents" ? <AgentsTab agents={agents} /> : null}

              {sideTab === "memory" ? (
                <MemoryTab
                  entries={memoryEntries}
                  tokenBudget={
                    memory?.tokenBudget ?? { total: 100_000, l0: 0, l1: 0, l2: 0 }
                  }
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-border p-3">
          <SessionComposer
            provider="opencode"
            session={{
              provider: "opencode",
              permission: "default",
              continueIn: "local",
              branch: "main",
            }}
            onSubmit={async (payload) => {
              if (!activeSession) {
                return;
              }

              await request(`/api/v1/sessions/${activeSession.id}/messages`, {
                method: "POST",
                body: JSON.stringify({
                  content: payload.message,
                  taskType: "default",
                  reasoningMode: "auto",
                  reasoningEffort: payload.reasoningLevel,
                  agentId: payload.agentId,
                  modelId: payload.modelId,
                  planMode: payload.planMode,
                  attachments: payload.attachments.map((attachment) =>
                    attachment.type === "folder"
                      ? (() => {
                          const matchedNode = findFileNodeByPath(fileTree, attachment.path);
                          return {
                            type: "folder_ref",
                            name: attachment.name,
                            path: attachment.path,
                            itemCount:
                              attachment.itemCount ??
                              (matchedNode ? countTreeItems(matchedNode) : 0),
                            truncated: attachment.truncated ?? false,
                            inferredTypes:
                              attachment.inferredTypes && attachment.inferredTypes.length > 0
                                ? attachment.inferredTypes
                                : matchedNode
                                  ? inferTypes(matchedNode)
                                  : [],
                          };
                        })()
                      : {
                          type: "file_ref",
                          name: attachment.name,
                          path: attachment.path,
                          status: "preview",
                        },
                  ),
                }),
              });
              await refreshSessions();
            }}
          />
          <div className="mt-2 flex justify-end">
            <Button
              variant="outline"
              onClick={async () => {
                if (!terminalSessionId) {
                  return;
                }
                await request(`/api/v1/terminal/sessions/${terminalSessionId}/input`, {
                  method: "POST",
                  body: JSON.stringify({ data: "workspace-terminal\n" }),
                });
              }}
            >
              Send to Terminal
            </Button>
          </div>
        </div>

        <div className="border-t border-border bg-surface-1 p-3">
          <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Terminal
          </div>
          <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap text-xs text-foreground">
            {terminalOutput.map((event) => event.data).join("")}
          </pre>
        </div>
      </div>
    </div>
  );
}
