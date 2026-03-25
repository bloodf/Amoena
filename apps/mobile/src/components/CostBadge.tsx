/**
 * Real-time cost display badge with color coding.
 *
 * - Green:  < $0.10
 * - Yellow: < $1.00
 * - Red:    >= $1.00
 */

import { Text, View, StyleSheet } from "react-native";

import { tokens } from "@/theme/tokens";

type CostBadgeProps = {
  readonly costUsd: number;
  readonly compact?: boolean;
};

function getCostColor(cost: number): { bg: string; fg: string } {
  if (cost < 0.1) {
    return { bg: tokens.colorSuccess, fg: tokens.colorSuccessForeground };
  }
  if (cost < 1.0) {
    return { bg: tokens.colorWarning ?? "#F59E0B", fg: "#422006" };
  }
  return { bg: tokens.colorDestructive, fg: tokens.colorDestructiveForeground };
}

function formatCost(cost: number, compact: boolean): string {
  if (compact) {
    if (cost < 0.01) return "<1c";
    if (cost < 1.0) return `${Math.round(cost * 100)}c`;
    return `$${cost.toFixed(2)}`;
  }
  return `$${cost.toFixed(4)}`;
}

export function CostBadge({ costUsd, compact = false }: CostBadgeProps) {
  const { bg, fg } = getCostColor(costUsd);

  return (
    <View style={[localStyles.badge, { backgroundColor: bg }]}>
      <Text style={[localStyles.text, { color: fg }]}>
        {formatCost(costUsd, compact)}
      </Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: tokens.spacing2_5,
    paddingVertical: tokens.spacing1_5,
    borderRadius: tokens.radiusFull,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: tokens.fontSizeXs,
    fontWeight: "700",
  },
});
