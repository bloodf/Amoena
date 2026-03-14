import { ChevronRight } from "lucide-react";
import { ScreenNavButton, ScreenNavSection, ScreenSidebar } from "@/components/screen";
import type { Opinion } from "./data";

export function OpinionsSidebar({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: { name: string; opinions: Opinion[] }[];
  selectedCategory: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ScreenSidebar className="w-[200px] p-0">
      <div className="p-3">
        <span className="block px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Categories</span>
      </div>
      {categories.map((category, index) => (
        <ScreenNavButton key={category.name} active={selectedCategory === index} onClick={() => onSelect(index)} className="w-full justify-between rounded-none px-3 py-2.5">
          <span className="text-[13px]">{category.name}</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground">{category.opinions.length}</span>
            <ChevronRight size={12} className="text-muted-foreground" />
          </div>
        </ScreenNavButton>
      ))}
    </ScreenSidebar>
  );
}
