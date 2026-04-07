import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

const routeLabels: Record<string, string> = {
  "": "Home",
  "session": "Session",
  "autopilot": "Autopilot",
  "agents": "Agents",
  "memory": "Memory",
  "workspaces": "Workspaces",
  "visual-editor": "Visual Editor",
  "marketplace": "Marketplace",
  "remote": "Remote Access",
  "opinions": "Opinions",
  "settings": "Settings",
  "providers": "Providers",
  "setup": "Setup Wizard",
  "usage": "Usage & Tokens",
  "new": "New Session",
  "teams": "Teams",
  "tasks": "Task Board",
  "general": "General",
  "editor": "Editor",
  "terminal": "Terminal",
  "session-settings": "Session",
  "privacy": "Privacy",
  "advanced": "Advanced",
  "memory-settings": "Memory",
  "permissions": "Permissions",
  "plugins": "Plugins",
  "themes": "Themes",
  "keybindings": "Keybindings",
  "notifications": "Notifications",
  "workspace": "Workspace / Git",
};

export function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const isHome = segments.length === 0;

  return (
    <div className="flex h-8 items-center gap-1.5 bg-surface-0 px-3 flex-shrink-0 flex-1">
      <Link
        to="/"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home size={13} strokeWidth={1.8} />
      </Link>
      {!isHome &&
        segments.map((segment, i) => {
          const path = `/${  segments.slice(0, i + 1).join("/")}`;
          const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
          const isLast = i === segments.length - 1;

          return (
            <Fragment key={path}>
              <ChevronRight size={12} className="text-muted-foreground/50" />
              {isLast ? (
                <span className="text-[12px] font-medium text-foreground">{label}</span>
              ) : (
                <Link
                  to={path}
                  className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              )}
            </Fragment>
          );
        })}
    </div>
  );
}
