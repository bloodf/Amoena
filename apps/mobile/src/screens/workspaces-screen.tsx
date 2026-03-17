import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { useLunariaTranslation } from "@lunaria/i18n";
import { useWorkspaces } from "@/runtime/hooks/use-workspaces";
import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";

export function WorkspacesScreen() {
  const { t } = useLunariaTranslation();
  const { data: workspaces, isLoading, refresh, archive, destroy } = useWorkspaces();

  const handleDestroy = (id: string, name: string) => {
    Alert.alert(t("mobile.destroyWorkspace"), t("mobile.confirmDestroy", { name }), [
      { text: t("mobile.cancel"), style: "cancel" },
      { text: t("mobile.destroy"), style: "destructive", onPress: () => void destroy(id) },
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
      <Text selectable style={styles.screenTitle}>{t("mobile.workspaces")}</Text>

      {isLoading ? (
        <Text style={styles.mutedText}>{t("mobile.loadingWorkspaces")}</Text>
      ) : workspaces.length === 0 ? (
        <Text style={styles.mutedText}>{t("mobile.noWorkspaces")}</Text>
      ) : null}

      {workspaces.map((ws) => (
        <View key={ws.id} style={styles.card}>
          <Text selectable style={styles.sessionName}>{ws.name}</Text>
          <Text selectable style={styles.mutedText}>
            {ws.rootPath}{ws.branchName ? ` · ${ws.branchName}` : ""}
          </Text>
          <Text selectable style={styles.mutedText}>
            {ws.status} · Created {new Date(ws.createdAt).toLocaleDateString()}
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => void archive(ws.id)}
              style={[styles.secondaryButton, { flex: 1 }]}
              accessibilityRole="button"
              accessibilityLabel={t("mobile.archive")}
            >
              <Text style={styles.secondaryButtonText}>{t("mobile.archive")}</Text>
            </Pressable>
            <Pressable
              onPress={() => handleDestroy(ws.id, ws.name)}
              style={[styles.denyButton, { flex: 1 }]}
              accessibilityRole="button"
              accessibilityLabel={t("mobile.destroy")}
            >
              <Text style={styles.denyButtonText}>{t("mobile.destroy")}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
