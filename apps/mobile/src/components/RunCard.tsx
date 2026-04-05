/**
 * Card for a goal run showing title, status, duration, cost, and agent count.
 */

import { useAmoenaTranslation } from '@lunaria/i18n';
import { Pressable, Text, View, StyleSheet } from 'react-native';

import { CostBadge } from './CostBadge';
import { tokens } from '@/theme/tokens';

type RunStatus = 'running' | 'completed' | 'partial_failure' | 'failed' | 'cancelled';

type RunCardProps = {
  readonly goalId: string;
  readonly description: string;
  readonly status: RunStatus;
  readonly startedAt: number;
  readonly completedAt?: number;
  readonly totalCostUsd?: number;
  readonly taskCount?: number;
  readonly agentCount?: number;
  readonly onPress?: () => void;
};

const STATUS_COLORS: Record<RunStatus, string> = {
  running: tokens.colorPrimary,
  completed: tokens.colorSuccess,
  partial_failure: tokens.colorWarning ?? '#F59E0B',
  failed: tokens.colorDestructive,
  cancelled: tokens.colorTextTertiary,
};

function formatDuration(startedAt: number, completedAt?: number): string {
  const end = completedAt ?? Date.now();
  const durationMs = end - startedAt;
  const seconds = Math.floor(durationMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function formatTimeAgo(
  timestamp: number,
  t: (key: string, values?: Record<string, number>) => string,
): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return t('mobile.justNow');
  if (minutes < 60) return t('mobile.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('mobile.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  return t('mobile.daysAgo', { count: days });
}

function getStatusLabel(status: RunStatus, t: (key: string) => string): string {
  switch (status) {
    case 'running':
      return t('mobile.statusRunning');
    case 'completed':
      return t('mobile.statusCompleted');
    case 'partial_failure':
      return t('mobile.statusPartialFailure');
    case 'failed':
      return t('mobile.statusFailed');
    case 'cancelled':
      return t('mobile.statusCancelled');
  }
}

export function RunCard({
  description,
  status,
  startedAt,
  completedAt,
  totalCostUsd,
  taskCount,
  agentCount,
  onPress,
}: RunCardProps) {
  const { t } = useAmoenaTranslation('mobile');
  const content = (
    <View style={localStyles.card}>
      <View style={localStyles.headerRow}>
        <Text style={localStyles.title} numberOfLines={2}>
          {description}
        </Text>
        <View style={[localStyles.statusBadge, { backgroundColor: `${STATUS_COLORS[status]}20` }]}>
          <Text style={[localStyles.statusText, { color: STATUS_COLORS[status] }]}>
            {getStatusLabel(status, t)}
          </Text>
        </View>
      </View>

      <View style={localStyles.metaRow}>
        <Text style={localStyles.metaText}>{formatDuration(startedAt, completedAt)}</Text>
        <Text style={localStyles.metaSep}>|</Text>
        <Text style={localStyles.metaText}>{formatTimeAgo(startedAt, t)}</Text>
        {taskCount !== undefined && (
          <>
            <Text style={localStyles.metaSep}>|</Text>
            <Text style={localStyles.metaText}>
              {taskCount} {taskCount === 1 ? t('mobile.task') : t('mobile.taskPlural')}
            </Text>
          </>
        )}
        {agentCount !== undefined && (
          <>
            <Text style={localStyles.metaSep}>|</Text>
            <Text style={localStyles.metaText}>
              {agentCount} {agentCount === 1 ? t('mobile.agent') : t('mobile.agentPlural')}
            </Text>
          </>
        )}
      </View>

      {totalCostUsd !== undefined && totalCostUsd > 0 && (
        <CostBadge costUsd={totalCostUsd} compact />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return content;
}

const localStyles = StyleSheet.create({
  card: {
    gap: tokens.spacing2_5,
    padding: tokens.spacing4,
    borderRadius: tokens.radius3xl,
    backgroundColor: tokens.colorSurface1,
    borderWidth: tokens.borderWidth,
    borderColor: tokens.colorBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: tokens.spacing2,
  },
  title: {
    color: tokens.colorTextPrimary,
    fontSize: tokens.fontSizeBase,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: tokens.spacing2_5,
    paddingVertical: tokens.spacing1_5,
    borderRadius: tokens.radiusFull,
  },
  statusText: {
    fontSize: tokens.fontSizeXs,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing2,
    flexWrap: 'wrap',
  },
  metaText: {
    color: tokens.colorTextSecondary,
    fontSize: tokens.fontSizeXs,
  },
  metaSep: {
    color: tokens.colorTextTertiary,
    fontSize: tokens.fontSizeXs,
  },
});
