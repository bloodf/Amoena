import { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";

import { useLunariaTranslation } from "@lunaria/i18n";
import { useTerminalEvents } from "@/runtime/hooks/use-terminal-events";
import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";

export function TerminalScreen({ terminalSessionId }: { terminalSessionId: string }) {
  const { t } = useLunariaTranslation();
  const { data: events, isLoading } = useTerminalEvents(terminalSessionId);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [events.length]);

  const output = events.map((e) => e.data).join("");

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: tokens.spacing4, paddingBottom: tokens.spacing2 }}>
        <Text selectable style={styles.screenTitle}>{t("mobile.terminal")}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: tokens.colorSurface0, margin: tokens.spacing3, borderRadius: tokens.radiusLg }}
        contentContainerStyle={{ padding: tokens.spacing3 }}
      >
        {isLoading ? (
          <Text style={styles.mutedText}>{t("mobile.loadingTerminal")}</Text>
        ) : output.length === 0 ? (
          <Text style={styles.mutedText}>{t("mobile.noTerminalOutput")}</Text>
        ) : (
          <Text
            selectable
            style={{
              fontFamily: tokens.fontFamilyMono,
              fontSize: tokens.fontSizeXs,
              lineHeight: tokens.lineHeightXs,
              color: tokens.colorTextPrimary,
            }}
          >
            {output}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
