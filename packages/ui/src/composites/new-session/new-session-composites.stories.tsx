import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";

import type { LabeledOption } from "./types";
import {
  newSessionWorkTargets,
  newSessionProviders,
  newSessionReasoningDepths,
  newSessionPermissionPresets,
} from "./data";
import { ContextDropzone } from "./ContextDropzone";
import { ModelPicker } from "./ModelPicker";
import { NewSessionFieldLabel } from "./NewSessionFieldLabel";
import { NewSessionModalFooter } from "./NewSessionModalFooter";
import { NewSessionModalHeader } from "./NewSessionModalHeader";
import { PermissionPresetPicker } from "./PermissionPresetPicker";
import { ProviderPicker } from "./ProviderPicker";
import { ReasoningControls } from "./ReasoningControls";
import { SessionOptionGrid } from "./SessionOptionGrid";
import {
  FeaturedProviderCard,
  ExternalProviderCard,
} from "./ProviderCard";

const meta: Meta = {
  title: "Composites/NewSession",
};
export default meta;
type Story = StoryObj;

const featuredProvider = newSessionProviders.find((p) => p.featured)!;
const externalProvider = newSessionProviders.find((p) => !p.featured)!;

/* ------------------------------------------------------------------ */
/*  ContextDropzone                                                    */
/* ------------------------------------------------------------------ */

export const DropzoneDefault: Story = {
  render: () => <ContextDropzone />,
};

/* ------------------------------------------------------------------ */
/*  ModelPicker                                                        */
/* ------------------------------------------------------------------ */

export const ModelPickerDefault: Story = {
  render: () => (
    <ModelPicker
      models={featuredProvider.models}
      selectedModel={featuredProvider.models[0]}
      onSelect={fn()}
    />
  ),
};

export const ModelPickerAlternateSelection: Story = {
  render: () => (
    <ModelPicker
      models={featuredProvider.models}
      selectedModel={featuredProvider.models[featuredProvider.models.length - 1]}
      onSelect={fn()}
    />
  ),
};

export const ModelPickerSingleModel: Story = {
  render: () => (
    <ModelPicker
      models={[featuredProvider.models[0]]}
      selectedModel={featuredProvider.models[0]}
      onSelect={fn()}
    />
  ),
};

/* ------------------------------------------------------------------ */
/*  NewSessionFieldLabel                                               */
/* ------------------------------------------------------------------ */

export const FieldLabelDefault: Story = {
  render: () => <NewSessionFieldLabel>Provider</NewSessionFieldLabel>,
};

export const FieldLabelLong: Story = {
  render: () => (
    <NewSessionFieldLabel>Reasoning Depth Configuration</NewSessionFieldLabel>
  ),
};

/* ------------------------------------------------------------------ */
/*  NewSessionModalFooter                                              */
/* ------------------------------------------------------------------ */

export const FooterDefault: Story = {
  render: () => <NewSessionModalFooter onClose={fn()} onCreate={fn()} />,
};

/* ------------------------------------------------------------------ */
/*  NewSessionModalHeader                                              */
/* ------------------------------------------------------------------ */

export const HeaderDefault: Story = {
  render: () => <NewSessionModalHeader onClose={fn()} />,
};

/* ------------------------------------------------------------------ */
/*  PermissionPresetPicker                                             */
/* ------------------------------------------------------------------ */

export const PermissionsDefault: Story = {
  render: () => (
    <PermissionPresetPicker
      presets={newSessionPermissionPresets}
      selected="default"
      onSelect={fn()}
    />
  ),
};

export const PermissionsFullAccess: Story = {
  render: () => (
    <PermissionPresetPicker
      presets={newSessionPermissionPresets}
      selected="full"
      onSelect={fn()}
    />
  ),
};

export const PermissionsReadOnly: Story = {
  render: () => (
    <PermissionPresetPicker
      presets={newSessionPermissionPresets}
      selected="read-only"
      onSelect={fn()}
    />
  ),
};

/* ------------------------------------------------------------------ */
/*  ProviderPicker                                                     */
/* ------------------------------------------------------------------ */

export const ProviderPickerDefault: Story = {
  render: () => (
    <ProviderPicker
      providers={newSessionProviders}
      selectedProvider={newSessionProviders[0].id}
      onSelect={fn()}
    />
  ),
};

export const ProviderPickerAlternateSelection: Story = {
  render: () => (
    <ProviderPicker
      providers={newSessionProviders}
      selectedProvider={newSessionProviders[2].id}
      onSelect={fn()}
    />
  ),
};

export const ProviderPickerFewProviders: Story = {
  render: () => (
    <ProviderPicker
      providers={newSessionProviders.slice(0, 2)}
      selectedProvider={newSessionProviders[0].id}
      onSelect={fn()}
    />
  ),
};

/* ------------------------------------------------------------------ */
/*  ReasoningControls                                                  */
/* ------------------------------------------------------------------ */

export const ReasoningDefault: Story = {
  render: () => (
    <ReasoningControls
      mode="standard"
      depth="medium"
      depths={newSessionReasoningDepths}
      onModeChange={fn()}
      onDepthChange={fn()}
    />
  ),
};

export const ReasoningHighDepth: Story = {
  render: () => (
    <ReasoningControls
      mode="extended"
      depth="high"
      depths={newSessionReasoningDepths}
      onModeChange={fn()}
      onDepthChange={fn()}
    />
  ),
};

export const ReasoningLowDepth: Story = {
  render: () => (
    <ReasoningControls
      mode="standard"
      depth="low"
      depths={newSessionReasoningDepths}
      onModeChange={fn()}
      onDepthChange={fn()}
    />
  ),
};

/* ------------------------------------------------------------------ */
/*  SessionOptionGrid                                                  */
/* ------------------------------------------------------------------ */

export const OptionGridDefault: Story = {
  render: () => (
    <SessionOptionGrid
      options={newSessionWorkTargets}
      selected={newSessionWorkTargets[0].id}
      onSelect={fn()}
    />
  ),
};

export const OptionGridMiddleSelected: Story = {
  render: () => (
    <SessionOptionGrid
      options={newSessionWorkTargets}
      selected={newSessionWorkTargets[1].id}
      onSelect={fn()}
    />
  ),
};

export const OptionGridCustomColumns: Story = {
  render: () => (
    <SessionOptionGrid
      options={newSessionWorkTargets}
      selected={newSessionWorkTargets[2].id}
      columns="repeat(2, 1fr)"
      onSelect={fn()}
    />
  ),
};

/* ------------------------------------------------------------------ */
/*  FeaturedProviderCard                                               */
/* ------------------------------------------------------------------ */

export const FeaturedCardDefault: Story = {
  render: () => (
    <FeaturedProviderCard provider={featuredProvider} onSelect={fn()} />
  ),
};

export const FeaturedCardAlternate: Story = {
  render: () => {
    const alt = newSessionProviders.filter((p) => p.featured)[1] ?? featuredProvider;
    return <FeaturedProviderCard provider={alt} onSelect={fn()} />;
  },
};

/* ------------------------------------------------------------------ */
/*  ExternalProviderCard                                               */
/* ------------------------------------------------------------------ */

export const ExternalCardDefault: Story = {
  render: () => (
    <ExternalProviderCard provider={externalProvider} onSelect={fn()} />
  ),
};

export const ExternalCardAlternate: Story = {
  render: () => {
    const alt = newSessionProviders.filter((p) => !p.featured)[1] ?? externalProvider;
    return <ExternalProviderCard provider={alt} onSelect={fn()} />;
  },
};
