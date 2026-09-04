import type { Meta, StoryObj } from "@storybook/svelte-vite";
import ImageGroup from "./ImageGroup.svelte";

const image = (color: string, label: string) =>
	`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="12" fill="${color}"/><text x="64" y="70" fill="white" font-family="sans-serif" font-size="22" text-anchor="middle">${label}</text></svg>`)}`;

const meta = {
	title: "Components/ImageGroup",
	component: ImageGroup,
	parameters: { layout: "centered" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof ImageGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Multiple: Story = {
	args: { images: [image("#6d28d9", "1"), image("#0f766e", "2"), image("#c2410c", "3")], alt: "Иллюстрация существа" },
};

export const Single: Story = {
	args: { images: [image("#6d28d9", "1")], alt: "Иллюстрация существа" },
};
