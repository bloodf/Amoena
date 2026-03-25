import { Alert, Pressable, RefreshControl, ScrollView, Switch, Text, View } from "react-native";

import { useAmoenaTranslation } from "@lunaria/i18n";
import { useExtensions } from "@/runtime/hooks/use-extensions";
import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";

export function ExtensionsScreen() {
  const { t } = useAmoenaTranslation();
  const { data: extensions, isLoading, refresh, toggle, uninstall } = useExtensions();

  const handleUninstall = (id: string, name: string) => {
    Alert.alert(t("mobile.uninstallExtension"), t("mobile.confirmUninstall", { name }), [
      { text: t("mobile.cancel"), style: "cancel" },
      { text: t("mobile.uninstall"), style: "destructive", onPress: () => void uninstall(id) },
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
      <Text selectable style={styles.screenTitle}>{t("mobile.extensions")}</Text>

      {isLoading ? (
        <Text style={styles.mutedText}>{t("mobile.loadingExtensions")}</Text>
      ) : extensions.length === 0 ? (
        <Text style={styles.mutedText}>{t("mobile.noExtensions")}</Text>
      ) : null}

      {extensions.map((ext) => (
        <View key={ext.id} style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text selectable style={styles.sessionName}>{ext.name}</Text>
              <Text selectable style={styles.mutedText}>
                v{ext.version}{ext.publisher ? ` · ${ext.publisher}` : ""}
              </Text>
            </View>
            <Switch
              value={ext.enabled}
              onValueChange={(enabled) => void toggle(ext.id, enabled)}
              trackColor={{ true: tokens.colorSuccess, false: tokens.colorSurface3 }}
              accessibilityLabel={ext.name}
            />
          </View>
          <Text selectable style={styles.bodyText}>{ext.description}</Text>
          <Pressable
            onPress={() => handleUninstall(ext.id, ext.name)}
            accessibilityRole="button"
            accessibilityLabel={t("mobile.uninstall")}
          >
            <Text style={{ color: tokens.colorDestructive, fontSize: tokens.fontSizeSm }}>{t("mobile.uninstall")}</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
