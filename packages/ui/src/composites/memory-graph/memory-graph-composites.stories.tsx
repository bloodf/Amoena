import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryGraphLegend } from "./MemoryGraphLegend";
import { memoryGraphSourceColors } from "./data";

const meta: Meta<typeof MemoryGraphLegend> = {
	title: "Composites/MemoryGraph/MemoryGraphLegend",
	component: MemoryGraphLegend,
};
export default meta;
type Story = StoryObj<typeof MemoryGraphLegend>;

export const Default: Story = {
	args: {
		sourceColors: memoryGraphSourceColors,
	},
};

export const CustomColors: Story = {
	args: {
		sourceColors: {
			inference: "hsl(200, 80%, 60%)",
			embedding: "hsl(30, 90%, 55%)",
			retrieval: "hsl(280, 70%, 50%)",
		},
	},
};

export const SingleSource: Story = {
	args: {
		sourceColors: {
			manual: "hsl(var(--green))",
		},
	},
};
