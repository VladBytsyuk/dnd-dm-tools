import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Footer from "./Footer.svelte";

const meta = {
	title: "Components/Footer",
	component: Footer,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { text: "Волшебник" },
};

export const LongText: Story = {
	args: { text: "Волшебник школы воплощения, использующий тайную магию" },
};

export const Editable: Story = {
	args: { text: "Волшебник", editable: true },
};
