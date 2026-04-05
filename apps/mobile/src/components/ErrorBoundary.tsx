import { useAmoenaTranslation } from '@lunaria/i18n';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from '@/theme/styles';
import { tokens } from '@/theme/tokens';

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
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorView
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorView({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const { t } = useAmoenaTranslation('mobile');
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: tokens.spacing6,
        backgroundColor: tokens.colorBackground,
      }}
    >
      <Text style={[styles.screenTitle, { textAlign: 'center', marginBottom: tokens.spacing4 }]}>
        {t('mobile.somethingWentWrong')}
      </Text>
      <Text style={[styles.mutedText, { textAlign: 'center', marginBottom: tokens.spacing6 }]}>
        {error?.message ?? t('mobile.unexpectedError')}
      </Text>
      <Pressable
        onPress={onRetry}
        style={styles.primaryButton}
        accessibilityRole="button"
        accessibilityLabel={t('mobile.tryAgain')}
      >
        <Text style={styles.primaryButtonText}>{t('mobile.tryAgain')}</Text>
      </Pressable>
    </View>
  );
}
