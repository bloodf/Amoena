import { Suspense, lazy, useState, type ComponentType } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import {
  AppShell,
  CommandPalette,
} from "@lunaria/ui";

function lazyExport<TModule extends Record<string, unknown>>(
  loader: () => Promise<TModule>,
  key: keyof TModule,
) {
  return lazy(async () => ({
    default: (await loader())[key] as ComponentType,
  }));
}

const HomeScreen = lazyExport(() => import("@lunaria/ui"), "HomeScreen");
const SetupWizardScreen = lazyExport(() => import("@lunaria/ui"), "SetupWizardScreen");
const MarketplaceScreen = lazyExport(() => import("@lunaria/ui"), "MarketplaceScreen");
const MemoryBrowserScreen = lazyExport(() => import("@lunaria/ui"), "MemoryBrowserScreen");
const WorkspaceManagerScreen = lazyExport(() => import("@lunaria/ui"), "WorkspaceManagerScreen");
const AutopilotScreen = lazyExport(() => import("@lunaria/ui"), "AutopilotScreen");
const UsageScreen = lazyExport(() => import("@lunaria/ui"), "UsageScreen");
const VisualEditorScreen = lazyExport(() => import("@lunaria/ui"), "VisualEditorScreen");
const AgentManagementScreen = lazyExport(() => import("@lunaria/ui"), "AgentManagementScreen");
const KanbanBoard = lazyExport(() => import("@lunaria/ui"), "KanbanBoard");
const OpinionsScreen = lazyExport(() => import("@lunaria/ui"), "OpinionsScreen");
const RuntimeProviderSetupPage = lazyExport(
  () => import("./provider-setup-page"),
  "RuntimeProviderSetupPage",
);
const RuntimeRemoteAccessPage = lazyExport(
  () => import("./remote-access-page"),
  "RuntimeRemoteAccessPage",
);
const RuntimeSessionWorkspacePage = lazyExport(
  () => import("./session-workspace-page"),
  "RuntimeSessionWorkspacePage",
);
const RuntimeSettingsPage = lazyExport(
  () => import("./settings-page"),
  "RuntimeSettingsPage",
);

function RouteFallback() {
  return <div>Loading page...</div>;
}

export function DesktopRouter({
  initialEntries = ["/"],
}: {
  initialEntries?: string[];
}) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AppShell onOpenCommandPalette={() => setCommandPaletteOpen(true)}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/session" element={<RuntimeSessionWorkspacePage />} />
            <Route path="/session/new" element={<RuntimeSessionWorkspacePage />} />
            <Route path="/session/:sessionId" element={<RuntimeSessionWorkspacePage />} />
            <Route path="/providers" element={<RuntimeProviderSetupPage />} />
            <Route path="/remote" element={<RuntimeRemoteAccessPage />} />
            <Route path="/settings" element={<RuntimeSettingsPage />} />
            <Route path="/settings/:section" element={<RuntimeSettingsPage />} />
            <Route path="/setup" element={<SetupWizardScreen />} />
            <Route path="/marketplace" element={<MarketplaceScreen />} />
            <Route path="/memory" element={<MemoryBrowserScreen />} />
            <Route path="/workspaces" element={<WorkspaceManagerScreen />} />
            <Route path="/autopilot" element={<AutopilotScreen />} />
            <Route path="/usage" element={<UsageScreen />} />
            <Route path="/visual-editor" element={<VisualEditorScreen />} />
            <Route path="/agents" element={<AgentManagementScreen />} />
            <Route path="/tasks" element={<KanbanBoard />} />
            <Route path="/opinions" element={<OpinionsScreen />} />
            <Route path="*" element={<HomeScreen />} />
          </Routes>
        </Suspense>
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      </AppShell>
    </MemoryRouter>
  );
}
