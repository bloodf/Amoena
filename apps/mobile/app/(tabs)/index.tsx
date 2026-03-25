import { Stack } from "expo-router";

import { MobileHomeScreen } from "@/screens/home-screen";

export default function SessionsTab() {
  return (
    <>
      <Stack.Screen options={{ title: "Amoena Remote" }} />
      <MobileHomeScreen />
    </>
  );
}
