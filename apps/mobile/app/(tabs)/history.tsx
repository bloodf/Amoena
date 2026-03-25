import { Stack } from "expo-router";

import { HistoryScreen } from "@/screens/history-screen";

export default function HistoryTab() {
  return (
    <>
      <Stack.Screen options={{ title: "History" }} />
      <HistoryScreen />
    </>
  );
}
