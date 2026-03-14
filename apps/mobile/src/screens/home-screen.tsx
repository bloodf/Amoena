import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useRuntime } from "@/runtime/provider";

export function MobileHomeScreen() {
  const {
    auth,
    isHydrated,
    pendingPermissions,
    pairWithDesktop,
    sessions,
    clearPairing,
  } = useRuntime();
  const [baseUrl, setBaseUrl] = useState("http://127.0.0.1:47821");
  const [pairingToken, setPairingToken] = useState("");
  const [pin, setPin] = useState("");
  const [deviceName, setDeviceName] = useState("Lunaria Phone");

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <Text selectable style={{ fontSize: 28, fontWeight: "700" }}>
        Remote control
      </Text>
      <Text selectable style={{ color: "#64748B", fontSize: 15, lineHeight: 22 }}>
        Pair this phone to a desktop runtime. Desktop remains the execution host; mobile stays focused on session summaries and approvals.
      </Text>

      {!isHydrated ? (
        <Text selectable>Loading remote session…</Text>
      ) : null}

      {!auth ? (
        <View style={{ gap: 12, padding: 16, borderRadius: 20, backgroundColor: "#0F172A", borderWidth: 1, borderColor: "#1E293B" }}>
          <Text selectable style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
            Pair this phone
          </Text>
          <TextInput
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholder="Desktop base URL"
            autoCapitalize="none"
            style={inputStyle}
          />
          <TextInput
            value={pairingToken}
            onChangeText={setPairingToken}
            placeholder="Pairing token"
            autoCapitalize="none"
            style={inputStyle}
          />
          <TextInput
            value={pin}
            onChangeText={setPin}
            placeholder="PIN"
            autoCapitalize="none"
            style={inputStyle}
          />
          <TextInput
            value={deviceName}
            onChangeText={setDeviceName}
            placeholder="Device name"
            style={inputStyle}
          />
          <Pressable
            onPress={() => void pairWithDesktop({ baseUrl, pairingToken, pin, deviceName })}
            style={primaryButton}
          >
            <Text style={primaryButtonText}>Complete pairing</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={cardStyle}>
            <Text selectable style={cardTitle}>
              Connected device
            </Text>
            <Text selectable style={mutedText}>
              {auth.deviceId}
            </Text>
            <Text selectable style={mutedText}>
              {auth.baseUrl}
            </Text>
            <Text selectable style={mutedText}>
              Permissions waiting: {pendingPermissions.length}
            </Text>
            <Pressable onPress={() => void clearPairing()} style={secondaryButton}>
              <Text style={secondaryButtonText}>Forget this pairing</Text>
            </Pressable>
          </View>

          <View style={cardStyle}>
            <Text selectable style={cardTitle}>
              Sessions
            </Text>
            {sessions.map((session) => (
              <Link key={session.id} href={`/session/${session.id}`} asChild>
                <Pressable style={sessionRow}>
                  <View style={{ flex: 1 }}>
                    <Text selectable style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                      {session.workingDir.split("/").pop() || session.id}
                    </Text>
                    <Text selectable style={mutedText}>
                      {session.status} · {session.tuiType}
                    </Text>
                  </View>
                  {session.metadata?.autopilot ? (
                    <View style={tagStyle}>
                      <Text style={tagText}>Autopilot</Text>
                    </View>
                  ) : null}
                </Pressable>
              </Link>
            ))}
          </View>

          <Link href="/permissions" asChild>
            <Pressable style={cardStyle}>
              <Text selectable style={cardTitle}>
                Permission queue
              </Text>
              <Text selectable style={mutedText}>
                {pendingPermissions.length === 0
                  ? "No approvals are waiting."
                  : `${pendingPermissions.length} desktop actions need a decision.`}
              </Text>
            </Pressable>
          </Link>
        </>
      )}
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: "#111827",
  color: "white",
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: "#374151",
} as const;

const cardStyle = {
  gap: 10,
  padding: 16,
  borderRadius: 20,
  backgroundColor: "#0F172A",
  borderWidth: 1,
  borderColor: "#1E293B",
} as const;

const primaryButton = {
  backgroundColor: "#38BDF8",
  paddingVertical: 12,
  borderRadius: 14,
  alignItems: "center",
} as const;

const primaryButtonText = {
  color: "#082F49",
  fontWeight: "700",
  fontSize: 15,
} as const;

const secondaryButton = {
  paddingVertical: 10,
  borderRadius: 12,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#334155",
} as const;

const secondaryButtonText = {
  color: "#E2E8F0",
  fontWeight: "600",
} as const;

const cardTitle = {
  color: "white",
  fontSize: 18,
  fontWeight: "600",
} as const;

const mutedText = {
  color: "#94A3B8",
  fontSize: 14,
} as const;

const sessionRow = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  paddingVertical: 8,
} as const;

const tagStyle = {
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
  backgroundColor: "#172554",
} as const;

const tagText = {
  color: "#BFDBFE",
  fontSize: 12,
  fontWeight: "700",
} as const;
