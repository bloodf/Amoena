import { Stack } from "expo-router";

import { MoreScreen } from "@/screens/more-screen";

export default function MoreTab() {
  return (
    <>
      <Stack.Screen options={{ title: "More" }} />
      <MoreScreen />
    </>
  );
}
