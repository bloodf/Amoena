import { useSidePanelTabs } from '../composites/side-panel/useSidePanelTabs.ts';
import { FilesTab } from '../composites/side-panel/FilesTab.tsx';
import { AgentsTab } from '../composites/side-panel/AgentsTab.tsx';
import { MemoryTab } from '../composites/side-panel/MemoryTab.tsx';
import { TimelineTab } from '../composites/side-panel/TimelineTab.tsx';
import { SidePanelTabBar } from '../composites/side-panel/SidePanelTabBar.tsx';

interface SessionSidePanelProps {
  onOpenFile?: (fileName: string) => void;
}

export function SessionSidePanel({ onOpenFile }: SessionSidePanelProps) {
  const { activeTab, tabs, visibleCount, dropIndex, containerRef, dragItem, setActiveTab, handleDragStart, handleDragOver, handleDragEnd, handleDragLeave } =
    useSidePanelTabs();

  return (
    <div className="flex flex-col h-full bg-surface-0">
      <SidePanelTabBar
        tabs={tabs}
        activeTab={activeTab}
        visibleCount={visibleCount}
        dropIndex={dropIndex}
        dragIndex={dragItem.current}
        containerRef={containerRef}
        onSelect={setActiveTab}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragLeave={handleDragLeave}
      />

      <div className="flex-1 overflow-hidden">
        {activeTab === "files" && <FilesTab onOpenFile={onOpenFile || (() => {})} />}
        {activeTab === "agents" && <AgentsTab />}
        {activeTab === "memory" && <MemoryTab />}
        {activeTab === "timeline" && <TimelineTab />}
      </div>
    </div>
  );
}
