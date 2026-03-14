import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchField, ToolbarGroup, FilterGroup, CompactSelect, ViewModeToggle } from "./control-bar";

const meta: Meta = {
  title: "Components/ControlBar",
  component: SearchField,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <SearchField value="" onChange={() => {}} placeholder="Search items..." />
      <ToolbarGroup>
        <FilterGroup label="Status:">
          <CompactSelect value="all" onChange={() => {}}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </CompactSelect>
        </FilterGroup>
        <ViewModeToggle
          options={[
            { id: "grid", icon: <span>▦</span>, label: "Grid" },
            { id: "list", icon: <span>☰</span>, label: "List" },
          ]}
          value="grid"
          onChange={() => {}}
        />
      </ToolbarGroup>
    </div>
  ),
};

export const SearchWithValue: Story = {
  render: () => (
    <div className="max-w-sm p-4">
      <SearchField value="query" onChange={() => {}} placeholder="Search..." onClear={() => {}} />
    </div>
  ),
};

export const FilterControls: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <FilterGroup label="Type:">
        <CompactSelect value="all" onChange={() => {}}>
          <option value="all">All</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
        </CompactSelect>
      </FilterGroup>
    </div>
  ),
};
