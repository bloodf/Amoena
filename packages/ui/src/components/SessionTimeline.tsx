import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GitCommit, Plus } from 'lucide-react';
import {
  sessionTimelineChangedFiles,
  sessionTimelineCheckpoints,
  sessionTimelineDiffLines,
} from '@/composites/session-timeline/data';
import { CheckpointTree } from '@/composites/session-timeline/CheckpointTree';
import { ChangedFilesPanel } from '@/composites/session-timeline/ChangedFilesPanel';
import { DiffPreview } from '@/composites/session-timeline/DiffPreview';

export function SessionTimeline() {
  const { t } = useTranslation();
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>('cp5');
  const selected = sessionTimelineCheckpoints.find(
    (checkpoint) => checkpoint.id === selectedCheckpoint,
  );

  return (
    <div className="flex h-full">
      <div className="w-[360px] border-r border-border flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <GitCommit size={14} className="text-primary" />
            <h2 className="text-[13px] font-semibold text-foreground">{t('ui.sessionTimeline')}</h2>
          </div>
          <button
            type="button"
            aria-label={t('ui.createCheckpoint')}
            className="flex items-center gap-1 px-2 py-1 text-[10px] border border-border text-muted-foreground rounded hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 min-h-[44px] min-w-[44px]"
          >
            <Plus size={10} aria-hidden="true" />
            {t('ui.checkpoint')}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <CheckpointTree
            checkpoints={sessionTimelineCheckpoints}
            selectedCheckpoint={selectedCheckpoint}
            onSelect={setSelectedCheckpoint}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <h3 className="text-[14px] font-semibold text-foreground mb-1">
            {selected?.label || t('ui.selectCheckpoint')}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {selected?.filesChanged || 0} {t('ui.filesChangedAt')} {selected?.timestamp}
          </p>
        </div>
        <ChangedFilesPanel files={sessionTimelineChangedFiles} />
        <DiffPreview lines={sessionTimelineDiffLines} />
      </div>
    </div>
  );
}
