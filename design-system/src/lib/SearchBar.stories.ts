import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { ChevronRight, Copy, EditSquare, Filters, Search, Trash } from "./index";
import SearchBar from "./SearchBar.svelte";

const meta = {
	title: "Components/SearchBar",
	component: SearchBar,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
	},
} satisfies Meta<typeof SearchBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Dark: Story = {
	globals: {
		backgrounds: { value: "dark" },
	},
	args: {
		theme: "dark",
		searchIcon: Search,
		leadingAction: { icon: ChevronRight, label: "Назад" },
		actions: [
			{ icon: Copy, label: "Копировать" },
			{ icon: EditSquare, label: "Редактировать" },
			{ icon: Trash, label: "Удалить" },
			{ icon: Filters, label: "Фильтры" },
		],
	},
};

export const Light: Story = {
	globals: {
		backgrounds: { value: "light" },
	},
	args: {
		theme: "light",
		searchIcon: Search,
		leadingAction: { icon: ChevronRight, label: "Назад" },
		actions: [
			{ icon: Copy, label: "Копировать" },
			{ icon: EditSquare, label: "Редактировать" },
			{ icon: Trash, label: "Удалить" },
			{ icon: Filters, label: "Фильтры" },
		],
	},
};

export const Minimal: Story = {
	args: {
		placeholder: "Поиск",
	},
};
