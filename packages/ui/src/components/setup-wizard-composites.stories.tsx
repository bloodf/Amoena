import type { Meta, StoryObj } from "@storybook/react-vite";
import { SetupWizardFooter } from "@/composites/setup-wizard/SetupWizardFooter";
import {
  SetupWizardPreferencesStep,
  SetupWizardProviderStep,
  SetupWizardReadyStep,
  SetupWizardWelcomeStep,
  SetupWizardWorkspaceStep,
} from "@/composites/setup-wizard/SetupWizardSteps";

const meta = {
  title: "Components/Setup Wizard",
} satisfies Meta;

export default meta;

export const Welcome: StoryObj = {
  render: () => <SetupWizardWelcomeStep />,
};

export const Provider: StoryObj = {
  render: () => (
    <SetupWizardProviderStep
      selectedProvider={0}
      apiKey="sk-ant-demo"
      testStatus="idle"
      onSelectProvider={() => {}}
      onApiKeyChange={() => {}}
      onTest={() => {}}
    />
  ),
};

export const Workspace: StoryObj = {
  render: () => <SetupWizardWorkspaceStep defaultModel="claude-4-sonnet" onDefaultModelChange={() => {}} />,
};

export const Preferences: StoryObj = {
  render: () => (
    <SetupWizardPreferencesStep
      theme="dark"
      reasoningMode="auto"
      keybindingPreset="Default"
      onThemeChange={() => {}}
      onReasoningModeChange={() => {}}
      onKeybindingPresetChange={() => {}}
    />
  ),
};

export const Ready: StoryObj = {
  render: () => <SetupWizardReadyStep onLaunch={() => {}} />,
};

export const Footer: StoryObj = {
  render: () => <SetupWizardFooter currentStep={2} lastStep={6} onBack={() => {}} onNext={() => {}} />,
};
