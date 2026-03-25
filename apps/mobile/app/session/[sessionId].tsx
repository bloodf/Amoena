import { useLocalSearchParams } from "expo-router";

import { RunDetailScreen } from "@/screens/run-detail-screen";

export default function SessionRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <RunDetailScreen sessionId={sessionId} />;
}
