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

export const Dark: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { text: "Волшебник", theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { text: "Волшебник", theme: "light" },
};

export const Default: Story = {
	args: { text: "Волшебник", theme: "dark" },
};

export const LongText: Story = {
	args: { text: "Волшебник школы воплощения, использующий тайную магию", theme: "dark" },
};

export const Editable: Story = {
	args: { text: "Волшебник", theme: "dark", editable: true },
};
