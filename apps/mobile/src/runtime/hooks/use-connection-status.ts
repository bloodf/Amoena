import { useEffect, useState } from "react";
import { AppState } from "react-native";

export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setIsReconnecting(true);
        setTimeout(() => setIsReconnecting(false), 2000);
      }
    });

    return () => subscription.remove();
  }, []);

  return { isConnected, isReconnecting, setIsConnected, setIsReconnecting };
}
