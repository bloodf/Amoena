import { useState } from "react";
import { MemoryGraphView } from "@/components/MemoryGraphView";
import { toast } from "sonner";
import { MemoryBrowserHeader } from "@/composites/memory-browser/MemoryBrowserHeader";
import { MemoryAddForm } from "@/composites/memory-browser/MemoryAddForm";
import { MemoryFilters } from "@/composites/memory-browser/MemoryFilters";
import { MemoryEntryList } from "@/composites/memory-browser/MemoryEntryList";
import { MemoryDetailPanel } from "@/composites/memory-browser/MemoryDetailPanel";
import { initialMemoryEntries } from "@/composites/memory-browser/data";
import type { MemoryEntry, MemoryType } from "@/composites/memory-browser/types";

export function MemoryBrowserScreen() {
  const [entries, setEntries] = useState(initialMemoryEntries);
  const [selected, setSelected] = useState<string | null>(entries[0].key);
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterScope, setFilterScope] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<MemoryType>("manual");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const selectedEntry = entries.find(e => e.key === selected);

  const filtered = entries.filter(e => {
    if (filterType !== "all" && e.type !== filterType) return false;
    if (filterSource !== "all" && e.source !== filterSource) return false;
    if (filterScope !== "all" && e.scope !== filterScope) return false;
    if (searchQuery && !e.key.toLowerCase().includes(searchQuery.toLowerCase()) && !e.value.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const togglePin = (key: string) => {
    setEntries(prev => prev.map(e => e.key === key ? { ...e, pinned: !e.pinned } : e));
    toast.success(entries.find(e => e.key === key)?.pinned ? "Unpinned" : "Pinned");
  };

  const deleteEntry = (key: string) => {
    setEntries(prev => prev.filter(e => e.key !== key));
    if (selected === key) setSelected(null);
    setConfirmDelete(null);
    toast.success("Memory deleted");
  };

  const addEntry = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const entry: MemoryEntry = {
      key: newKey, source: "manual", scope: "workspace", value: newValue,
      timestamp: "Just now", size: `${newValue.length}B`, type: newType, pinned: false,
    };
    setEntries(prev => [...prev, entry]);
    setSelected(newKey);
    setShowAddForm(false);
    setNewKey("");
    setNewValue("");
    toast.success("Memory added");
  };

  const exportMemory = () => {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "lunaria-memory.json"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Memory exported");
  };

  const convertToPersistent = (key: string) => {
    setEntries(prev => prev.map(e => e.key === key ? { ...e, scope: "global", pinned: true } : e));
    toast.success("Converted to persistent memory");
  };

  return (
    <div className="flex h-full flex-col">
      <MemoryBrowserHeader viewMode={viewMode} onAdd={() => setShowAddForm(true)} onExport={exportMemory} onViewModeChange={setViewMode} />

      {showAddForm ? (
        <MemoryAddForm
          keyValue={newKey}
          value={newValue}
          type={newType}
          onKeyChange={setNewKey}
          onValueChange={setNewValue}
          onTypeChange={setNewType}
          onAdd={addEntry}
          onCancel={() => setShowAddForm(false)}
        />
      ) : null}

      {viewMode === "graph" ? (
        <div className="flex-1 overflow-hidden">
          <MemoryGraphView onSelectNode={(key) => setSelected(key)} />
        </div>
      ) : (
        <div className="flex h-full flex-1 overflow-hidden">
          <div className="w-[280px] md:w-[360px] border-r border-border flex-shrink-0 flex flex-col">
            <MemoryFilters
              searchQuery={searchQuery}
              filterType={filterType}
              filterSource={filterSource}
              filterScope={filterScope}
              onSearchChange={setSearchQuery}
              onTypeChange={setFilterType}
              onSourceChange={setFilterSource}
              onScopeChange={setFilterScope}
            />
            <div className="flex-1 overflow-y-auto">
              <MemoryEntryList entries={sorted} selectedKey={selected} onSelect={setSelected} />
            </div>
          </div>

          <div className="flex-1 p-6">
            <MemoryDetailPanel
              entry={selectedEntry ?? null}
              confirmDelete={confirmDelete}
              onTogglePin={togglePin}
              onExport={exportMemory}
              onAskDelete={setConfirmDelete}
              onCancelDelete={() => setConfirmDelete(null)}
              onConfirmDelete={deleteEntry}
              onConvertToPersistent={convertToPersistent}
            />
          </div>
        </div>
      )}
    </div>
  );
}
