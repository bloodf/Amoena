/**
 * Run Detail screen — Live agent monitoring for a specific goal run.
 *
 * Shows task DAG progress, per-agent output, cost tracking,
 * and a cancel action.
 */

import { useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useRuntime, useSessionAgents, useSessionMessages } from "@/runtime/provider";
import { AgentCard } from "@/components/AgentCard";
import { CostBadge } from "@/components/CostBadge";
import { TaskProgress } from "@/components/TaskProgress";
import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";

type RunDetailScreenProps = {
  readonly sessionId: string;
};

export function RunDetailScreen({ sessionId }: RunDetailScreenProps) {
  const { sessions, sendMessage } = useRuntime();
  const { agents, isLoading: agentsLoading } = useSessionAgents(sessionId);
  const { messages, isLoading: messagesLoading } = useSessionMessages(sessionId);
  const [refreshing, setRefreshing] = useState(false);

  const session = useMemo(
    () => sessions.find((s) => s.id === sessionId) ?? null,
    [sessionId, sessions],
  );

  // Derive task counts from agents for now (real DAG will come from MC events)
  const taskCounts = useMemo(() => {
    const counts = { completed: 0, running: 0, queued: 0, failed: 0 };
    for (const agent of agents) {
      switch (agent.status) {
        case "running":
        case "active":
          counts.running++;
          break;
        case "completed":
        case "done":
          counts.completed++;
          break;
        case "failed":
        case "error":
          counts.failed++;
          break;
        default:
          counts.queued++;
          break;
      }
    }
    return counts;
  }, [agents]);

  const totalCost = 0; // Will be populated from MC cost:update events

  function handleCancel() {
    Alert.alert(
      "Cancel Run",
      "Are you sure you want to cancel this run? This cannot be undone.",
      [
        { text: "Keep Running", style: "cancel" },
        {
          text: "Cancel Run",
          style: "destructive",
          onPress: () => void sendMessage(sessionId, "/cancel"),
        },
      ],
    );
  }

  async function handleRefresh() {
    setRefreshing(true);
    // The hooks auto-poll, but we can trigger a visual refresh
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tokens.colorTextSecondary} />
      }
    >
      {/* Header */}
      <View style={{ gap: tokens.spacing1 }}>
        <Text style={styles.screenTitle}>
          {session?.workingDir.split("/").pop() || "Run Details"}
        </Text>
        <Text style={styles.mutedText}>
          {session?.status ?? "loading"} {session?.tuiType ? `\u00B7 ${session.tuiType}` : ""}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={{ flexDirection: "row", gap: tokens.spacing3 }}>
        <View style={[styles.card, { flex: 1, alignItems: "center" }]}>
          <Text style={statValue}>{agents.length}</Text>
          <Text style={styles.mutedText}>Agents</Text>
        </View>
        <View style={[styles.card, { flex: 1, alignItems: "center" }]}>
          <Text style={statValue}>
            {taskCounts.completed + taskCounts.running + taskCounts.queued + taskCounts.failed}
          </Text>
          <Text style={styles.mutedText}>Tasks</Text>
        </View>
        <View style={[styles.card, { flex: 1, alignItems: "center" }]}>
          {totalCost > 0 ? (
            <CostBadge costUsd={totalCost} />
          ) : (
            <Text style={statValue}>--</Text>
          )}
          <Text style={styles.mutedText}>Cost</Text>
        </View>
      </View>

      {/* Task Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task Progress</Text>
        <TaskProgress counts={taskCounts} />
      </View>

      {/* Active Agents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agents</Text>
        {agentsLoading && agents.length === 0 ? (
          <Text style={styles.mutedText}>Loading agents...</Text>
        ) : agents.length === 0 ? (
          <Text style={styles.mutedText}>No agents active</Text>
        ) : (
          agents.map((agent) => (
            <AgentCard
              key={agent.id}
              name={agent.agentType}
              status={mapAgentStatus(agent.status)}
              model={agent.model}
              currentTask={agent.currentTask}
            />
          ))
        )}
      </View>

      {/* Recent Output */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Output</Text>
        {messagesLoading && messages.length === 0 ? (
          <Text style={styles.mutedText}>Loading messages...</Text>
        ) : messages.length === 0 ? (
          <Text style={styles.mutedText}>No messages yet</Text>
        ) : (
          messages.slice(-10).map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === "user" ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <Text style={styles.messageRole}>{message.role}</Text>
              <Text style={styles.messageContent} numberOfLines={6}>
                {message.content}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Cancel Action */}
      {(session?.status === "active" || session?.status === "running") && (
        <Pressable
          onPress={handleCancel}
          style={styles.denyButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel this run"
        >
          <Text style={styles.denyButtonText}>Cancel Run</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapAgentStatus(
  status: string,
): "idle" | "running" | "completed" | "failed" | "queued" {
  switch (status) {
    case "running":
    case "active":
      return "running";
    case "completed":
    case "done":
      return "completed";
    case "failed":
    case "error":
      return "failed";
    case "queued":
    case "pending":
      return "queued";
    default:
      return "idle";
  }
}

const statValue = {
  color: tokens.colorTextPrimary,
  fontSize: tokens.fontSize2xl,
  fontWeight: "700" as const,
};
