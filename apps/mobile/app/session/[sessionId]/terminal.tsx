import { useLocalSearchParams } from "expo-router";

import { TerminalScreen } from "@/screens/terminal-screen";

export default function TerminalRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  // Terminal uses sessionId as the terminal session ID for now
  return <TerminalScreen terminalSessionId={sessionId} />;
}
