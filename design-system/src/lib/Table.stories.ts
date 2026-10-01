import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Table from "./Table.svelte";

const meta = {
	title: "Components/Table",
	component: Table,
	parameters: { layout: "padded" },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

const values = [
	"КД", "Хиты", "Скорость", "СИЛ", "ЛОВ", "ТЕЛ", "ИНТ", "МДР",
	"15", "45", "30 фт.", "+2", "+1", "+3", "−1", "+0",
	"13", "22", "40 фт.", "+0", "+3", "+1", "+2", "+1",
	"17", "88", "25 фт.", "+4", "−1", "+3", "+0", "+2",
	"12", "18", "30 фт.", "−1", "+2", "+0", "+1", "+3",
	"16", "64", "35 фт.", "+3", "+1", "+2", "+0", "−1",
];

const defaultArgs = { columns: 8, values, accentColor: "#d4d4d4" };

export const Dark: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { ...defaultArgs, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { ...defaultArgs, theme: "light" },
};

export const Editable: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { ...defaultArgs, theme: "dark", editable: true },
};
