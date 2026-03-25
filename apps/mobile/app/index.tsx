import { Stack } from "expo-router";

import { MobileHomeScreen } from "@/screens/home-screen";

export default function HomeRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Amoena Remote" }} />
      <MobileHomeScreen />
    </>
  );
}
