import { Input } from "@/primitives/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";

export function PropertiesPanel({
  selectedComponent,
  properties,
  propValues,
  editingProp,
  onPropChange,
  onStartEditing,
  onStopEditing,
}: {
  selectedComponent: string;
  properties: readonly { label: string; value: string; type: string; options?: readonly string[] }[];
  propValues: Record<string, string>;
  editingProp: string | null;
  onPropChange: (label: string, value: string) => void;
  onStartEditing: (label: string) => void;
  onStopEditing: () => void;
}) {
  return (
    <div className="flex w-[240px] flex-shrink-0 flex-col overflow-y-auto border-l border-border">
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Properties</h3>
        <span className="font-mono text-[10px] text-primary">{selectedComponent}</span>
      </div>

      <div className="space-y-0.5 p-3">
        <h4 className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Layout</h4>
        {properties.map((property) => (
          <div key={property.label} className="flex items-center justify-between py-1.5">
            <span className="font-mono text-[11px] text-muted-foreground">{property.label}</span>
            {property.type === "select" ? (
              <Select value={propValues[property.label]} onValueChange={(value) => onPropChange(property.label, value)}>
                <SelectTrigger className="h-7 w-24 bg-surface-2 px-2 py-0.5 font-mono text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {property.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={propValues[property.label]}
                onChange={(event) => onPropChange(property.label, event.target.value)}
                onFocus={() => onStartEditing(property.label)}
                onBlur={onStopEditing}
                className={`h-7 w-24 border px-2 py-0.5 text-right font-mono text-[11px] ${editingProp === property.label ? "border-primary" : "border-border"}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-0.5 border-t border-border p-3">
        <h4 className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Spacing</h4>
        <div className="grid grid-cols-2 gap-2">
          {["margin-top", "margin-right", "margin-bottom", "margin-left"].map((spacing) => (
            <div key={spacing} className="flex items-center gap-1">
              <span className="flex-1 truncate font-mono text-[9px] text-muted-foreground">{spacing.replace("margin-", "m-")}</span>
              <Input defaultValue="0" className="h-6 w-12 px-1.5 py-0.5 text-right font-mono text-[10px]" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-0.5 border-t border-border p-3">
        <h4 className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Typography</h4>
        {[
          { label: "font-size", value: "14px" },
          { label: "font-weight", value: "400" },
          { label: "line-height", value: "1.5" },
          { label: "color", value: "inherit" },
        ].map((property) => (
          <div key={property.label} className="flex items-center justify-between py-1">
            <span className="font-mono text-[10px] text-muted-foreground">{property.label}</span>
            <Input defaultValue={property.value} className="h-6 w-20 px-2 py-0.5 text-right font-mono text-[10px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
