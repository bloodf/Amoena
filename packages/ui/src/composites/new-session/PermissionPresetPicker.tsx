import { Shield } from 'lucide-react';
import { cn } from '../../lib/utils.ts';
import type { LabeledOption } from './types';

interface PermissionPresetPickerProps {
  presets: LabeledOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export function PermissionPresetPicker({
  presets,
  selected,
  onSelect,
}: PermissionPresetPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {presets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset.id)}
          className={cn(
            'flex flex-col items-center gap-0.5 rounded border p-2 text-center transition-colors',
            selected === preset.id
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/30',
            preset.id === 'full' && selected === preset.id && 'border-warning bg-warning/5',
          )}
        >
          <Shield
            size={12}
            className={cn(
              (() => {
                if (selected !== preset.id) return 'text-muted-foreground';
                return preset.id === 'full' ? 'text-warning' : 'text-primary';
              })(),
            )}
          />
          <span className="text-[11px] font-medium text-foreground">{preset.label}</span>
          <span className="text-[9px] text-muted-foreground">{preset.desc}</span>
        </button>
      ))}
    </div>
  );
}
