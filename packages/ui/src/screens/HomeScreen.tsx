import { useState } from "react";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/primitives/button";
import {
  ScreenActions,
  ScreenContainer,
  ScreenHeader,
  ScreenHeaderText,
  ScreenRoot,
  ScreenStack,
  ScreenSubtitle,
  ScreenTitle,
} from "@/components/screen";
import { HomeQuickActions } from "@/composites/home/HomeQuickActions";
import { homeProviders, homeQuickTips, homeRecentSessions, homeWorkspaces } from "@/composites/home/data";
import { HomeQuickTipsPanel } from "@/composites/home/HomeQuickTipsPanel";
import { HomeRecentSessionsPanel } from "@/composites/home/HomeRecentSessionsPanel";
import { HomeSystemHealthPanel } from "@/composites/home/HomeSystemHealthPanel";
import { HomeWorkspacesPanel } from "@/composites/home/HomeWorkspacesPanel";

export function HomeScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = homeRecentSessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenRoot>
      <ScreenContainer className="max-w-[960px]">
        <ScreenStack className="space-y-8">
          <ScreenHeader>
            <ScreenHeaderText>
              <ScreenTitle className="mb-1 text-xl">Welcome back</ScreenTitle>
              <ScreenSubtitle className="text-[13px]">Pick up where you left off, or start something new.</ScreenSubtitle>
            </ScreenHeaderText>
            <ScreenActions>
              <Button onClick={() => navigate("/session/new")} className="h-9 text-[13px]">
                <Zap size={14} />
                New Session
              </Button>
            </ScreenActions>
          </ScreenHeader>

          <HomeQuickActions
            onContinueSession={() => navigate("/session")}
            onOpenWorkspace={() => navigate("/workspaces")}
            onStartAutopilot={() => navigate("/autopilot")}
            onProviderSetup={() => navigate("/providers")}
            onSetupWizard={() => navigate("/setup")}
          />

          <HomeRecentSessionsPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sessions={filteredSessions}
            onOpenSession={() => navigate("/session")}
          />

          <HomeWorkspacesPanel
            workspaces={homeWorkspaces}
            onViewAll={() => navigate("/workspaces")}
            onOpenWorkspace={() => navigate("/workspaces")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HomeSystemHealthPanel providers={homeProviders} onOpenProvider={() => navigate("/providers")} />
            <HomeQuickTipsPanel tips={homeQuickTips} />
          </div>
        </ScreenStack>
      </ScreenContainer>
    </ScreenRoot>
  );
}
