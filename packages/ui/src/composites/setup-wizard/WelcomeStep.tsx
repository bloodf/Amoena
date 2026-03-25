import { Sparkles } from "lucide-react";
import { SurfacePanel } from "@/components/patterns";
import { setupWizardWelcomeFeatures } from "./data";

export function SetupWizardWelcomeStep() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
        <Sparkles size={28} className="text-primary" />
      </div>
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">Welcome to Amoena</h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Your AI-native development environment. Let&apos;s configure the essentials to get you productive in minutes.
        </p>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3 text-left">
        {setupWizardWelcomeFeatures.map((feature) => (
          <SurfacePanel key={feature.label} className="space-y-1.5" padding="p-3">
            <div className="text-[12px] font-medium text-foreground">{feature.label}</div>
            <div className="text-[11px] text-muted-foreground">{feature.desc}</div>
          </SurfacePanel>
        ))}
      </div>
    </div>
  );
}
