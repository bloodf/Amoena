import { cn } from "@/lib/utils";

interface ModelPickerProps {
  models: string[];
  selectedModel: string;
  onSelect: (model: string) => void;
}

export function ModelPicker({ models, selectedModel, onSelect }: ModelPickerProps) {
  return (
    <div className="flex gap-2">
      {models.map((model) => (
        <button
          key={model}
          onClick={() => onSelect(model)}
          className={cn(
            "flex-1 rounded border px-3 py-2 text-center text-[12px] transition-colors",
            selectedModel === model
              ? "border-primary bg-primary/5 font-medium text-foreground"
              : "border-border text-muted-foreground hover:border-primary/30",
          )}
        >
          {model}
        </button>
      ))}
    </div>
  );
}
