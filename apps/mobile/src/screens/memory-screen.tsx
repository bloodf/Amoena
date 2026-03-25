import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useAmoenaTranslation } from "@lunaria/i18n";
import { useSessionMemory } from "@/runtime/hooks/use-memory";
import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";

export function MemoryScreen({ sessionId }: { sessionId: string }) {
  const { t } = useAmoenaTranslation();
  const { data: memory, isLoading, refresh } = useSessionMemory(sessionId);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => void refresh()}
          tintColor={tokens.colorPrimary}
        />
      }
    >
      <Text selectable style={styles.screenTitle}>{t("mobile.memory")}</Text>

      {memory?.tokenBudget ? (
        <View style={styles.card}>
          <Text selectable style={styles.cardTitle}>{t("mobile.tokenBudget")}</Text>
          <Text selectable style={styles.mutedText}>
            Total: {memory.tokenBudget.total} · L0: {memory.tokenBudget.l0} · L1: {memory.tokenBudget.l1} · L2: {memory.tokenBudget.l2}
          </Text>
        </View>
      ) : null}

      {isLoading ? (
        <Text style={styles.mutedText}>{t("mobile.loadingMemory")}</Text>
      ) : !memory || memory.entries.length === 0 ? (
        <Text style={styles.mutedText}>{t("mobile.noMemoryEntries")}</Text>
      ) : null}

      {memory?.entries.map((entry) => {
        const isExpanded = expandedIds.has(entry.id);
        return (
          <Pressable
            key={entry.id}
            onPress={() => toggleExpanded(entry.id)}
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel={entry.title}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text selectable style={styles.sessionName}>{entry.title}</Text>
                <Text selectable style={styles.mutedText}>
                  {entry.category} · {entry.observationType}
                </Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{entry.l0Tokens}t</Text>
              </View>
            </View>

            <Text selectable style={styles.bodyText}>{entry.l0Summary}</Text>

            {isExpanded ? (
              <View style={{ gap: tokens.spacing2, marginTop: tokens.spacing2, paddingTop: tokens.spacing2, borderTopWidth: 1, borderTopColor: tokens.colorBorder }}>
                <Text selectable style={[styles.mutedText, { fontWeight: "600" }]}>{t("mobile.l1Summary")}</Text>
                <Text selectable style={styles.bodyText}>{entry.l1Summary}</Text>
                <Text selectable style={[styles.mutedText, { fontWeight: "600" }]}>{t("mobile.l2Content")}</Text>
                <Text selectable style={styles.bodyText}>{entry.l2Content}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
