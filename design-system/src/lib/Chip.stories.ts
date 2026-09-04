import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { Sword } from "./index";
import Chip from "./Chip.svelte";

const meta = {
	title: "Components/Chip",
	component: Chip,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { text: "1 действие", icon: Sword, iconTooltip: "Требует одно действие" },
};

export const TextOnly: Story = { args: { text: "1 действие" } };

export const Editable: Story = {
	args: { text: "1 действие", icon: Sword, iconTooltip: "Требует одно действие", editable: true },
};

export const LongText: Story = {
	args: { text: "1 действие. Вы начинаете со следующим снаряжением в дополнение к снаряжению, полученному за вашу предысторию", icon: Sword, iconTooltip: "Требует одно действие" },
	parameters: { layout: "padded" },
};
