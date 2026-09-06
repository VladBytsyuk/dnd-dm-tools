import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { Heart, Scale, Shield, Sword } from "./index";
import MaxItemHeader from "./MaxItemHeader.svelte";

const image = (color: string, label: string) =>
	`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="64" fill="#f8f4e7"/><circle cx="64" cy="64" r="54" fill="${color}"/><text x="64" y="72" fill="white" font-family="sans-serif" font-size="22" text-anchor="middle">${label}</text></svg>`)}`;

const meta = {
	title: "Components/MaxItemHeader",
	component: MaxItemHeader,
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
} satisfies Meta<typeof MaxItemHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		accentColor: "rgb(251 113 133 / 40%)",
		russianName: "Огремох",
		englishName: "Ogrémoch",
		entityLink: "/bestiary/ogremoch",
		badge: 20,
		info: "Громадный элементаль",
		source: {
			shortName: "PHB",
			name: "Player's Handbook",
			group: { shortName: "D&D 5e", name: "Dungeons & Dragons, 5-я редакция" },
		},
		chips: [
			{ text: "Нейтрально-злой", icon: Scale, iconTooltip: "Мировоззрение" },
			{ text: "4×4 клетки или больше", icon: Sword, iconTooltip: "Размер" },
			{ text: "20 (природный доспех)", icon: Shield, iconTooltip: "Класс доспеха" },
			{ text: "526 (27к20 + 243)", icon: Heart, iconTooltip: "Хиты" },
		],
		images: [image("#4d7c0f", "O"), image("#0f766e", "2")],
		alt: "Огремох",
		theme: "dark",
	},
};

export const Dark: Story = {
	globals: { backgrounds: { value: "dark" } },
	args: { ...Default.args, theme: "dark" },
};

export const Light: Story = {
	globals: { backgrounds: { value: "light" } },
	args: { ...Default.args, theme: "light" },
};

export const WithoutImage: Story = {
	args: {
		...Default.args,
		images: [],
	},
};

export const Editable: Story = {
	args: {
		...Default.args,
		editable: true,
	},
};
