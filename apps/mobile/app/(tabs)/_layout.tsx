import { useAmoenaTranslation } from '@lunaria/i18n';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { usePermissions } from '@/runtime/hooks/use-permissions';
import { tokens } from '@/theme/tokens';

export default function TabLayout() {
  const { t } = useAmoenaTranslation('mobile');
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
          title: t('mobile.home'),
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20, fontFamily: 'monospace' }}>{`>`}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('mobile.history'),
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20, fontFamily: 'monospace' }}>#</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="permissions"
        options={{
          title: t('mobile.tabApprovals'),
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20, fontFamily: 'monospace' }}>!</Text>
          ),
          tabBarBadge: badgeCount > 0 ? badgeCount : undefined,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('mobile.tabMore'),
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20, fontFamily: 'monospace' }}>...</Text>
          ),
        }}
      />
    </Tabs>
  );
}
