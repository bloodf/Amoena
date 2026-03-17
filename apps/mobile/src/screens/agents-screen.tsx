import { RefreshControl, ScrollView, Text, View } from "react-native";

import { useLunariaTranslation } from "@lunaria/i18n";
import { useSessionAgents } from "@/runtime/hooks/use-session-agents";
import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";
import type { SessionAgent } from "@lunaria/runtime-client";

function AgentNode({ agent, allAgents, depth = 0 }: { agent: SessionAgent; allAgents: SessionAgent[]; depth?: number }) {
  const children = allAgents.filter((a) => a.parentAgentId === agent.id);

  return (
    <View style={{ marginLeft: depth * tokens.spacing4 }}>
      <View style={styles.agentCard}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text selectable style={styles.agentName}>{agent.agentType}</Text>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{agent.status}</Text>
          </View>
        </View>
        <Text selectable style={styles.mutedText}>
          {agent.model}{agent.division ? ` · ${agent.division}` : ""}
        </Text>
      </View>
      {children.map((child) => (
        <AgentNode key={child.id} agent={child} allAgents={allAgents} depth={depth + 1} />
      ))}
    </View>
  );
}

export function AgentsScreen({ sessionId }: { sessionId: string }) {
  const { t } = useLunariaTranslation();
  const { data: agents, isLoading, refresh } = useSessionAgents(sessionId);

  const rootAgents = agents.filter((a) => !a.parentAgentId);

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
      <Text selectable style={styles.screenTitle}>{t("mobile.agents")}</Text>

      {isLoading ? (
        <Text style={styles.mutedText}>{t("mobile.loadingAgents")}</Text>
      ) : agents.length === 0 ? (
        <Text style={styles.mutedText}>{t("mobile.noAgents")}</Text>
      ) : null}

      <View style={{ gap: tokens.spacing2 }}>
        {rootAgents.map((agent) => (
          <AgentNode key={agent.id} agent={agent} allAgents={agents} />
        ))}
      </View>
    </ScrollView>
  );
}
