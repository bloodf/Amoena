import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ScreenMain,
  ScreenRoot,
  ScreenSidebarLayout,
  ScreenTitle,
  SettingsInfoBanner,
  SettingsRow,
  SettingsSelect,
  SettingsToggle,
} from "@lunaria/ui";
import { SettingsSidebar } from "@/composites/settings/SettingsSidebar";

import { useRuntimeApi } from "./runtime-api";
import { RuntimeProviderSetupPage } from "./provider-setup-page";
import { RuntimeRemoteAccessPage } from "./remote-access-page";

type PluginRecord = {
  id: string;
  name: string;
  version?: string | null;
  enabled: boolean;
  healthStatus: string;
  capabilities: string[];
};

type InstallReviewIntent = {
  id: string;
  source: string;
  trusted: boolean;
  warnings: string[];
  manifestUrl?: string | null;
  title?: string | null;
};

type SettingsPayload = {
  remoteAccess?: {
    enabled: boolean;
    lanEnabled: boolean;
    relayEnabled: boolean;
    relayEndpoint: string;
  };
  settings?: Record<string, unknown>;
};

function PluginsPanel() {
  const { request } = useRuntimeApi();
  const [plugins, setPlugins] = useState<PluginRecord[]>([]);
  const [deeplink, setDeeplink] = useState("");
  const [review, setReview] = useState<InstallReviewIntent | null>(null);

  async function hydrate() {
    const nextPlugins = await request<PluginRecord[]>("/api/v1/plugins");
    setPlugins(nextPlugins);
  }

  useEffect(() => {
    void hydrate();
  }, []);

  return (
    <div className="space-y-4">
      <ScreenTitle className="mb-4">Plugins / Extensions</ScreenTitle>
      <div className="space-y-3">
        {plugins.map((plugin) => (
          <div key={plugin.id} className="rounded border border-border p-3">
            <SettingsRow
              label={plugin.name}
              description={`v${plugin.version ?? "0.0.0"} · ${plugin.healthStatus} · ${plugin.capabilities.join(", ")}`}
            >
              <SettingsToggle
                on={plugin.enabled}
                onChange={async (enabled) => {
                  await request<void>(`/api/v1/plugins/${plugin.id}`, {
                    method: "POST",
                    body: JSON.stringify({ enabled }),
                  });
                  await hydrate();
                }}
              />
            </SettingsRow>
          </div>
        ))}
      </div>

      <div className="rounded border border-border p-4">
        <div className="mb-2 text-sm font-medium text-foreground">Install Review</div>
        <textarea
          value={deeplink}
          onChange={(event) => setDeeplink(event.target.value)}
          className="min-h-24 w-full rounded border border-border bg-surface-2 p-3 text-xs text-foreground"
          placeholder="lunaria://plugin/install?id=my-plugin&source=registry&manifestUrl=https://example.com/manifest.json&signature=..."
        />
        <div className="mt-3 flex gap-2">
          <button
            className="rounded border border-primary px-3 py-1.5 text-xs text-primary"
            onClick={async () => {
              const nextReview = await request<InstallReviewIntent>("/api/v1/plugins/install-review", {
                method: "POST",
                body: JSON.stringify({ deeplink }),
              });
              setReview(nextReview);
            }}
          >
            Review Deeplink
          </button>
        </div>
        {review ? (
          <div className="mt-4 rounded border border-border bg-surface-1 p-3 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">{review.title ?? review.id}</div>
            <div>{review.source}</div>
            <div>{review.manifestUrl ?? "No manifest URL"}</div>
            <div>{review.trusted ? "Trusted" : "Untrusted"}</div>
            <div>{review.warnings.join(", ") || "No warnings"}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function GeneralPanel() {
  const { request } = useRuntimeApi();
  const [settings, setSettings] = useState<SettingsPayload | null>(null);

  useEffect(() => {
    void request<SettingsPayload>("/api/v1/settings").then(setSettings);
  }, []);

  const remoteEnabled = settings?.remoteAccess?.enabled ?? false;
  const relayEnabled = settings?.remoteAccess?.relayEnabled ?? false;

  return (
    <div className="space-y-4">
      <ScreenTitle className="mb-4">General</ScreenTitle>
      <SettingsInfoBanner>
        These settings are backed by the local runtime and persist through the same configuration stack as the desktop backend.
      </SettingsInfoBanner>
      <SettingsRow label="Remote access" description="Enable paired-device access to the runtime">
        <SettingsToggle
          on={remoteEnabled}
          onChange={async (enabled) => {
            await request<void>("/api/v1/settings", {
              method: "POST",
              body: JSON.stringify({
                values: {
                  "remote_access.enabled": enabled,
                },
              }),
            });
            setSettings((previous) =>
              previous
                ? {
                    ...previous,
                    remoteAccess: {
                      ...previous.remoteAccess!,
                      enabled,
                    },
                  }
                : previous,
            );
          }}
        />
      </SettingsRow>
      <SettingsRow label="Relay endpoint" description="Preferred relay endpoint for remote access">
        <span className="font-mono text-xs text-muted-foreground">
          {settings?.remoteAccess?.relayEndpoint ?? "relay.lunaria.app"}
        </span>
      </SettingsRow>
      <SettingsRow label="Relay transport" description="Allow relay-backed remote access">
        <SettingsToggle
          on={relayEnabled}
          onChange={async (enabled) => {
            await request<void>("/api/v1/settings", {
              method: "POST",
              body: JSON.stringify({
                values: {
                  "remote_access.relay.enabled": enabled,
                },
              }),
            });
            setSettings((previous) =>
              previous
                ? {
                    ...previous,
                    remoteAccess: {
                      ...previous.remoteAccess!,
                      relayEnabled: enabled,
                    },
                  }
                : previous,
            );
          }}
        />
      </SettingsRow>
      <SettingsRow label="Transcript format" description="Runtime transcript persistence format">
        <SettingsSelect options={["jsonl"]} defaultValue="jsonl" />
      </SettingsRow>
    </div>
  );
}

function WizardPanel() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <ScreenTitle className="mb-4">Setup Wizard</ScreenTitle>
      <SettingsInfoBanner>
        Re-run the setup wizard to reconfigure providers, workspace defaults, memory, and compatibility imports.
      </SettingsInfoBanner>
      <button
        className="rounded border border-primary px-3 py-1.5 text-xs text-primary"
        onClick={() => navigate("/setup")}
      >
        Re-open Setup Wizard
      </button>
    </div>
  );
}

export function RuntimeSettingsPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const active = section ?? "general";

  const content = useMemo(() => {
    if (active === "providers") return <RuntimeProviderSetupPage />;
    if (active === "remote") return <RuntimeRemoteAccessPage />;
    if (active === "plugins") return <PluginsPanel />;
    if (active === "advanced") return <WizardPanel />;
    return <GeneralPanel />;
  }, [active]);

  return (
    <ScreenRoot className="overflow-hidden">
      <ScreenSidebarLayout>
        <SettingsSidebar
          activeSection={active}
          onSelect={(id) => navigate(`/settings/${id}`)}
        />
        <ScreenMain className="overflow-y-auto p-6">{content}</ScreenMain>
      </ScreenSidebarLayout>
    </ScreenRoot>
  );
}
