import { useLocalSearchParams } from "expo-router";

import { AgentsScreen } from "@/screens/agents-screen";

export default function AgentsRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <AgentsScreen sessionId={sessionId} />;
}
