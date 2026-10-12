import type { Meta, StoryObj } from "@storybook/svelte-vite";
import ProgressBar from "./ProgressBar.svelte";

const meta = {
	title: "Components/ProgressBar",
	component: ProgressBar,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	argTypes: {
		value: { control: { type: "range", min: 0, max: 100, step: 1 } },
	},
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
	args: { value: 65 },
};

export const Disabled: Story = {
	args: { value: 65, disabled: true },
};
