import { cn } from "@/lib/utils";

import { setupWizardSteps } from "./data";

export function SetupWizardProgress({
  currentStep,
  onSelect,
}: {
  currentStep: number;
  onSelect: (stepIndex: number) => void;
}) {
  return (
    <div className="mb-10 flex items-center justify-center gap-2">
      {setupWizardSteps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2">
          <button
            onClick={() => index <= currentStep && onSelect(index)}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all",
              index < currentStep && "cursor-pointer bg-primary",
              index === currentStep && "bg-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
              index > currentStep && "bg-surface-3",
            )}
          />
          {index < setupWizardSteps.length - 1 ? (
            <div className={cn("h-[1px] w-8", index < currentStep ? "bg-primary" : "bg-surface-3")} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
