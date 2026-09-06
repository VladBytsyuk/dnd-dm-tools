import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { ChevronRight } from "./index";
import TextBlock from "./TextBlock.svelte";

const text = "Барховые весла можно использовать как дробящее оружие или использовать для нанесения ударов зубцом на 1к4 колющего урона.";

const meta = {
	title: "Components/TextBlock",
	component: TextBlock,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof TextBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
	args: { title: "Заголовок", text, icon: ChevronRight, expanded: true },
};

export const Collapsed: Story = {
	args: { title: "Заголовок", text, icon: ChevronRight, expanded: false },
};

export const AlwaysExpanded: Story = {
	args: { title: "Заголовок", text },
};

export const OnlyText: Story = {
	args: { text },
};

export const Editable: Story = {
	args: { title: "Заголовок", text, icon: ChevronRight, editable: true },
};
