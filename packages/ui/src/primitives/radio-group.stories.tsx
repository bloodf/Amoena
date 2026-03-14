import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";

const meta = {
  title: "Primitives/RadioGroup",
  component: RadioGroup,
  args: {
    defaultValue: "comfortable",
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1" className="flex gap-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="h1" />
        <Label htmlFor="h1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="h2" />
        <Label htmlFor="h2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="h3" />
        <Label htmlFor="h3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1" disabled>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="d1" />
        <Label htmlFor="d1">Selected (disabled)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="d2" />
        <Label htmlFor="d2">Unselected (disabled)</Label>
      </div>
    </RadioGroup>
  ),
};

export const WithManyOptions: Story = {
  render: () => (
    <RadioGroup defaultValue="gpt-4">
      {[
        { value: "gpt-4", label: "GPT-4" },
        { value: "gpt-3.5", label: "GPT-3.5 Turbo" },
        { value: "claude-3", label: "Claude 3 Opus" },
        { value: "gemini", label: "Gemini Pro" },
        { value: "llama", label: "Llama 3" },
        { value: "mistral", label: "Mistral Large" },
      ].map((model) => (
        <div key={model.value} className="flex items-center space-x-2">
          <RadioGroupItem value={model.value} id={model.value} />
          <Label htmlFor={model.value}>{model.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};
