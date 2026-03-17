import { useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { useLunariaTranslation } from "@lunaria/i18n";
import { useQueue } from "@/runtime/hooks/use-queue";
import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";

export function QueueScreen({ sessionId }: { sessionId: string }) {
  const { t } = useLunariaTranslation();
  const { data: messages, isLoading, refresh, enqueue, removeMessage, flush } = useQueue(sessionId);
  const [newContent, setNewContent] = useState("");

  const handleAdd = () => {
    if (!newContent.trim()) return;
    void enqueue(newContent.trim());
    setNewContent("");
  };

  const handleFlush = () => {
    Alert.alert(t("mobile.flushQueue"), t("mobile.flushQueueConfirm"), [
      { text: t("mobile.cancel"), style: "cancel" },
      { text: t("mobile.flush"), style: "destructive", onPress: () => void flush() },
    ]);
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
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text selectable style={styles.screenTitle}>{t("mobile.messageQueue")}</Text>
        {messages.length > 0 ? (
          <Pressable
            onPress={handleFlush}
            style={styles.secondaryButton}
            accessibilityRole="button"
            accessibilityLabel={t("mobile.flush")}
          >
            <Text style={[styles.secondaryButtonText, { color: tokens.colorDestructive }]}>{t("mobile.flush")}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.card, { flexDirection: "row", gap: tokens.spacing2 }]}>
        <TextInput
          value={newContent}
          onChangeText={setNewContent}
          placeholder={t("mobile.addToQueuePlaceholder")}
          placeholderTextColor={tokens.colorTextTertiary}
          accessibilityLabel={t("mobile.addToQueuePlaceholder")}
          style={[styles.input, { flex: 1 }]}
          onSubmitEditing={handleAdd}
        />
        <Pressable
          onPress={handleAdd}
          style={[styles.primaryButton, { paddingHorizontal: tokens.spacing4 }]}
          accessibilityRole="button"
          accessibilityLabel={t("mobile.add")}
        >
          <Text style={styles.primaryButtonText}>{t("mobile.add")}</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <Text style={styles.mutedText}>{t("mobile.loadingQueue")}</Text>
      ) : messages.length === 0 ? (
        <Text style={styles.mutedText}>{t("mobile.noQueueMessages")}</Text>
      ) : null}

      {messages.map((msg) => (
        <View key={msg.id} style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text selectable style={styles.bodyText}>{msg.content}</Text>
              <Text selectable style={styles.mutedText}>
                {msg.status} · #{msg.orderIndex}
              </Text>
            </View>
            <Pressable
              onPress={() => void removeMessage(msg.id)}
              accessibilityRole="button"
              accessibilityLabel={t("mobile.deleteSession")}
            >
              <Text style={{ color: tokens.colorDestructive, fontSize: tokens.fontSizeSm }}>✕</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
