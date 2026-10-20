import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Tabs from "./Tabs.svelte";

const meta = {
	title: "Components/Tabs",
	component: Tabs,
	tags: ["autodocs"],
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: {
		ariaLabel: "Приключения и сцены",
		items: [{ value: "adventure", label: "Приключения" }, { value: "scene", label: "Сцены" }],
		value: "adventure",
		accentColor: "var(--ds-adventure)",
	},
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light", accentColor: "var(--ds-adventure-light)" } };
export const Scenes: Story = { args: { value: "scene", accentColor: "var(--ds-scene)" } };
export const Disabled: Story = { args: { items: [{ value: "adventure", label: "Приключения" }, { value: "scene", label: "Сцены", disabled: true }] } };
export const LongLabels: Story = { args: { items: [{ value: "adventure", label: "Приключения и путешествия" }, { value: "scene", label: "Самостоятельные сцены" }, { value: "archive", label: "Архив" }] } };
