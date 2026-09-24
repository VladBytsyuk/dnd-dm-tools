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

const defaultArgs = { title: "Заголовок", text, icon: ChevronRight, expanded: true };

export const Dark: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { ...defaultArgs, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { ...defaultArgs, theme: "light" },
};

export const Expanded: Story = {
	args: { ...defaultArgs, theme: "dark" },
};

export const AlwaysExpanded: Story = {
	args: { title: "Заголовок", text, theme: "dark" },
};

export const Collapsed: Story = {
	args: { title: "Заголовок", text, icon: ChevronRight, expanded: false, theme: "dark" },
};

export const OnlyText: Story = {
	args: { text, theme: "dark" },
};

export const Editable: Story = {
	args: { title: "Заголовок", text, icon: ChevronRight, theme: "dark", editable: true },
};

export const CustomBackground: Story = {
	args: { title: "Заголовок", text, background: "#4b6f98", theme: "dark" },
};
