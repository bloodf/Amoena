import { RuntimeProvider, useRuntimeContext } from "./app/runtime-context";
import { DesktopRouter } from "./app/router";
import { LunariaI18nProvider, useLunariaTranslation } from "@lunaria/i18n/react";
import { Titlebar } from "./components/Titlebar";

function RuntimeShell() {
  const runtime = useRuntimeContext();
  const { t } = useLunariaTranslation();

  if (runtime.phase === "connecting") {
    return (
      <main className="bootstrap-shell">
        <section className="bootstrap-card">
          <p className="bootstrap-eyebrow">{t("app.runtimeEyebrow")}</p>
          <h1 className="bootstrap-title">{t("app.title")}</h1>
          <p className="bootstrap-copy">
            {t("app.connecting")}
          </p>
        </section>
      </main>
    );
  }

  if (runtime.phase === "failed") {
    return (
      <main className="bootstrap-shell">
        <section className="bootstrap-card bootstrap-card--error">
          <p className="bootstrap-eyebrow">{t("app.runtimeEyebrow")}</p>
          <h1 className="bootstrap-title">{t("app.bootstrapFailed")}</h1>
          <p className="bootstrap-copy">{runtime.error}</p>
        </section>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Titlebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DesktopRouter />
        <div className="runtime-banner">
          <span>{runtime.health?.status ?? t("app.unknownStatus")}</span>
          <span>{runtime.sessions.length} {t("app.sessionsLabel")}</span>
          <span>{runtime.providers.length} {t("app.providersLabel")}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LunariaI18nProvider locale={typeof navigator !== "undefined" ? navigator.language : "en"}>
      <RuntimeProvider>
        <RuntimeShell />
      </RuntimeProvider>
    </LunariaI18nProvider>
  );
}
