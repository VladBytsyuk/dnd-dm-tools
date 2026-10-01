import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { Hourglasses, Sword } from "./index";
import ChipsList from "./ChipsList.svelte";

const meta = {
	title: "Components/ChipsList",
	component: ChipsList,
	parameters: { layout: "padded" },
} satisfies Meta<typeof ChipsList>;

export default meta;

type Story = StoryObj<typeof meta>;

const chips = [
	{ text: "1 действие", icon: Sword, iconTooltip: "Требует одно действие" },
	{ text: "Концентрация", icon: Hourglasses, iconTooltip: "Требует концентрации" },
	{ text: "1 действие", icon: Sword, iconTooltip: "Требует одно действие" },
	{
		text: "1 действие. Вы начинаете со следующим снаряжением в дополнение к снаряжению, полученному за вашу предысторию",
		icon: Sword,
		iconTooltip: "Требует одно действие",
	},
];

export const Dark: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { chips, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { chips, theme: "light" },
};

export const Editable: Story = {
	args: {
		chips,
		theme: "dark",
		editable: true,
	},
};
