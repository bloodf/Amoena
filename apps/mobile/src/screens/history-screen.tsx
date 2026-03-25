/**
 * History screen — Past runs with reports, searchable and filterable.
 *
 * Displays completed/failed/cancelled runs from the cache and server,
 * with a search bar for filtering by description.
 */

import { useCallback, useMemo, useState } from "react";
import { router } from "expo-router";
import { RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { useRuntime } from "@/runtime/provider";
import { RunCard } from "@/components/RunCard";
import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";

type StatusFilter = "all" | "running" | "completed" | "failed";

const FILTER_OPTIONS: readonly { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "running", label: "Running" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
];

export function HistoryScreen() {
  const { sessions, refreshSessions, auth } = useRuntime();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Map sessions to run-like records for display
  const runs = useMemo(() => {
    return sessions.map((session) => ({
      goalId: session.id,
      description: session.workingDir.split("/").pop() || session.id,
      status: mapSessionStatus(session.status),
      startedAt: session.startedAt ? new Date(session.startedAt).getTime() : Date.now(),
      completedAt: session.completedAt ? new Date(session.completedAt).getTime() : undefined,
      totalCostUsd: session.metadata?.totalCostUsd as number | undefined,
      taskCount: session.metadata?.taskCount as number | undefined,
    }));
  }, [sessions]);

  const filteredRuns = useMemo(() => {
    let result = runs;

    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.description.toLowerCase().includes(q));
    }

    // Sort by most recent first
    return [...result].sort((a, b) => b.startedAt - a.startedAt);
  }, [runs, statusFilter, search]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshSessions();
    setRefreshing(false);
  }, [refreshSessions]);

  if (!auth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: tokens.colorBackground, padding: tokens.spacing6 }}>
        <Text style={[styles.screenTitle, { textAlign: "center" }]}>Not Connected</Text>
        <Text style={[styles.mutedText, { textAlign: "center", marginTop: tokens.spacing2 }]}>
          Pair with a desktop instance to view run history.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={tokens.colorTextSecondary} />
      }
    >
      <Text style={styles.screenTitle}>History</Text>

      {/* Search */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search runs..."
        placeholderTextColor={tokens.colorTextTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      {/* Filter chips */}
      <View style={chipRow}>
        {FILTER_OPTIONS.map((opt) => (
          <View key={opt.key}>
            <Text
              onPress={() => setStatusFilter(opt.key)}
              style={[
                chipText,
                statusFilter === opt.key ? chipActive : chipInactive,
              ]}
            >
              {opt.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Run list */}
      {filteredRuns.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.mutedText}>
            {search || statusFilter !== "all"
              ? "No runs match your filters."
              : "No run history yet."}
          </Text>
        </View>
      ) : (
        filteredRuns.map((run) => (
          <RunCard
            key={run.goalId}
            goalId={run.goalId}
            description={run.description}
            status={run.status}
            startedAt={run.startedAt}
            completedAt={run.completedAt}
            totalCostUsd={run.totalCostUsd}
            taskCount={run.taskCount}
            onPress={() => router.push(`/session/${run.goalId}`)}
          />
        ))
      )}
    </ScrollView>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapSessionStatus(
  status: string,
): "running" | "completed" | "partial_failure" | "failed" | "cancelled" {
  switch (status) {
    case "active":
    case "running":
      return "running";
    case "completed":
    case "done":
      return "completed";
    case "failed":
    case "error":
      return "failed";
    case "cancelled":
      return "cancelled";
    default:
      return "completed";
  }
}

// ─── Local styles ────────────────────────────────────────────────────────────

const chipRow = {
  flexDirection: "row" as const,
  gap: tokens.spacing2,
  flexWrap: "wrap" as const,
};

const chipText = {
  paddingHorizontal: tokens.spacing3,
  paddingVertical: tokens.spacing2,
  borderRadius: tokens.radiusFull,
  fontSize: tokens.fontSizeSm,
  fontWeight: "600" as const,
  overflow: "hidden" as const,
};

const chipActive = {
  backgroundColor: tokens.colorPrimary,
  color: tokens.colorPrimaryForeground,
};

const chipInactive = {
  backgroundColor: tokens.colorSurface2,
  color: tokens.colorTextSecondary,
};
