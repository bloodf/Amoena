import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ScreenRoot } from "@/components/screen";
import { setupWizardProviders } from "@/composites/setup-wizard/data";
import { SetupWizardFooter } from "@/composites/setup-wizard/SetupWizardFooter";
import { SetupWizardProgress } from "@/composites/setup-wizard/SetupWizardProgress";
import {
  SetupWizardBackendStep,
  SetupWizardCompatStep,
  SetupWizardMemoryStep,
  SetupWizardModelStep,
  SetupWizardProfileStep,
  SetupWizardProviderStep,
  SetupWizardWelcomeStep,
} from "@/composites/setup-wizard/SetupWizardSteps";

export function SetupWizardScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [mode, setMode] = useState("native");
  const [apiKey, setApiKey] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [defaultModel, setDefaultModel] = useState("claude-4-sonnet");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [reasoningMode, setReasoningMode] = useState("auto");
  const [keybindingPreset, setKeybindingPreset] = useState("Default");
  const [selectedProvider, setSelectedProvider] = useState(0);
  const navigate = useNavigate();

  const handleTest = () => {
    setTestStatus("testing");
    setTimeout(() => {
      if (apiKey.length >= 10) {
        setTestStatus("success");
        toast.success("Connection verified");
      } else {
        setTestStatus("error");
        toast.error("Connection failed — check your API key");
      }
    }, 1200);
  };

  const handleLaunch = () => {
    toast.success("Lunaria is ready!");
    navigate("/");
  };

  return (
    <ScreenRoot className="flex items-center justify-center bg-background">
      <div className="w-full max-w-[640px] px-6">
        <SetupWizardProgress currentStep={currentStep} onSelect={setCurrentStep} />

        <div className="min-h-[360px]">
          {currentStep === 0 ? <SetupWizardWelcomeStep /> : null}

          {currentStep === 1 ? (
            <SetupWizardProviderStep
              selectedProvider={selectedProvider}
              apiKey={apiKey}
              testStatus={testStatus}
              onSelectProvider={(index) => {
                setSelectedProvider(index);
                setTestStatus("idle");
              }}
              onApiKeyChange={(value) => {
                setApiKey(value);
                setTestStatus("idle");
              }}
              onTest={handleTest}
            />
          ) : null}

          {currentStep === 2 ? (
            <SetupWizardModelStep
              defaultModel={defaultModel}
              onDefaultModelChange={setDefaultModel}
            />
          ) : null}

          {currentStep === 3 ? (
            <SetupWizardBackendStep
              mode={mode}
              onModeChange={setMode}
            />
          ) : null}

          {currentStep === 4 ? (
            <SetupWizardMemoryStep
              memoryEnabled={memoryEnabled}
              onMemoryEnabledChange={setMemoryEnabled}
            />
          ) : null}

          {currentStep === 5 ? (
            <SetupWizardProfileStep
              theme={theme}
              reasoningMode={reasoningMode}
              keybindingPreset={keybindingPreset}
              onThemeChange={setTheme}
              onReasoningModeChange={setReasoningMode}
              onKeybindingPresetChange={setKeybindingPreset}
            />
          ) : null}

          {currentStep === 6 ? (
            <SetupWizardCompatStep onLaunch={handleLaunch} />
          ) : null}
        </div>

        <SetupWizardFooter currentStep={currentStep} lastStep={6} onBack={() => setCurrentStep(Math.max(0, currentStep - 1))} onNext={() => setCurrentStep(currentStep + 1)} />
      </div>
    </ScreenRoot>
  );
}
