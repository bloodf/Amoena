import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from '../../lib/utils.ts';
import { Button } from '../../primitives/button.tsx';

export function SetupWizardFooter({
  currentStep,
  lastStep,
  onBack,
  onNext,
}: {
  currentStep: number;
  lastStep: number;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
      <Button
        onClick={onBack}
        disabled={currentStep === 0}
        variant="ghost"
        className={cn(
          "gap-1.5 text-[13px]",
          currentStep === 0 ? "cursor-not-allowed text-muted-foreground/50" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        )}
      >
        <ChevronLeft size={14} /> Back
      </Button>
      <div className="flex items-center gap-2">
        {currentStep > 0 && currentStep < lastStep ? (
          <Button onClick={onNext} variant="ghost" className="text-[13px] text-muted-foreground hover:text-foreground">
            Skip
          </Button>
        ) : null}
        {currentStep < lastStep ? (
          <Button onClick={onNext} className="gap-1.5 px-5 text-[13px]">
            {currentStep === 0 ? "Get Started" : "Next"} <ChevronRight size={14} />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
