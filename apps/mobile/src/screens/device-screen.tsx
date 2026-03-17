import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { useLunariaTranslation } from "@lunaria/i18n";
import { useClient } from "@/runtime/client-context";
import { styles } from "@/theme/styles";
import type { RemoteDeviceSelf } from "@lunaria/runtime-client";

export function DeviceScreen() {
  const { t } = useLunariaTranslation();
  const { client, auth, clearPairing } = useClient();
  const [device, setDevice] = useState<RemoteDeviceSelf | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) {
      setIsLoading(false);
      return;
    }
    void client.remoteDeviceMe().then((d) => {
      setDevice(d);
      setIsLoading(false);
    });
  }, [client]);

  const handleUnpair = () => {
    Alert.alert(t("mobile.unpairDevice"), t("mobile.confirmUnpair"), [
      { text: t("mobile.cancel"), style: "cancel" },
      { text: t("mobile.unpairDevice"), style: "destructive", onPress: () => void clearPairing() },
    ]);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
    >
      <Text selectable style={styles.screenTitle}>{t("mobile.device")}</Text>

      {isLoading ? (
        <Text style={styles.mutedText}>{t("mobile.loadingDevice")}</Text>
      ) : !device ? (
        <Text style={styles.mutedText}>{t("mobile.notPaired")}</Text>
      ) : (
        <View style={styles.card}>
          <Text selectable style={styles.cardTitle}>{t("mobile.currentDevice")}</Text>
          <Text selectable style={styles.mutedText}>{t("mobile.id")}: {device.deviceId}</Text>
          {device.platform ? (
            <Text selectable style={styles.mutedText}>{t("mobile.platform")}: {device.platform}</Text>
          ) : null}
          {device.deviceType ? (
            <Text selectable style={styles.mutedText}>{t("mobile.type")}: {device.deviceType}</Text>
          ) : null}
          <Text selectable style={styles.mutedText}>
            {t("mobile.scopes")}: {device.scopes.join(", ") || "none"}
          </Text>
          {device.pairedAt ? (
            <Text selectable style={styles.mutedText}>
              {t("mobile.paired")}: {new Date(device.pairedAt).toLocaleString()}
            </Text>
          ) : null}
          {auth ? (
            <Text selectable style={styles.mutedText}>
              {t("mobile.server")}: {auth.baseUrl}
            </Text>
          ) : null}
        </View>
      )}

      <Pressable
        onPress={handleUnpair}
        style={styles.denyButton}
        accessibilityRole="button"
        accessibilityLabel={t("mobile.unpairDevice")}
      >
        <Text style={styles.denyButtonText}>{t("mobile.unpairDevice")}</Text>
      </Pressable>
    </ScrollView>
  );
}
