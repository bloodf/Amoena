/**
 * Compact agent status card showing name, status icon, current task, and cost.
 */

import { Text, View, StyleSheet } from "react-native";

import { CostBadge } from "./CostBadge";
import { tokens } from "@/theme/tokens";

type AgentStatus = "idle" | "running" | "completed" | "failed" | "queued";

type AgentCardProps = {
  readonly name: string;
  readonly status: AgentStatus;
  readonly currentTask?: string;
  readonly costUsd?: number;
  readonly model?: string;
};

const STATUS_ICONS: Record<AgentStatus, string> = {
  idle: "~",
  running: ">",
  completed: "+",
  failed: "x",
  queued: "...",
};

const STATUS_COLORS: Record<AgentStatus, string> = {
  idle: tokens.colorTextTertiary,
  running: tokens.colorPrimary,
  completed: tokens.colorSuccess,
  failed: tokens.colorDestructive,
  queued: tokens.colorTextSecondary,
};

export function AgentCard({
  name,
  status,
  currentTask,
  costUsd,
  model,
}: AgentCardProps) {
  return (
    <View style={localStyles.card}>
      <View style={localStyles.headerRow}>
        <View style={localStyles.statusRow}>
          <Text
            style={[localStyles.statusIcon, { color: STATUS_COLORS[status] }]}
          >
            {STATUS_ICONS[status]}
          </Text>
          <Text style={localStyles.name} numberOfLines={1}>
            {name}
          </Text>
        </View>
        {costUsd !== undefined && costUsd > 0 && (
          <CostBadge costUsd={costUsd} compact />
        )}
      </View>
      {model && (
        <Text style={localStyles.model} numberOfLines={1}>
          {model}
        </Text>
      )}
      {currentTask && (
        <Text style={localStyles.task} numberOfLines={2}>
          {currentTask}
        </Text>
      )}
      <Text style={localStyles.statusLabel}>{status}</Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  card: {
    borderRadius: tokens.radius2xl,
    padding: tokens.spacing3,
    backgroundColor: tokens.colorSurface2,
    borderWidth: tokens.borderWidth,
    borderColor: tokens.colorBorder,
    gap: tokens.spacing1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing2,
    flex: 1,
  },
  statusIcon: {
    fontSize: tokens.fontSizeSm,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  name: {
    color: tokens.colorTextPrimary,
    fontSize: tokens.fontSizeSm,
    fontWeight: "600",
    flex: 1,
  },
  model: {
    color: tokens.colorTextTertiary,
    fontSize: tokens.fontSizeXs,
    paddingLeft: tokens.spacing5,
  },
  task: {
    color: tokens.colorTextSecondary,
    fontSize: tokens.fontSizeXs,
    paddingLeft: tokens.spacing5,
    lineHeight: tokens.lineHeightXs ?? 16,
  },
  statusLabel: {
    color: tokens.colorTextTertiary,
    fontSize: tokens.fontSizeXs,
    paddingLeft: tokens.spacing5,
    textTransform: "capitalize",
  },
});
