import { useLocalSearchParams } from "expo-router";

import { MobileSessionScreen } from "@/screens/session-screen";

export default function SessionRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <MobileSessionScreen sessionId={sessionId} />;
}
