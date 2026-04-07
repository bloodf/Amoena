import { Search } from "lucide-react";
import { Input } from '../../primitives/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../primitives/select.tsx';

export function MemoryFilters({
  searchQuery,
  filterType,
  filterSource,
  filterScope,
  onSearchChange,
  onTypeChange,
  onSourceChange,
  onScopeChange,
}: {
  searchQuery: string;
  filterType: string;
  filterSource: string;
  filterScope: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onScopeChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2 border-b border-border p-3">
      <div className="relative">
        <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search memory..." className="pl-8 font-mono text-[12px]" />
      </div>
      <div className="flex gap-1.5">
        <Select value={filterType} onValueChange={onTypeChange}>
          <SelectTrigger className="flex-1 bg-surface-2 text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="summary">Summary</SelectItem>
            <SelectItem value="code_pattern">Code Pattern</SelectItem>
            <SelectItem value="architecture">Architecture</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={onSourceChange}>
          <SelectTrigger className="flex-1 bg-surface-2 text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterScope} onValueChange={onScopeChange}>
          <SelectTrigger className="flex-1 bg-surface-2 text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scopes</SelectItem>
            <SelectItem value="global">Global</SelectItem>
            <SelectItem value="workspace">Workspace</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
