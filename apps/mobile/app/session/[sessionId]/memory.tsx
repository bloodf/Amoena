import { useLocalSearchParams } from "expo-router";

import { MemoryScreen } from "@/screens/memory-screen";

export default function MemoryRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <MemoryScreen sessionId={sessionId} />;
}
