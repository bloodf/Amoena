export interface HomeSessionItem {
  title: string;
  model: string;
  tuiColor: string;
  time: string;
  tokens: string;
  branch: string;
}

export interface HomeWorkspaceItem {
  name: string;
  branch: string;
  disk: string;
  pending: boolean;
}

export interface HomeProviderHealth {
  name: string;
  status: "connected" | "error" | "disconnected";
  color: string;
}

export interface HomeQuickTip {
  tip: string;
  shortcut: string;
}
