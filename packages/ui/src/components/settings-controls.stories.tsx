import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  SettingsRow,
  SettingsToggle,
  SettingsSelect,
  SettingsNumberInput,
  SettingsSectionTitle,
  SettingsInfoBanner,
  SettingsWarningBanner,
} from "./settings-controls";

const meta: Meta = {
  title: "Components/SettingsControls",
  component: SettingsRow,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="max-w-lg p-4">
      <SettingsInfoBanner>Settings changes are saved automatically.</SettingsInfoBanner>

      <SettingsSectionTitle title="General" />
      <SettingsRow label="Dark mode" description="Use dark theme throughout the app">
        <SettingsToggle on />
      </SettingsRow>
      <SettingsRow label="Language">
        <SettingsSelect options={["English", "Spanish", "French"]} defaultValue="English" />
      </SettingsRow>
      <SettingsRow label="Font size" description="Base font size in pixels">
        <SettingsNumberInput defaultValue={14} />
      </SettingsRow>

      <SettingsSectionTitle title="Notifications" />
      <SettingsRow label="Email alerts">
        <SettingsToggle />
      </SettingsRow>

      <SettingsWarningBanner>Some changes may require a restart.</SettingsWarningBanner>
    </div>
  ),
};

export const ToggleStates: Story = {
  render: () => (
    <div className="flex gap-4 p-4">
      <SettingsToggle on />
      <SettingsToggle on={false} />
    </div>
  ),
};

export const SelectControl: Story = {
  render: () => (
    <div className="p-4">
      <SettingsSelect options={["Small", "Medium", "Large"]} defaultValue="Medium" />
    </div>
  ),
};
