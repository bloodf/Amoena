import { Check, File, Folder } from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import { SurfacePanel } from '../../components/patterns.tsx';

import type { PaletteGroup, PaletteItem } from './types';

export function ComposerFilePicker({
  files,
  selectedIndex,
  onSelect,
}: {
  files: { path: string; name: string; type: 'file' | 'folder' }[];
  selectedIndex: number;
  onSelect: (file: { path: string; name: string; type: 'file' | 'folder' }) => void;
}) {
  return (
    <SurfacePanel
      className="absolute bottom-full left-3 right-3 z-20 mb-1 max-h-[240px] overflow-y-auto rounded-lg shadow-2xl"
      padding="p-0"
    >
      <div className="border-b border-border px-3 py-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Files & Folders
        </span>
      </div>
      {files.map((file, index) => (
        <button
          key={file.path}
          onClick={() => onSelect(file)}
          className={cn(
            'flex w-full items-center gap-2 px-3 py-2 text-left transition-colors',
            index === selectedIndex
              ? 'bg-primary/10 text-foreground'
              : 'text-muted-foreground hover:bg-surface-2',
          )}
        >
          {file.type === 'file' ? <File size={12} /> : <Folder size={12} />}
          <span className="flex-1 truncate font-mono text-[12px]">{file.path}</span>
          <span className="text-[10px] text-muted-foreground">{file.type}</span>
        </button>
      ))}
    </SurfacePanel>
  );
}

export function ComposerUnifiedPalette({
  groups,
  selectedIndex,
  onSelect,
}: {
  groups: PaletteGroup[];
  selectedIndex: number;
  onSelect: (item: PaletteItem) => void;
}) {
  let flatIndex = -1;
  return (
    <SurfacePanel
      className="absolute bottom-full left-3 right-3 z-20 mb-1 max-h-[400px] overflow-y-auto rounded-lg shadow-2xl"
      padding="p-0"
    >
      {groups.map((group) => (
        <div key={group.category}>
          <div className="sticky top-0 border-b border-border bg-surface-0 px-3 py-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {group.label}
            </span>
          </div>
          {group.items.map((item) => {
            flatIndex++;
            const index = flatIndex;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors',
                  index === selectedIndex ? 'bg-primary/10' : 'hover:bg-surface-2',
                )}
              >
                <span className="flex w-5 flex-shrink-0 items-center justify-center text-muted-foreground">
                  <item.Icon size={14} />
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="font-mono text-[12px] font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">{item.desc}</span>
                </div>
                {item.meta === 'active' ? (
                  <Check size={12} className="flex-shrink-0 text-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </SurfacePanel>
  );
}

export function ComposerSkillsPicker({
  skills,
  selectedIndex,
  onSelect,
}: {
  skills: { name: string; desc: string; Icon: React.ComponentType<{ size: number }> }[];
  selectedIndex: number;
  onSelect: (skill: {
    name: string;
    desc: string;
    Icon: React.ComponentType<{ size: number }>;
  }) => void;
}) {
  return (
    <SurfacePanel
      className="absolute bottom-full left-3 right-3 z-20 mb-1 max-h-[360px] overflow-y-auto rounded-lg shadow-2xl"
      padding="p-0"
    >
      <div className="border-b border-border px-3 py-2">
        <span className="text-[11px] font-mono text-muted-foreground">Skills</span>
      </div>
      {skills.map((skill, index) => (
        <button
          key={skill.name}
          onClick={() => onSelect(skill)}
          className={cn(
            'flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors',
            index === selectedIndex ? 'bg-primary/10' : 'hover:bg-surface-2',
          )}
        >
          <span className="flex w-5 items-center justify-center text-muted-foreground">
            <skill.Icon size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-[12px] font-medium text-foreground">{skill.name}</span>
            <span className="ml-2 truncate text-[11px] text-muted-foreground">{skill.desc}</span>
          </div>
        </button>
      ))}
    </SurfacePanel>
  );
}
