import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { ChevronRight } from "./index";
import FilledTextBlock from "./FilledTextBlock.svelte";

const text = "Барховые весла можно использовать как дробящее оружие или использовать для нанесения ударов зубцом на 1к4 колющего урона.";

const meta = {
	title: "Components/FilledTextBlock",
	component: FilledTextBlock,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof FilledTextBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
	args: { title: "Заголовок", text, icon: ChevronRight, expanded: true },
};

export const AlwaysExpanded: Story = {
	args: { title: "Заголовок", text },
};

export const Collapsed: Story = {
	args: { title: "Заголовок", text, icon: ChevronRight, expanded: false },
};

export const OnlyText: Story = {
	args: { text },
};

export const Editable: Story = {
	args: { title: "Заголовок", text, icon: ChevronRight, editable: true },
};

export const CustomBackground: Story = {
	args: { title: "Заголовок", text, background: "#4b6f98" },
};
