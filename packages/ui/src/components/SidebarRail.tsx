import {
  Home,
  MessageSquare,
  PlayCircle,
  Users,
  Brain,
  GitBranch,
  Layout,
  Package,
  SlidersHorizontal,
  Search,
  Sun,
  Moon,
  BarChart3,
  ClipboardList,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils.ts';
import { useTheme } from '../hooks/use-theme.ts';

const topItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageSquare, label: 'Session', path: '/session' },
  { icon: PlayCircle, label: 'Autopilot', path: '/autopilot' },
  { icon: Users, label: 'Agents', path: '/agents' },
  { icon: ClipboardList, label: 'Tasks', path: '/tasks' },
  { icon: Brain, label: 'Memory', path: '/memory' },
  { icon: GitBranch, label: 'Workspaces', path: '/workspaces' },
  { icon: Layout, label: 'Visual Editor', path: '/visual-editor' },
  { icon: Package, label: 'Marketplace', path: '/marketplace' },
  { icon: BarChart3, label: 'Usage', path: '/usage' },
];

const bottomItems = [{ icon: SlidersHorizontal, label: 'Settings', path: '/settings' }];

function SidebarItem({
  icon: Icon,
  label,
  path,
  onNavigate,
}: {
  icon: typeof Home;
  label: string;
  path: string;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={path}
      end={path === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'relative flex items-center h-9 gap-3 px-3 mx-2 rounded-md transition-colors',
          isActive
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
        )
      }
      style={{ width: 'calc(100% - 16px)' }}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-primary rounded-r" />
          )}
          <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="flex-shrink-0" />
          <span
            className={cn('text-[13px] font-medium truncate', isActive ? 'text-foreground' : '')}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export function SidebarRail({
  onOpenCommandPalette,
  onNavigate,
}: {
  onOpenCommandPalette?: () => void;
  onNavigate?: () => void;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-full w-[180px] flex-col border-r border-border bg-surface-0 flex-shrink-0">
      <div className="flex flex-col gap-0.5 pt-3 flex-1 overflow-y-auto">
        {topItems.map((item) => (
          <SidebarItem key={item.path} {...item} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="flex flex-col gap-0.5 pb-3">
        <div className="mx-3 my-1.5">
          <div className="h-px bg-border" />
        </div>

        {bottomItems.map((item) => (
          <SidebarItem key={item.path} {...item} onNavigate={onNavigate} />
        ))}

        <button
          onClick={toggleTheme}
          className="flex items-center h-9 gap-3 px-3 mx-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          style={{ width: 'calc(100% - 16px)' }}
        >
          {theme === 'dark' ? (
            <Sun size={18} strokeWidth={1.5} />
          ) : (
            <Moon size={18} strokeWidth={1.5} />
          )}
          <span className="text-[13px] font-medium">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="flex items-center h-9 gap-3 px-3 mx-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          style={{ width: 'calc(100% - 16px)' }}
        >
          <Search size={18} strokeWidth={1.5} className="flex-shrink-0" />
          <span className="text-[13px] font-medium truncate flex-1 text-left">Search</span>
          <kbd className="text-[9px] font-mono text-muted-foreground/60 bg-surface-2 px-1 py-0.5 rounded border border-border">
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  );
}
