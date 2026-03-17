import { ScrollView, Text } from "react-native";

import { useLunariaTranslation } from "@lunaria/i18n";
import { styles } from "@/theme/styles";

export function SettingsScreen() {
  const { t } = useLunariaTranslation();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
    >
      <Text selectable style={styles.screenTitle}>{t("mobile.settings")}</Text>
      <Text selectable style={styles.mutedText}>
        {t("mobile.settingsPlaceholder")}
      </Text>
    </ScrollView>
  );
}
