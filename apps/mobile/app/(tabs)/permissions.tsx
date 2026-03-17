import { Stack } from "expo-router";

import { MobilePermissionsScreen } from "@/screens/permissions-screen";

export default function PermissionsTab() {
  return (
    <>
      <Stack.Screen options={{ title: "Permissions" }} />
      <MobilePermissionsScreen />
    </>
  );
}
