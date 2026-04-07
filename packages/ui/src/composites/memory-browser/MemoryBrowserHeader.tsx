import { Download, List, Network, Plus } from 'lucide-react';
import { Button } from '../../primitives/button.tsx';
import {
  ScreenActions,
  ScreenDescription,
  ScreenHeader,
  ScreenHeaderCopy,
  ScreenTitle,
} from '../../components/screen.tsx';

export function MemoryBrowserHeader({
  viewMode,
  onAdd,
  onExport,
  onViewModeChange,
}: {
  viewMode: 'list' | 'graph';
  onAdd: () => void;
  onExport: () => void;
  onViewModeChange: (mode: 'list' | 'graph') => void;
}) {
  return (
    <ScreenHeader className="border-b border-border px-4 py-2">
      <ScreenHeaderCopy>
        <ScreenTitle className="text-[13px]">Memory Browser</ScreenTitle>
        <ScreenDescription className="text-[11px]">
          Browse, pin, and manage structured memory.
        </ScreenDescription>
      </ScreenHeaderCopy>
      <ScreenActions>
        <Button
          onClick={onAdd}
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-[11px] text-primary"
        >
          <Plus size={11} /> Add Memory
        </Button>
        <Button onClick={onExport} variant="outline" size="sm" className="h-7 gap-1.5 text-[11px]">
          <Download size={11} /> Export
        </Button>
        <div className="flex items-center gap-1 rounded bg-surface-2 p-0.5">
          <Button
            onClick={() => onViewModeChange('list')}
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 gap-1.5 text-[11px]"
          >
            <List size={12} /> List
          </Button>
          <Button
            onClick={() => onViewModeChange('graph')}
            variant={viewMode === 'graph' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 gap-1.5 text-[11px]"
          >
            <Network size={12} /> Graph
          </Button>
        </div>
      </ScreenActions>
    </ScreenHeader>
  );
}
