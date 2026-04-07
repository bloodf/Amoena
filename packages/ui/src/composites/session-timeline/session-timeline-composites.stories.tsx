import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { CheckpointTree } from './CheckpointTree';
import { ChangedFilesPanel } from './ChangedFilesPanel';
import { DiffPreview } from './DiffPreview';
import {
  sessionTimelineCheckpoints,
  sessionTimelineChangedFiles,
  sessionTimelineDiffLines,
} from './data';

/* ───────────────────────────────────────────────────────────
   Meta – all session-timeline sub-component stories
   ─────────────────────────────────────────────────────────── */

const meta = {
  title: 'Composites/Session/SessionTimeline/SubComponents',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'CheckpointTree / Default',
  render: () => (
    <div style={{ width: 360 }} className="p-3">
      <CheckpointTree
        checkpoints={sessionTimelineCheckpoints}
        selectedCheckpoint="cp5"
        onSelect={fn()}
      />
    </div>
  ),
};

export const EarlyCheckpointSelected: Story = {
  name: 'CheckpointTree / Early Selected',
  render: () => (
    <div style={{ width: 360 }} className="p-3">
      <CheckpointTree
        checkpoints={sessionTimelineCheckpoints}
        selectedCheckpoint="cp2"
        onSelect={fn()}
      />
    </div>
  ),
};

export const BranchCheckpointSelected: Story = {
  name: 'CheckpointTree / Branch Selected',
  render: () => (
    <div style={{ width: 360 }} className="p-3">
      <CheckpointTree
        checkpoints={sessionTimelineCheckpoints}
        selectedCheckpoint="cp3b"
        onSelect={fn()}
      />
    </div>
  ),
};

export const SingleCheckpoint: Story = {
  name: 'CheckpointTree / Single',
  render: () => (
    <div style={{ width: 360 }} className="p-3">
      <CheckpointTree
        checkpoints={[
          {
            id: 'cp1',
            label: 'Session start',
            timestamp: '3:42 PM',
            tokensUsed: '0',
            filesChanged: 0,
            isCurrent: true,
          },
        ]}
        selectedCheckpoint="cp1"
        onSelect={fn()}
      />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   ChangedFilesPanel
   ─────────────────────────────────────────────────────────── */

export const ChangedFilesPanelDefault: Story = {
  render: () => (
    <div style={{ width: 500 }} className="p-4">
      <ChangedFilesPanel files={sessionTimelineChangedFiles} />
    </div>
  ),
};

export const ChangedFilesPanelSingleFile: Story = {
  render: () => (
    <div style={{ width: 500 }} className="p-4">
      <ChangedFilesPanel
        files={[{ path: 'src/auth/jwt.rs', additions: 142, deletions: 23, status: 'modified' }]}
      />
    </div>
  ),
};

export const ChangedFilesPanelAllAdded: Story = {
  render: () => (
    <div style={{ width: 500 }} className="p-4">
      <ChangedFilesPanel
        files={[
          { path: 'src/auth/middleware.rs', additions: 89, deletions: 0, status: 'added' },
          { path: 'tests/auth_test.rs', additions: 156, deletions: 0, status: 'added' },
        ]}
      />
    </div>
  ),
};

/* ───────────────────────────────────────────────────────────
   DiffPreview
   ─────────────────────────────────────────────────────────── */

export const DiffPreviewDefault: Story = {
  render: () => (
    <div style={{ width: 600 }} className="p-4">
      <DiffPreview lines={sessionTimelineDiffLines} />
    </div>
  ),
};

export const DiffPreviewAdditionsOnly: Story = {
  render: () => (
    <div style={{ width: 600 }} className="p-4">
      <DiffPreview
        lines={[
          { type: 'context', line: 1, content: 'use axum::middleware::Next;' },
          { type: 'addition', line: 2, content: 'use axum::extract::State;' },
          { type: 'addition', line: 3, content: 'use crate::auth::verify_token;' },
          { type: 'context', line: 4, content: '' },
        ]}
      />
    </div>
  ),
};

export const DiffPreviewDeletionsOnly: Story = {
  render: () => (
    <div style={{ width: 600 }} className="p-4">
      <DiffPreview
        lines={[
          { type: 'context', line: 10, content: 'pub struct SessionStore {' },
          { type: 'deletion', line: 11, content: '    sessions: HashMap<String, Session>,' },
          { type: 'deletion', line: 12, content: '    ttl: Duration,' },
          { type: 'context', line: 13, content: '}' },
        ]}
      />
    </div>
  ),
};
