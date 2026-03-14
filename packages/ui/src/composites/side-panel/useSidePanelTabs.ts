import { useEffect, useRef, useState } from "react";
import { defaultSidePanelTabs, type SidePanelTabDef, type SidePanelTabId } from "./data";

export function useSidePanelTabs() {
  const [activeTab, setActiveTab] = useState<SidePanelTabId>("files");
  const [tabs, setTabs] = useState<SidePanelTabDef[]>(defaultSidePanelTabs);
  const [visibleCount, setVisibleCount] = useState(tabs.length);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragItem = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const available = container.clientWidth - 32;
      const count = Math.max(1, Math.floor(available / 70));
      setVisibleCount(Math.min(count, tabs.length));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [tabs.length]);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (dragItem.current === null || dragItem.current === index) {
      setDropIndex(null);
      return;
    }
    setDropIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dropIndex === null) {
      dragItem.current = null;
      setDropIndex(null);
      return;
    }
    const items = [...tabs];
    const dragged = items[dragItem.current];
    items.splice(dragItem.current, 1);
    const insertAt = dropIndex > dragItem.current ? dropIndex - 1 : dropIndex;
    items.splice(insertAt, 0, dragged);
    setTabs(items);
    dragItem.current = null;
    setDropIndex(null);
  };

  const handleDragLeave = () => setDropIndex(null);

  return {
    activeTab,
    tabs,
    visibleCount,
    dropIndex,
    containerRef,
    dragItem,
    setActiveTab,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragLeave,
  };
}
