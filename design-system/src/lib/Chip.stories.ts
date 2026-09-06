import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { Sword } from "./index";
import Chip from "./Chip.svelte";

const meta = {
	title: "Components/Chip",
	component: Chip,
	parameters: { layout: "padded" },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

const defaultArgs = {
	text: "1 действие",
	icon: Sword,
	iconTooltip: "Требует одно действие",
};

export const Dark: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { ...defaultArgs, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { ...defaultArgs, theme: "light" },
};

export const TextOnly: Story = { args: { text: "1 действие", theme: "dark" } };

export const Editable: Story = {
	args: { ...defaultArgs, theme: "dark", editable: true },
};

export const LongText: Story = {
	args: { text: "1 действие. Вы начинаете со следующим снаряжением в дополнение к снаряжению, полученному за вашу предысторию", icon: Sword, iconTooltip: "Требует одно действие", theme: "dark" },
	parameters: { layout: "padded" },
};
