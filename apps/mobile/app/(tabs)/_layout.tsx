import { Tabs } from "expo-router";
import { Text } from "react-native";

import { usePermissions } from "@/runtime/hooks/use-permissions";
import { tokens } from "@/theme/tokens";

export default function TabLayout() {
  const { data: permissions } = usePermissions();
  const badgeCount = permissions.length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tokens.colorBackground,
          borderTopColor: tokens.colorBorder,
        },
        tabBarActiveTintColor: tokens.colorPrimary,
        tabBarInactiveTintColor: tokens.colorTextTertiary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Sessions",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚡</Text>,
        }}
      />
      <Tabs.Screen
        name="permissions"
        options={{
          title: "Permissions",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔐</Text>,
          tabBarBadge: badgeCount > 0 ? badgeCount : undefined,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⋯</Text>,
        }}
      />
    </Tabs>
  );
}
