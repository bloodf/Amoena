export function AutopilotGoalSection({
  goalText,
  editingGoal,
  onToggleEditing,
  onChangeGoal,
}: {
  goalText: string;
  editingGoal: boolean;
  onToggleEditing: () => void;
  onChangeGoal: (value: string) => void;
}) {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Current Goal</h3>
        <button onClick={onToggleEditing} className="text-[10px] text-primary cursor-pointer hover:text-primary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors">
          {editingGoal ? "Save" : "Edit"}
        </button>
      </div>
      {editingGoal ? (
        <textarea value={goalText} onChange={(event) => onChangeGoal(event.target.value)} className="w-full bg-surface-2 rounded p-3 border border-primary text-[13px] text-foreground resize-none h-24 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors" />
      ) : (
        <div className="text-[13px] text-foreground bg-surface-2 rounded p-3 border border-border">{goalText}</div>
      )}
    </div>
  );
}
