import { useCallback, useEffect, useRef, useState } from "react";

import type { TaskRecord } from "@lunaria/runtime-client";

import { useClient } from "../client-context";
import { createReconnectingEventSource } from "../event-source";

export function useTasks(sessionId: string) {
  const { auth, client } = useClient();
  const [data, setData] = useState<TaskRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const esRef = useRef<ReturnType<typeof createReconnectingEventSource> | null>(null);

  const refresh = useCallback(async () => {
    if (!client) return;
    try {
      setIsLoading(true);
      const tasks = await client.listTasks(sessionId);
      setData(tasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [client, sessionId]);

  useEffect(() => {
    if (!client || !auth) {
      setData([]);
      setIsLoading(false);
      return;
    }

    void refresh();

    esRef.current = createReconnectingEventSource(
      client.sessionEventsUrl(sessionId, auth.accessToken),
      {
        eventNames: ["task.created", "task.updated", "task.deleted"],
        onEvent: () => {
          void refresh();
        },
      },
    );

    return () => {
      esRef.current?.close();
    };
  }, [auth, client, sessionId, refresh]);

  const createTask = useCallback(
    async (title: string, description?: string) => {
      if (!client) return;
      try {
        await client.createTask(sessionId, { title, description });
        void refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create task");
      }
    },
    [client, sessionId, refresh],
  );

  const updateTask = useCallback(
    async (taskId: string, updates: { status?: string; title?: string }) => {
      if (!client) return;
      try {
        await client.updateTask(sessionId, taskId, updates);
        void refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update task");
      }
    },
    [client, sessionId, refresh],
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!client) return;
      try {
        await client.deleteTask(sessionId, taskId);
        void refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete task");
      }
    },
    [client, sessionId, refresh],
  );

  return { data, error, isLoading, refresh, createTask, updateTask, deleteTask };
}
