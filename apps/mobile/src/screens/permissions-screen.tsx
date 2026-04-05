import { ScrollView, Text, Pressable, View } from 'react-native';

import { useAmoenaTranslation } from '@lunaria/i18n';
import { useRuntime } from '@/runtime/provider';

export function MobilePermissionsScreen() {
  const { t } = useAmoenaTranslation();
  const { pendingPermissions, resolvePermission } = useRuntime();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <Text selectable style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>
        {t('mobile.permissionQueue')}
      </Text>
      {pendingPermissions.length === 0 ? (
        <Text selectable style={{ color: '#94A3B8', fontSize: 15 }}>
          {t('mobile.noPendingApprovals')}
        </Text>
      ) : null}
      {pendingPermissions.map((permission) => (
        <View
          key={permission.requestId}
          style={{
            gap: 12,
            padding: 16,
            borderRadius: 20,
            backgroundColor: '#0F172A',
            borderWidth: 1,
            borderColor: '#1E293B',
          }}
        >
          <Text selectable style={{ color: 'white', fontSize: 17, fontWeight: '600' }}>
            {permission.message}
          </Text>
          <Text selectable style={{ color: '#94A3B8', fontSize: 13 }}>
            {t('mobile.session')} {permission.sessionId}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={() =>
                void resolvePermission(permission.sessionId, permission.requestId, 'approve')
              }
              style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: '#14532D',
                borderRadius: 14,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: '#DCFCE7', fontWeight: '700' }}>{t('mobile.approve')}</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                void resolvePermission(permission.sessionId, permission.requestId, 'deny')
              }
              style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: '#7F1D1D',
                borderRadius: 14,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: '#FEE2E2', fontWeight: '700' }}>{t('mobile.deny')}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
