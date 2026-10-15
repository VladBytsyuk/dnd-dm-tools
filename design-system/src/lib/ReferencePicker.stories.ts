import type { Meta, StoryObj } from "@storybook/svelte-vite";
import ReferencePicker from "./ReferencePicker.svelte";

const meta = {
	title: "Components/ReferencePicker",
	component: ReferencePicker,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: { label: "Приключение", placeholder: "Выбрать приключение", options: [{ value: "cult", label: "Культ Вазрона" }, { value: "shamat", label: "Дорога в Шамат" }] },
} satisfies Meta<typeof ReferencePicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const Selected: Story = { args: { value: "cult" } };
export const Empty: Story = { args: { options: [] } };
