import { Stack } from "expo-router";

import { MobileHomeScreen } from "@/screens/home-screen";

export default function PairRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Pair with Desktop" }} />
      <MobileHomeScreen />
    </>
  );
}
