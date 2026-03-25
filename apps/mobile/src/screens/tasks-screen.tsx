import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Switch, Text, TextInput, View } from "react-native";

import { useAmoenaTranslation } from "@lunaria/i18n";
import { useTasks } from "@/runtime/hooks/use-tasks";
import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";

export function TasksScreen({ sessionId }: { sessionId: string }) {
  const { t } = useAmoenaTranslation();
  const { data: tasks, isLoading, refresh, createTask, updateTask, deleteTask } = useTasks(sessionId);
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    void createTask(newTitle.trim());
    setNewTitle("");
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
      <Text selectable style={styles.screenTitle}>{t("mobile.tasks")}</Text>

      <View style={[styles.card, { flexDirection: "row", gap: tokens.spacing2 }]}>
        <TextInput
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder={t("mobile.addTaskPlaceholder")}
          placeholderTextColor={tokens.colorTextTertiary}
          accessibilityLabel={t("mobile.addTaskPlaceholder")}
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
        <Text style={styles.mutedText}>{t("mobile.loadingTasks")}</Text>
      ) : tasks.length === 0 ? (
        <Text style={styles.mutedText}>{t("mobile.noTasksYet")}</Text>
      ) : null}

      {tasks.map((task) => (
        <View key={task.id} style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: tokens.spacing3 }}>
            <Switch
              value={task.status === "completed"}
              onValueChange={(checked) =>
                void updateTask(task.id, { status: checked ? "completed" : "pending" })
              }
              trackColor={{ true: tokens.colorSuccess, false: tokens.colorSurface3 }}
              accessibilityLabel={task.title}
            />
            <View style={{ flex: 1 }}>
              <Text
                selectable
                style={[
                  styles.sessionName,
                  task.status === "completed" && {
                    textDecorationLine: "line-through",
                    color: tokens.colorTextTertiary,
                  },
                ]}
              >
                {task.title}
              </Text>
              {task.description ? (
                <Text selectable style={styles.mutedText}>{task.description}</Text>
              ) : null}
            </View>
            <Pressable
              onPress={() => void deleteTask(task.id)}
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
