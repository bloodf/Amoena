import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProviderApiKeyRow } from "@/composites/provider-setup/ProviderApiKeyRow";
import { ProviderModelRow } from "@/composites/provider-setup/ProviderModelRow";
import { initialProviders } from "@/composites/provider-setup/config";

const meta = {
  title: "Components/Provider Setup",
} satisfies Meta;

export default meta;

export const ApiKeyRow: StoryObj = {
  render: () => (
    <div className="max-w-[640px] bg-background p-6">
      <ProviderApiKeyRow
        providerName={initialProviders[0].name}
        apiKey={initialProviders[0].apiKey}
        showKey={false}
        testingProvider={null}
        onToggleShowKey={() => {}}
        onApiKeyChange={() => {}}
        onTest={() => {}}
      />
    </div>
  ),
};

export const ModelRow: StoryObj = {
  render: () => (
    <div className="max-w-[760px] bg-background p-6">
      <ProviderModelRow model={initialProviders[0].models[0]} onReasoningModeChange={() => {}} />
    </div>
  ),
};
