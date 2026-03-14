import { ScrollView, Text, Pressable, View } from "react-native";

import { useRuntime } from "@/runtime/provider";

export function MobilePermissionsScreen() {
  const { pendingPermissions, resolvePermission } = useRuntime();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <Text selectable style={{ color: "white", fontSize: 28, fontWeight: "700" }}>
        Permission queue
      </Text>
      {pendingPermissions.length === 0 ? (
        <Text selectable style={{ color: "#94A3B8", fontSize: 15 }}>
          No pending desktop approvals.
        </Text>
      ) : null}
      {pendingPermissions.map((permission) => (
        <View
          key={permission.requestId}
          style={{
            gap: 12,
            padding: 16,
            borderRadius: 20,
            backgroundColor: "#0F172A",
            borderWidth: 1,
            borderColor: "#1E293B",
          }}
        >
          <Text selectable style={{ color: "white", fontSize: 17, fontWeight: "600" }}>
            {permission.message}
          </Text>
          <Text selectable style={{ color: "#94A3B8", fontSize: 13 }}>
            Session {permission.sessionId}
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={() => void resolvePermission(permission.sessionId, permission.requestId, "approve")}
              style={{
                flex: 1,
                alignItems: "center",
                backgroundColor: "#14532D",
                borderRadius: 14,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: "#DCFCE7", fontWeight: "700" }}>Approve</Text>
            </Pressable>
            <Pressable
              onPress={() => void resolvePermission(permission.sessionId, permission.requestId, "deny")}
              style={{
                flex: 1,
                alignItems: "center",
                backgroundColor: "#7F1D1D",
                borderRadius: 14,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: "#FEE2E2", fontWeight: "700" }}>Deny</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
