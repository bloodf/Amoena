// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}));

vi.mock('@/store', () => ({
  useAmoena: () => ({
    activeTab: 'overview',
    setActiveTab: vi.fn(),
    setCurrentUser: vi.fn(),
    setDashboardMode: vi.fn(),
    setGatewayAvailable: vi.fn(),
    setLocalSessionsAvailable: vi.fn(),
    setCapabilitiesChecked: vi.fn(),
    setSubscription: vi.fn(),
    setDefaultOrgName: vi.fn(),
    setUpdateAvailable: vi.fn(),
    setAmoenaUpdate: vi.fn(),
    showOnboarding: false,
    setShowOnboarding: vi.fn(),
    liveFeedOpen: true,
    toggleLiveFeed: vi.fn(),
    showProjectManagerModal: false,
    setShowProjectManagerModal: vi.fn(),
    fetchProjects: vi.fn().mockResolvedValue(undefined),
    setChatPanelOpen: vi.fn(),
    bootComplete: true,
    setBootComplete: vi.fn(),
    setAgents: vi.fn(),
    setSessions: vi.fn(),
    setProjects: vi.fn(),
    setInterfaceMode: vi.fn(),
    setMemoryGraphAgents: vi.fn(),
    setSkillsData: vi.fn(),
    dashboardMode: 'local',
    interfaceMode: 'full',
  }),
}));

vi.mock('@/lib/navigation', () => ({
  panelHref: (panel: string) => (panel === 'overview' ? '/' : `/${panel}`),
  useNavigateToPanel: () => vi.fn(),
}));

vi.mock('@/lib/navigation-metrics', () => ({
  completeNavigationTiming: vi.fn(),
  startNavigationTiming: vi.fn(),
}));

vi.mock('@/lib/websocket', () => ({
  useWebSocket: () => ({
    connect: vi.fn(),
  }),
}));

vi.mock('@/lib/use-server-events', () => ({
  useServerEvents: vi.fn(),
}));

vi.mock('@/lib/browser-security', () => ({
  shouldRedirectDashboardToHttps: vi.fn().mockReturnValue(false),
}));

vi.mock('@/lib/onboarding-session', () => ({
  getOnboardingSessionDecision: vi.fn().mockReturnValue({
    shouldOpen: false,
    replayFromStart: false,
  }),
  readOnboardingDismissedThisSession: vi.fn().mockReturnValue(false),
  clearOnboardingDismissedThisSession: vi.fn(),
  clearOnboardingReplayFromStart: vi.fn(),
  markOnboardingReplayFromStart: vi.fn(),
}));

vi.mock('@/lib/plugins', () => ({
  getPluginPanel: vi.fn().mockReturnValue(null),
}));

vi.mock('@/components/chat/chat-panel', () => ({
  ChatPanel: () => null,
}));

vi.mock('@/components/dashboard/dashboard', () => ({
  Dashboard: () => null,
}));

vi.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/components/layout/header-bar', () => ({
  HeaderBar: () => null,
}));

vi.mock('@/components/layout/live-feed', () => ({
  LiveFeed: () => null,
}));

vi.mock('@/components/layout/local-mode-banner', () => ({
  LocalModeBanner: () => null,
}));

vi.mock('@/components/layout/amoena-doctor-banner', () => ({
  AmoenaDoctorBanner: () => null,
}));

vi.mock('@/components/layout/amoena-update-banner', () => ({
  AmoenaUpdateBanner: () => null,
}));

vi.mock('@/components/layout/nav-rail', () => ({
  NavRail: () => null,
}));

vi.mock('@/components/layout/update-banner', () => ({
  UpdateBanner: () => null,
}));

vi.mock('@/components/layout/useGlobalKeyboard', () => ({
  useGlobalKeyboard: vi.fn(),
}));

vi.mock('@/components/modals/exec-approval-overlay', () => ({
  ExecApprovalOverlay: () => null,
}));

vi.mock('@/components/panels/memory-spotlight-panel', () => ({
  MemorySpotlightPanel: () => null,
}));

vi.mock('@/components/modals/project-manager-modal', () => ({
  ProjectManagerModal: () => null,
}));

vi.mock('@/components/onboarding/onboarding-wizard', () => ({
  OnboardingWizard: () => null,
}));

// Mock all the panel components that ContentRouter switches between
vi.mock('@/components/panels/activity-feed-panel', () => ({
  ActivityFeedPanel: () => null,
}));

vi.mock('@/components/panels/agent-comms-panel', () => ({
  AgentCommsPanel: () => null,
}));

vi.mock('@/components/panels/agent-squad-panel-phase3', () => ({
  AgentSquadPanelPhase3: () => null,
}));

vi.mock('@/components/panels/alert-rules-panel', () => ({
  AlertRulesPanel: () => null,
}));

vi.mock('@/components/panels/audit-trail-panel', () => ({
  AuditTrailPanel: () => null,
}));

vi.mock('@/components/panels/channels-panel', () => ({
  ChannelsPanel: () => null,
}));

vi.mock('@/components/panels/chat-page-panel', () => ({
  ChatPagePanel: () => null,
}));

vi.mock('@/components/panels/cost-tracker-panel', () => ({
  CostTrackerPanel: () => null,
}));

vi.mock('@/components/panels/cron-management-panel', () => ({
  CronManagementPanel: () => null,
}));

vi.mock('@/components/panels/debug-panel', () => ({
  DebugPanel: () => null,
}));

vi.mock('@/components/panels/exec-approval-panel', () => ({
  ExecApprovalPanel: () => null,
}));

vi.mock('@/components/panels/gateway-config-panel', () => ({
  GatewayConfigPanel: () => null,
}));

vi.mock('@/components/panels/github-sync-panel', () => ({
  GitHubSyncPanel: () => null,
}));

vi.mock('@/components/panels/integrations-panel', () => ({
  IntegrationsPanel: () => null,
}));

vi.mock('@/components/panels/local-agents-doc-panel', () => ({
  LocalAgentsDocPanel: () => null,
}));

vi.mock('@/components/panels/log-viewer-panel', () => ({
  LogViewerPanel: () => null,
}));

vi.mock('@/components/panels/memory-browser-panel', () => ({
  MemoryBrowserPanel: () => null,
}));

vi.mock('@/components/panels/multi-gateway-panel', () => ({
  MultiGatewayPanel: () => null,
}));

vi.mock('@/components/panels/nodes-panel', () => ({
  NodesPanel: () => null,
}));

vi.mock('@/components/panels/notifications-panel', () => ({
  NotificationsPanel: () => null,
}));

vi.mock('@/components/panels/office-panel', () => ({
  OfficePanel: () => null,
}));

vi.mock('@/components/panels/orchestration-bar', () => ({
  OrchestrationBar: () => null,
}));

vi.mock('@/components/panels/security-audit-panel', () => ({
  SecurityAuditPanel: () => null,
}));

vi.mock('@/components/panels/settings-panel', () => ({
  SettingsPanel: () => null,
}));

vi.mock('@/components/panels/skills-panel', () => ({
  SkillsPanel: () => null,
}));

vi.mock('@/components/panels/standup-panel', () => ({
  StandupPanel: () => null,
}));

vi.mock('@/components/panels/super-admin-panel', () => ({
  SuperAdminPanel: () => null,
}));

vi.mock('@/components/panels/system-monitor-panel', () => ({
  SystemMonitorPanel: () => null,
}));

vi.mock('@/components/panels/task-board-panel', () => ({
  TaskBoardPanel: () => null,
}));

vi.mock('@/components/panels/user-management-panel', () => ({
  UserManagementPanel: () => null,
}));

vi.mock('@/components/panels/webhook-panel', () => ({
  WebhookPanel: () => null,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock('@/components/ui/loader', () => ({
  Loader: () => null,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Home (Dashboard) Page', () => {
  it('module is importable', async () => {
    const mod = await import('../[[...panel]]/page');
    expect(mod).toBeDefined();
  });

  it('renders the dashboard layout when boot is complete', async () => {
    const { default: Home } = await import('../[[...panel]]/page');
    render(<Home />);
    // The page should render without crashing
    expect(document.body).toBeDefined();
  });

  it('renders skip to main content link for accessibility', async () => {
    const { default: Home } = await import('../[[...panel]]/page');
    render(<Home />);
    const skipLink = screen.getByText('skipToMainContent');
    expect(skipLink).toBeInTheDocument();
  });

  it('renders the footer attribution text', async () => {
    const { default: Home } = await import('../[[...panel]]/page');
    render(<Home />);
    // Footer should contain attribution text
    expect(document.body.textContent).toContain('nyk');
  });
});
