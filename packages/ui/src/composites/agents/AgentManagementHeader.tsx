import { ExternalLink, Plus } from "lucide-react";

import { Button } from '../../primitives/button.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../primitives/select.tsx';
import { ScreenActions, ScreenHeader, ScreenHeaderText, ScreenSubtitle, ScreenTitle, ScreenToolbar } from '../../components/screen.tsx';

import { managedAgentDivisionFilters, managedAgentSourceFilters, managedAgentStatusFilters } from "./data";
import { divisionColors } from "./config";

export function AgentManagementHeader({
  filterSource,
  filterStatus,
  filterDivision,
  onFilterSourceChange,
  onFilterStatusChange,
  onFilterDivisionChange,
  onImportAgent,
  onAddAgent,
}: {
  filterSource: string;
  filterStatus: string;
  filterDivision: string;
  onFilterSourceChange: (value: string) => void;
  onFilterStatusChange: (value: string) => void;
  onFilterDivisionChange: (value: string) => void;
  onImportAgent: () => void;
  onAddAgent: () => void;
}) {
  return (
    <ScreenHeader className="border-b border-border p-4">
      <ScreenHeaderText>
        <ScreenTitle>Agent Management</ScreenTitle>
        <ScreenSubtitle>Inspect agent hierarchy, sources, permissions, and current session bindings.</ScreenSubtitle>
        <ScreenToolbar className="mt-3">
          <Select value={filterSource} onValueChange={onFilterSourceChange}>
            <SelectTrigger className="h-8 w-[130px] bg-surface-2 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {managedAgentSourceFilters.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={onFilterStatusChange}>
            <SelectTrigger className="h-8 w-[130px] bg-surface-2 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {managedAgentStatusFilters.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDivision} onValueChange={onFilterDivisionChange}>
            <SelectTrigger className="h-8 w-[140px] bg-surface-2 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {managedAgentDivisionFilters.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ScreenToolbar>
        <div className="mt-3 flex flex-wrap gap-2">
          {managedAgentDivisionFilters.map((option) => {
            const divisionColor =
              option.id !== "all" ? divisionColors[option.id as keyof typeof divisionColors] : undefined;
            const isActive = filterDivision === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onFilterDivisionChange(option.id)}
                className="rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors"
                style={{
                  borderColor: isActive ? divisionColor ?? "#64748B" : "transparent",
                  backgroundColor: isActive
                    ? `${divisionColor ?? "#64748B"}22`
                    : "#1E293B",
                  color: isActive ? divisionColor ?? "#E2E8F0" : "#CBD5E1",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </ScreenHeaderText>
      <ScreenActions>
        <Button onClick={onImportAgent} variant="outline" size="sm" className="h-8 text-[12px]">
          <ExternalLink size={12} />
          Import
        </Button>
        <Button onClick={onAddAgent} variant="outline" size="sm" className="h-8 border-primary text-[12px] text-primary hover:bg-primary/10">
          <Plus size={12} />
          New Agent
        </Button>
      </ScreenActions>
    </ScreenHeader>
  );
}
