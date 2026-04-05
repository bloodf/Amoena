/**
 * Home screen — Active runs overview with quick stats and recent activity.
 *
 * Shows: active agent count, total cost today, recent activity feed,
 * and a list of active sessions with their current state.
 */

import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';

import { useAmoenaTranslation } from '@lunaria/i18n';
import { useRuntime } from '@/runtime/provider';
import { CostBadge } from '@/components/CostBadge';
import { styles } from '@/theme/styles';
import { tokens } from '@/theme/tokens';

export function MobileHomeScreen() {
  const { t } = useAmoenaTranslation();
  const {
    auth,
    isHydrated,
    pendingPermissions,
    pairWithDesktop,
    sessions,
    clearPairing,
    refreshSessions,
    error,
  } = useRuntime();

  const [baseUrl, setBaseUrl] = useState('http://127.0.0.1:47821');
  const [pairingToken, setPairingToken] = useState('');
  const [pin, setPin] = useState('');
  const [deviceName, setDeviceName] = useState('Amoena Phone');
  const [refreshing, setRefreshing] = useState(false);

  const activeSessions = sessions.filter((s) => s.status === 'active' || s.status === 'running');
  const activeAgentCount = activeSessions.length;
  const todayCost = 0; // Cost tracking will come from relay events

  async function handleRefresh() {
    setRefreshing(true);
    await refreshSessions();
    setRefreshing(false);
  }

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: tokens.colorBackground,
        }}
      >
        <Text style={styles.mutedText}>{t('mobile.loading')}</Text>
      </View>
    );
  }

  if (!auth) {
    return (
      <PairingForm
        t={t}
        baseUrl={baseUrl}
        pairingToken={pairingToken}
        pin={pin}
        deviceName={deviceName}
        onBaseUrlChange={setBaseUrl}
        onPairingTokenChange={setPairingToken}
        onPinChange={setPin}
        onDeviceNameChange={setDeviceName}
        onPair={() => void pairWithDesktop({ baseUrl, pairingToken, pin, deviceName })}
        error={error}
      />
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={tokens.colorTextSecondary}
        />
      }
    >
      {/* Quick Stats Row */}
      <View style={quickStatsRow}>
        <View style={[styles.card, { flex: 1, alignItems: 'center' }]}>
          <Text style={statValue}>{activeAgentCount}</Text>
          <Text style={styles.mutedText}>{t('mobile.active')}</Text>
        </View>
        <View style={[styles.card, { flex: 1, alignItems: 'center' }]}>
          <Text style={statValue}>{sessions.length}</Text>
          <Text style={styles.mutedText}>{t('mobile.sessions')}</Text>
        </View>
        <View style={[styles.card, { flex: 1, alignItems: 'center' }]}>
          {todayCost > 0 ? <CostBadge costUsd={todayCost} /> : <Text style={statValue}>--</Text>}
          <Text style={styles.mutedText}>{t('mobile.today')}</Text>
        </View>
      </View>

      {/* Pending Permissions Banner */}
      {pendingPermissions.length > 0 && (
        <Link href="/permissions" asChild>
          <Pressable style={permissionBanner} accessibilityRole="button">
            <Text style={permissionBannerText}>
              {pendingPermissions.length} {t('mobile.approvalsWaiting')}
            </Text>
          </Pressable>
        </Link>
      )}

      {/* Connected Device Info */}
      <View style={styles.card}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{t('mobile.connected')}</Text>
            <Text style={styles.mutedText} numberOfLines={1}>
              {auth.baseUrl}
            </Text>
          </View>
          <Pressable
            onPress={() => void clearPairing()}
            style={styles.secondaryButton}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>{t('mobile.unpair')}</Text>
          </Pressable>
        </View>
      </View>

      {/* Active Sessions */}
      <Text style={styles.sectionTitle}>{t('mobile.sessions')}</Text>
      {sessions.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.mutedText}>{t('mobile.noActiveSessions')}</Text>
        </View>
      ) : (
        sessions.map((session) => (
          <Link key={session.id} href={`/session/${session.id}`} asChild>
            <Pressable style={styles.card} accessibilityRole="button">
              <View style={styles.sessionRow}>
                <View
                  style={statusDot(session.status === 'active' || session.status === 'running')}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionName} numberOfLines={1}>
                    {session.workingDir.split('/').pop() || session.id}
                  </Text>
                  <Text style={styles.mutedText}>
                    {session.status} {session.tuiType ? `\u00B7 ${session.tuiType}` : ''}
                  </Text>
                </View>
                {session.metadata?.autopilot ? (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Autopilot</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          </Link>
        ))
      )}
    </ScrollView>
  );
}

// ─── Pairing Form (shown when not yet paired) ───────────────────────────────

function PairingForm({
  t,
  baseUrl,
  pairingToken,
  pin,
  deviceName,
  onBaseUrlChange,
  onPairingTokenChange,
  onPinChange,
  onDeviceNameChange,
  onPair,
  error,
}: {
  t: (key: string) => string;
  baseUrl: string;
  pairingToken: string;
  pin: string;
  deviceName: string;
  onBaseUrlChange: (v: string) => void;
  onPairingTokenChange: (v: string) => void;
  onPinChange: (v: string) => void;
  onDeviceNameChange: (v: string) => void;
  onPair: () => void;
  error: string | null;
}) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.screenTitle}>{t('mobile.amoenaRemote')}</Text>
      <Text style={styles.descriptionText}>{t('mobile.pairThisPhone')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('mobile.pairWithDesktop')}</Text>
        {error && (
          <Text style={{ color: tokens.colorDestructive, fontSize: tokens.fontSizeSm }}>
            {error}
          </Text>
        )}
        <TextInput
          value={baseUrl}
          onChangeText={onBaseUrlChange}
          placeholder="Desktop base URL"
          placeholderTextColor={tokens.colorTextTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <TextInput
          value={pairingToken}
          onChangeText={onPairingTokenChange}
          placeholder="Pairing token"
          placeholderTextColor={tokens.colorTextTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <TextInput
          value={pin}
          onChangeText={onPinChange}
          placeholder="PIN"
          placeholderTextColor={tokens.colorTextTertiary}
          autoCapitalize="none"
          keyboardType="number-pad"
          style={styles.input}
        />
        <TextInput
          value={deviceName}
          onChangeText={onDeviceNameChange}
          placeholder="Device name"
          placeholderTextColor={tokens.colorTextTertiary}
          style={styles.input}
        />
        <Pressable onPress={onPair} style={styles.primaryButton} accessibilityRole="button">
          <Text style={styles.primaryButtonText}>{t('mobile.completePairing')}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('mobile.qrScanning').split('.')[0]}</Text>
        <Text style={styles.mutedText}>{t('mobile.qrScanning')}</Text>
      </View>
    </ScrollView>
  );
}

// ─── Local styles ────────────────────────────────────────────────────────────

const quickStatsRow = {
  flexDirection: 'row' as const,
  gap: tokens.spacing3,
};

const statValue = {
  color: tokens.colorTextPrimary,
  fontSize: tokens.fontSize2xl,
  fontWeight: '700' as const,
};

const permissionBanner = {
  backgroundColor: tokens.colorWarning ?? '#F59E0B',
  paddingVertical: tokens.spacing3,
  paddingHorizontal: tokens.spacing4,
  borderRadius: tokens.radius2xl,
  alignItems: 'center' as const,
};

const permissionBannerText = {
  color: '#422006',
  fontWeight: '700' as const,
  fontSize: tokens.fontSizeSm,
};

function statusDot(isActive: boolean) {
  return {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: isActive ? tokens.colorSuccess : tokens.colorTextTertiary,
  } as const;
}
