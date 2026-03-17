import { useLocalSearchParams } from "expo-router";

import { QueueScreen } from "@/screens/queue-screen";

export default function QueueRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <QueueScreen sessionId={sessionId} />;
}
