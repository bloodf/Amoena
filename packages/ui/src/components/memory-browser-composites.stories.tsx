import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryAddForm } from "@/composites/memory-browser/MemoryAddForm";
import { MemoryBrowserHeader } from "@/composites/memory-browser/MemoryBrowserHeader";
import { MemoryDetailPanel } from "@/composites/memory-browser/MemoryDetailPanel";
import { MemoryEntryList } from "@/composites/memory-browser/MemoryEntryList";
import { MemoryFilters } from "@/composites/memory-browser/MemoryFilters";
import { initialMemoryEntries } from "@/composites/memory-browser/data";

const meta = {
  title: "Components/Memory Browser",
} satisfies Meta;

export default meta;

export const Header: StoryObj = {
  render: () => <MemoryBrowserHeader viewMode="list" onAdd={() => {}} onExport={() => {}} onViewModeChange={() => {}} />,
};

export const Filters: StoryObj = {
  render: () => (
    <div className="w-[360px] bg-background">
      <MemoryFilters
        searchQuery=""
        filterType="all"
        filterSource="all"
        filterScope="all"
        onSearchChange={() => {}}
        onTypeChange={() => {}}
        onSourceChange={() => {}}
        onScopeChange={() => {}}
      />
    </div>
  ),
};

export const EntryList: StoryObj = {
  render: () => (
    <div className="w-[360px] bg-background">
      <MemoryEntryList entries={initialMemoryEntries} selectedKey={initialMemoryEntries[0].key} onSelect={() => {}} />
    </div>
  ),
};

export const Detail: StoryObj = {
  render: () => (
    <div className="max-w-[760px] bg-background p-6">
      <MemoryDetailPanel
        entry={initialMemoryEntries[0]}
        confirmDelete={null}
        onTogglePin={() => {}}
        onExport={() => {}}
        onAskDelete={() => {}}
        onCancelDelete={() => {}}
        onConfirmDelete={() => {}}
        onConvertToPersistent={() => {}}
      />
    </div>
  ),
};

export const AddForm: StoryObj = {
  render: () => (
    <div className="max-w-[760px] bg-background p-6">
      <MemoryAddForm
        keyValue="memory.key"
        value="Example memory content"
        type="manual"
        onKeyChange={() => {}}
        onValueChange={() => {}}
        onTypeChange={() => {}}
        onAdd={() => {}}
        onCancel={() => {}}
      />
    </div>
  ),
};
