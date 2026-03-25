import { useState } from 'react';
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
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>('cp5');
  const selected = sessionTimelineCheckpoints.find(
    (checkpoint) => checkpoint.id === selectedCheckpoint,
  );

  return (
    <div className="flex h-full">
      {/* Timeline */}
      <div className="w-[360px] border-r border-border flex flex-col flex-shrink-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <GitCommit size={14} className="text-primary" />
            <h2 className="text-[13px] font-semibold text-foreground">Session Timeline</h2>
          </div>
          <button
            aria-label="Create checkpoint"
            className="flex items-center gap-1 px-2 py-1 text-[10px] border border-border text-muted-foreground rounded hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 min-h-[44px] min-w-[44px]"
          >
            <Plus size={10} aria-hidden="true" />
            Checkpoint
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

      {/* Diff / File changes */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <h3 className="text-[14px] font-semibold text-foreground mb-1">
            {selected?.label || 'Select a checkpoint'}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {selected?.filesChanged || 0} files changed at {selected?.timestamp}
          </p>
        </div>
        <ChangedFilesPanel files={sessionTimelineChangedFiles} />
        <DiffPreview lines={sessionTimelineDiffLines} />
      </div>
    </div>
  );
}
