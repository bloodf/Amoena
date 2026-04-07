import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { CheckpointTree } from './CheckpointTree';
import { DiffPreview } from './DiffPreview';
import { ChangedFilesPanel } from './ChangedFilesPanel';
import {
  sessionTimelineCheckpoints,
  sessionTimelineChangedFiles,
  sessionTimelineDiffLines,
} from './data';
import type { TimelineChangedFile } from './types';

/* ---------- CheckpointTree ---------- */

describe('CheckpointTree', () => {
  const defaultProps = {
    checkpoints: sessionTimelineCheckpoints,
    selectedCheckpoint: '',
    onSelect: () => {},
  };

  test('renders all checkpoint labels', () => {
    render(<CheckpointTree {...defaultProps} />);
    expect(screen.getByText('Session start')).toBeTruthy();
    expect(screen.getByText('Initial auth scaffold')).toBeTruthy();
    expect(screen.getByText('JWT token rotation')).toBeTruthy();
    expect(screen.getByText('Middleware integration')).toBeTruthy();
    expect(screen.getByText('Error handling + tests')).toBeTruthy();
  });

  test('renders compaction marker with observation count', () => {
    const { container } = render(<CheckpointTree {...defaultProps} />);
    const text = container.textContent ?? '';
    expect(text.includes('12 observations summarized')).toBe(true);
  });

  test('renders branch label on branched checkpoints', () => {
    render(<CheckpointTree {...defaultProps} />);
    expect(screen.getByText('experiment/session-auth')).toBeTruthy();
    expect(screen.getByText('Alt: Session-based auth')).toBeTruthy();
  });

  test("marks current checkpoint with 'current' indicator", () => {
    render(<CheckpointTree {...defaultProps} />);
    expect(screen.getByText('current')).toBeTruthy();
  });

  test('calls onSelect when a checkpoint button is clicked', () => {
    let selected = '';
    render(
      <CheckpointTree
        {...defaultProps}
        onSelect={(id) => {
          selected = id;
        }}
      />,
    );
    fireEvent.click(screen.getByText('Initial auth scaffold'));
    expect(selected).toBe('cp2');
  });

  test('shows action buttons when a non-current checkpoint is selected', () => {
    render(<CheckpointTree {...defaultProps} selectedCheckpoint="cp2" />);
    expect(screen.getByRole('button', { name: 'Restore checkpoint' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Fork from checkpoint' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View diff' })).toBeTruthy();
  });

  test('does not show action buttons when the current checkpoint is selected', () => {
    render(<CheckpointTree {...defaultProps} selectedCheckpoint="cp5" />);
    expect(screen.queryByRole('button', { name: 'Restore checkpoint' })).toBeNull();
  });

  test('renders empty when checkpoints array is empty', () => {
    const { container } = render(
      <CheckpointTree checkpoints={[]} selectedCheckpoint="" onSelect={() => {}} />,
    );
    expect(container.innerHTML).toBe('');
  });

  test('displays tokens and file count for checkpoints', () => {
    render(<CheckpointTree {...defaultProps} />);
    expect(screen.getByText('2.1k tokens')).toBeTruthy();
    expect(screen.getByText('4 files')).toBeTruthy();
  });
});

/* ---------- DiffPreview ---------- */

describe('DiffPreview', () => {
  test('renders diff lines with additions and deletions', () => {
    render(<DiffPreview lines={sessionTimelineDiffLines} />);
    expect(screen.getByText('src/auth/jwt.rs')).toBeTruthy();
    expect(screen.getByText('+142')).toBeTruthy();
    expect(screen.getByText('-23')).toBeTruthy();
  });

  test('renders addition content', () => {
    const { container } = render(<DiffPreview lines={sessionTimelineDiffLines} />);
    const text = container.textContent ?? '';
    expect(text.includes('const ACCESS_TOKEN_EXPIRY: i64 = 900;')).toBe(true);
  });

  test('renders deletion content', () => {
    render(<DiffPreview lines={sessionTimelineDiffLines} />);
    expect(screen.getByText('const TOKEN_EXPIRY: i64 = 3600; // 1 hour')).toBeTruthy();
  });

  test('renders context lines', () => {
    render(<DiffPreview lines={sessionTimelineDiffLines} />);
    expect(screen.getByText('use chrono::{Utc, Duration};')).toBeTruthy();
  });

  test('renders + and - symbols for additions/deletions', () => {
    const { container } = render(<DiffPreview lines={sessionTimelineDiffLines} />);
    const plusSigns = container.querySelectorAll('span');
    const texts = Array.from(plusSigns).map((s) => s.textContent);
    expect(texts.includes('+')).toBe(true);
    expect(texts.includes('-')).toBe(true);
  });
});

/* ---------- ChangedFilesPanel ---------- */

describe('ChangedFilesPanel', () => {
  test('renders header and all file paths', () => {
    render(<ChangedFilesPanel files={sessionTimelineChangedFiles} />);
    expect(screen.getByText('Changed Files')).toBeTruthy();
    expect(screen.getByText('src/auth/jwt.rs')).toBeTruthy();
    expect(screen.getByText('src/auth/middleware.rs')).toBeTruthy();
    expect(screen.getByText('src/auth/mod.rs')).toBeTruthy();
    expect(screen.getByText('src/config/auth.toml')).toBeTruthy();
    expect(screen.getByText('tests/auth_test.rs')).toBeTruthy();
  });

  test('shows addition and deletion counts', () => {
    render(<ChangedFilesPanel files={sessionTimelineChangedFiles} />);
    expect(screen.getByText('+142')).toBeTruthy();
    expect(screen.getByText('-23')).toBeTruthy();
  });

  test('does not render deletion count when zero', () => {
    const files: TimelineChangedFile[] = [
      { path: 'new-file.rs', additions: 50, deletions: 0, status: 'added' },
    ];
    render(<ChangedFilesPanel files={files} />);
    expect(screen.getByText('+50')).toBeTruthy();
    expect(screen.queryByText('-0')).toBeNull();
  });

  test('renders empty list when no files', () => {
    render(<ChangedFilesPanel files={[]} />);
    expect(screen.getByText('Changed Files')).toBeTruthy();
  });
});
