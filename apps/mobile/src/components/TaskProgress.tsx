/**
 * DAG progress indicator showing completed/running/queued/failed task counts.
 *
 * Renders a horizontal bar with colored segments plus a text summary.
 */

import { useAmoenaTranslation } from '@lunaria/i18n';
import { Text, View, StyleSheet } from 'react-native';

import { tokens } from '@/theme/tokens';

type TaskCounts = {
  readonly completed: number;
  readonly running: number;
  readonly queued: number;
  readonly failed: number;
};

type TaskProgressProps = {
  readonly counts: TaskCounts;
  readonly compact?: boolean;
};

function getTotal(counts: TaskCounts): number {
  return counts.completed + counts.running + counts.queued + counts.failed;
}

export function TaskProgress({ counts, compact = false }: TaskProgressProps) {
  const { t } = useAmoenaTranslation('mobile');
  const total = getTotal(counts);
  if (total === 0) {
    return <Text style={localStyles.emptyText}>{t('mobile.noTasks')}</Text>;
  }

  const completedPct = (counts.completed / total) * 100;
  const runningPct = (counts.running / total) * 100;
  const failedPct = (counts.failed / total) * 100;
  // queued fills the remainder

  return (
    <View style={localStyles.container}>
      <View style={localStyles.barContainer}>
        {completedPct > 0 && (
          <View
            style={[
              localStyles.segment,
              { flex: completedPct, backgroundColor: tokens.colorSuccess },
            ]}
          />
        )}
        {runningPct > 0 && (
          <View
            style={[
              localStyles.segment,
              { flex: runningPct, backgroundColor: tokens.colorPrimary },
            ]}
          />
        )}
        {failedPct > 0 && (
          <View
            style={[
              localStyles.segment,
              { flex: failedPct, backgroundColor: tokens.colorDestructive },
            ]}
          />
        )}
        {counts.queued > 0 && (
          <View
            style={[
              localStyles.segment,
              { flex: (counts.queued / total) * 100, backgroundColor: tokens.colorSurface3 },
            ]}
          />
        )}
      </View>
      {!compact && (
        <View style={localStyles.labelsRow}>
          <LabelDot color={tokens.colorSuccess} label={`${counts.completed} ${t('mobile.done')}`} />
          <LabelDot
            color={tokens.colorPrimary}
            label={`${counts.running} ${t('mobile.running')}`}
          />
          <LabelDot color={tokens.colorSurface3} label={`${counts.queued} ${t('mobile.queued')}`} />
          {counts.failed > 0 && (
            <LabelDot
              color={tokens.colorDestructive}
              label={`${counts.failed} ${t('mobile.failed')}`}
            />
          )}
        </View>
      )}
    </View>
  );
}

function LabelDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={localStyles.labelContainer}>
      <View style={[localStyles.dot, { backgroundColor: color }]} />
      <Text style={localStyles.labelText}>{label}</Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    gap: tokens.spacing2,
  },
  barContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: tokens.radiusFull,
    overflow: 'hidden',
    backgroundColor: tokens.colorSurface3,
  },
  segment: {
    height: '100%',
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing3,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelText: {
    color: tokens.colorTextSecondary,
    fontSize: tokens.fontSizeXs,
  },
  emptyText: {
    color: tokens.colorTextTertiary,
    fontSize: tokens.fontSizeXs,
  },
});
