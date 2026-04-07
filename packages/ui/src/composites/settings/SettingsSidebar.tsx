import { cn } from '../../lib/utils.ts';
import { SectionHeading } from '../../components/patterns.tsx';

import { settingsSections } from "./data";

export function SettingsSidebar({
  activeSection,
  onSelect,
}: {
  activeSection: string;
  onSelect: (sectionId: string) => void;
}) {
  return (
    <>
      <SectionHeading className="mb-2 px-3">Settings</SectionHeading>
      {settingsSections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSelect(section.id)}
          className={cn(
            "flex w-full items-center gap-2 rounded px-3 py-2 text-[13px] transition-colors",
            activeSection === section.id ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <section.icon size={14} />
          {section.label}
        </button>
      ))}
    </>
  );
}
