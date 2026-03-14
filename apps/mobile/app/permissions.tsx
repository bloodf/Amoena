import { Stack } from "expo-router";

import { MobilePermissionsScreen } from "@/screens/permissions-screen";

export default function PermissionsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: "Permissions" }} />
      <MobilePermissionsScreen />
    </>
  );
}
