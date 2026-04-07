import { type ReactNode, useState } from 'react';
import { SidebarRail } from './SidebarRail';
import { StatusBar } from './StatusBar';
import { Breadcrumb } from './Breadcrumb';
import { useIsMobile } from '../hooks/use-mobile.tsx';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils.ts';

export function AppShell({
  children,
  onOpenCommandPalette,
}: {
  children: ReactNode;
  onOpenCommandPalette?: () => void;
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-surface-0">
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={cn(
            isMobile
              ? 'fixed inset-y-0 left-0 z-50 transition-transform duration-200'
              : 'flex-shrink-0',
            isMobile && !sidebarOpen && '-translate-x-full',
          )}
        >
          <SidebarRail
            onOpenCommandPalette={onOpenCommandPalette}
            onNavigate={() => isMobile && setSidebarOpen(false)}
          />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <div className="flex items-center border-b border-border bg-surface-0 flex-shrink-0">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={sidebarOpen}
                className="flex items-center justify-center w-8 h-8 ml-1 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px]"
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
            <Breadcrumb />
          </div>
          <main
            className="flex-1 overflow-hidden bg-surface-1"
            role="main"
            aria-label={t('ui.applicationContent')}
          >
            {children}
          </main>
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
