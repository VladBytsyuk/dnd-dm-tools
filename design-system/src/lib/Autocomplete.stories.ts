import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Autocomplete from "./Autocomplete.svelte";

const meta = {
	title: "Components/Autocomplete",
	component: Autocomplete,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: { label: "Кампания", placeholder: "Кампания", options: [{ value: "Культ Вазрона", label: "Культ Вазрона" }, { value: "Хроники Подземья", label: "Хроники Подземья" }] },
} satisfies Meta<typeof Autocomplete>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const Selected: Story = { args: { value: "Культ Вазрона" } };
export const Empty: Story = { args: { options: [] } };
