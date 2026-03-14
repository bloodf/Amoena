export interface CheckpointRecord {
  id: string;
  label: string;
  timestamp: string;
  tokensUsed: string;
  filesChanged: number;
  isCurrent: boolean;
  branch?: string;
  children?: CheckpointRecord[];
  /** When set, this checkpoint renders as a compaction marker instead of a normal node. */
  compaction?: {
    observationCount: number;
  };
}

export interface TimelineChangedFile {
  path: string;
  additions: number;
  deletions: number;
  status: "modified" | "added";
}
