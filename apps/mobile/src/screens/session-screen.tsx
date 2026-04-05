import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, Pressable, View } from 'react-native';

import { useAmoenaTranslation } from '@lunaria/i18n';
import { useRuntime, useSessionAgents, useSessionMessages } from '@/runtime/provider';

export function MobileSessionScreen({ sessionId }: { sessionId: string }) {
  const { t } = useAmoenaTranslation();
  const { sendMessage, sessions } = useRuntime();
  const { isLoading, messages } = useSessionMessages(sessionId);
  const { agents } = useSessionAgents(sessionId);
  const [draft, setDraft] = useState('');

  const session = useMemo(
    () => sessions.find((entry) => entry.id === sessionId) ?? null,
    [sessionId, sessions],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <View style={{ gap: 4 }}>
        <Text selectable style={{ color: 'white', fontSize: 26, fontWeight: '700' }}>
          {session?.workingDir.split('/').pop() || t('mobile.session')}
        </Text>
        <Text selectable style={{ color: '#94A3B8', fontSize: 14 }}>
          {session?.status ?? 'loading'} · {session?.tuiType ?? 'runtime'}
        </Text>
      </View>

      <View style={sectionStyle}>
        <Text selectable style={sectionTitle}>
          {t('mobile.activeAgents')}
        </Text>
        {agents.map((agent) => (
          <View
            key={agent.id}
            style={{
              borderRadius: 16,
              padding: 12,
              backgroundColor: '#111827',
              borderWidth: 1,
              borderColor: '#1F2937',
              gap: 4,
            }}
          >
            <Text selectable style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>
              {agent.agentType}
            </Text>
            <Text selectable style={mutedText}>
              {agent.status} · {agent.model}
            </Text>
          </View>
        ))}
      </View>

      <View style={sectionStyle}>
        <Text selectable style={sectionTitle}>
          {t('mobile.transcript')}
        </Text>
        {isLoading ? (
          <Text selectable style={mutedText}>
            {t('mobile.loadingMessages')}
          </Text>
        ) : null}
        {messages.map((message) => (
          <View
            key={message.id}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'stretch',
              backgroundColor: message.role === 'user' ? '#082F49' : '#111827',
              borderRadius: 18,
              padding: 12,
              borderWidth: 1,
              borderColor: '#1F2937',
            }}
          >
            <Text selectable style={{ color: '#E2E8F0', fontSize: 13, marginBottom: 4 }}>
              {message.role}
            </Text>
            <Text selectable style={{ color: 'white', fontSize: 15, lineHeight: 22 }}>
              {message.content}
            </Text>
          </View>
        ))}
      </View>

      <View style={sectionStyle}>
        <Text selectable style={sectionTitle}>
          {t('mobile.reply')}
        </Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          placeholder="Send a message to the paired desktop session"
          style={{
            minHeight: 100,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#334155',
            backgroundColor: '#111827',
            color: 'white',
            padding: 14,
            textAlignVertical: 'top',
          }}
        />
        <Pressable
          onPress={() => {
            void sendMessage(sessionId, draft);
            setDraft('');
          }}
          style={primaryButton}
        >
          <Text style={primaryButtonText}>{t('mobile.sendToDesktop')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const sectionStyle = {
  gap: 12,
  padding: 16,
  borderRadius: 20,
  backgroundColor: '#0F172A',
  borderWidth: 1,
  borderColor: '#1E293B',
} as const;

const sectionTitle = {
  color: 'white',
  fontSize: 18,
  fontWeight: '600',
} as const;

const primaryButton = {
  backgroundColor: '#38BDF8',
  paddingVertical: 12,
  borderRadius: 14,
  alignItems: 'center',
} as const;

const primaryButtonText = {
  color: '#082F49',
  fontWeight: '700',
  fontSize: 15,
} as const;

const mutedText = {
  color: '#94A3B8',
  fontSize: 14,
} as const;
