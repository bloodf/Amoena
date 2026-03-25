/**
 * Settings screen — Paired devices, notification preferences, theme toggle.
 */

import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";

import { useAmoenaTranslation } from "@lunaria/i18n";
import { useRuntime } from "@/runtime/provider";
import {
  loadPreferences,
  savePreferences,
  type AppPreferences,
} from "@/lib/storage";
import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";

export function SettingsScreen() {
  const { t } = useAmoenaTranslation();
  const { auth, clearPairing } = useRuntime();
  const [preferences, setPreferences] = useState<AppPreferences>({
    notificationsEnabled: true,
    darkMode: true,
    costAlertThreshold: 1.0,
  });

  useEffect(() => {
    void loadPreferences().then(setPreferences);
  }, []);

  const updatePreference = useCallback(
    async <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);
      await savePreferences(updated);
    },
    [preferences],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.screenTitle}>{t("mobile.settings")}</Text>

      {/* Paired Devices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paired Device</Text>
        {auth ? (
          <View style={{ gap: tokens.spacing2 }}>
            <View style={deviceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bodyText}>{auth.deviceId}</Text>
                <Text style={styles.mutedText} numberOfLines={1}>{auth.baseUrl}</Text>
              </View>
              <View style={connectedBadge}>
                <Text style={connectedBadgeText}>Connected</Text>
              </View>
            </View>
            <Pressable
              onPress={() => void clearPairing()}
              style={styles.secondaryButton}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Forget device</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.mutedText}>
            No device paired. Go to the Home tab to pair with a desktop instance.
          </Text>
        )}
      </View>

      {/* Notification Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <SettingToggle
          label="Push notifications"
          description="Get notified when a run needs approval or completes"
          value={preferences.notificationsEnabled}
          onToggle={(v) => void updatePreference("notificationsEnabled", v)}
        />
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>

        <SettingToggle
          label="Dark mode"
          description="Use dark color scheme throughout the app"
          value={preferences.darkMode}
          onToggle={(v) => void updatePreference("darkMode", v)}
        />
      </View>

      {/* Cost Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cost Alerts</Text>
        <Text style={styles.descriptionText}>
          Current threshold: ${preferences.costAlertThreshold.toFixed(2)}
        </Text>
        <View style={{ flexDirection: "row", gap: tokens.spacing2 }}>
          {[0.1, 0.5, 1.0, 5.0].map((threshold) => (
            <Pressable
              key={threshold}
              onPress={() => void updatePreference("costAlertThreshold", threshold)}
              style={[
                thresholdChip,
                preferences.costAlertThreshold === threshold
                  ? thresholdChipActive
                  : thresholdChipInactive,
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  thresholdChipText,
                  preferences.costAlertThreshold === threshold
                    ? thresholdChipTextActive
                    : thresholdChipTextInactive,
                ]}
              >
                ${threshold}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.mutedText}>Amoena Mobile v0.0.1</Text>
        <Text style={styles.mutedText}>Companion app for Amoena Desktop</Text>
      </View>
    </ScrollView>
  );
}

// ─── Toggle Row ──────────────────────────────────────────────────────────────

function SettingToggle({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <View style={toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.bodyText}>{label}</Text>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: tokens.colorSurface3, true: tokens.colorPrimary }}
        thumbColor={tokens.colorTextPrimary}
      />
    </View>
  );
}

// ─── Local styles ────────────────────────────────────────────────────────────

const deviceRow = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: tokens.spacing3,
};

const connectedBadge = {
  backgroundColor: tokens.colorSuccess + "20",
  paddingHorizontal: tokens.spacing2_5,
  paddingVertical: tokens.spacing1_5,
  borderRadius: tokens.radiusFull,
};

const connectedBadgeText = {
  color: tokens.colorSuccess,
  fontSize: tokens.fontSizeXs,
  fontWeight: "700" as const,
};

const toggleRow = {
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  gap: tokens.spacing3,
};

const thresholdChip = {
  paddingHorizontal: tokens.spacing3,
  paddingVertical: tokens.spacing2,
  borderRadius: tokens.radiusFull,
};

const thresholdChipActive = {
  backgroundColor: tokens.colorPrimary,
};

const thresholdChipInactive = {
  backgroundColor: tokens.colorSurface2,
};

const thresholdChipText = {
  fontSize: tokens.fontSizeSm,
  fontWeight: "600" as const,
};

const thresholdChipTextActive = {
  color: tokens.colorPrimaryForeground,
};

const thresholdChipTextInactive = {
  color: tokens.colorTextSecondary,
};
