import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { styles } from "@/theme/styles";
import { tokens } from "@/theme/tokens";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: tokens.spacing6, backgroundColor: tokens.colorBackground }}>
          <Text style={[styles.screenTitle, { textAlign: "center", marginBottom: tokens.spacing4 }]}>
            Something went wrong
          </Text>
          <Text style={[styles.mutedText, { textAlign: "center", marginBottom: tokens.spacing6 }]}>
            {this.state.error?.message ?? "An unexpected error occurred"}
          </Text>
          <Pressable
            onPress={() => this.setState({ hasError: false, error: null })}
            style={styles.primaryButton}
            accessibilityRole="button"
            accessibilityLabel="Try Again"
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
