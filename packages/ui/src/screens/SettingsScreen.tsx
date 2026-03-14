import { useNavigate, useParams } from "react-router-dom";
import { ScreenMain, ScreenRoot, ScreenSidebarLayout, ScreenTitle } from "@/components/screen";
import { settingsSections } from "@/composites/settings/data";
import { SettingsContentPane, isEmbeddedSettingsSection } from "@/composites/settings/SettingsContentPane";
import { SettingsSidebar } from "@/composites/settings/SettingsSidebar";

export function SettingsScreen() {
  const { section } = useParams();
  const navigate = useNavigate();
  const active = section || "general";
  const isEmbeddedScreen = isEmbeddedSettingsSection(active);

  return (
    <ScreenRoot className="overflow-hidden">
      <ScreenSidebarLayout>
        <SettingsSidebar activeSection={active} onSelect={(id) => navigate(`/settings/${id}`)} />
        {isEmbeddedScreen ? (
          <ScreenMain className="overflow-hidden">
            <SettingsContentPane activeSection={active} />
          </ScreenMain>
        ) : (
          <ScreenMain className="overflow-y-auto p-6">
            <ScreenTitle className="mb-6">{settingsSections.find(s => s.id === active)?.label}</ScreenTitle>
            <SettingsContentPane activeSection={active} />
          </ScreenMain>
        )}
      </ScreenSidebarLayout>
    </ScreenRoot>
  );
}
