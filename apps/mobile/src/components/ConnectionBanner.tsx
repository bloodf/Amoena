import { Text, View } from "react-native";

export function ConnectionBanner({ message }: { message: string }) {
  return (
    <View
      style={{
        backgroundColor: "#92400E",
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#FEF3C7", fontSize: 13, fontWeight: "600" }}>{message}</Text>
    </View>
  );
}
