import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";

import { useLunariaTranslation } from "@lunaria/i18n";
import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";

const menuItems = [
  { key: "workspaces", route: "/workspaces", icon: "📁" },
  { key: "extensions", route: "/extensions", icon: "🧩" },
  { key: "settings", route: "/settings", icon: "⚙️" },
  { key: "device", route: "/device", icon: "📱" },
] as const;

export function MoreScreen() {
  const { t } = useLunariaTranslation();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
    >
      <Text selectable style={styles.screenTitle}>
        {t("mobile.more")}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: tokens.spacing3 }}>
        {menuItems.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.route as any)}
            style={[
              styles.card,
              { width: "47%", alignItems: "center", paddingVertical: tokens.spacing6 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t(`mobile.${item.key}` as any)}
          >
            <Text style={{ fontSize: 32 }}>{item.icon}</Text>
            <Text style={styles.cardTitle}>{t(`mobile.${item.key}` as any)}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
