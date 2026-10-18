import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Playlist from "./Playlist.svelte";
import PlaylistPreview from "./PlaylistPreview.svelte";

const meta = {
	title: "Items/Playlist",
	component: Playlist,
	render: (args) => ({ Component: PlaylistPreview, props: args }),
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: {
		russianName: "Дорога в Подземье",
		entityLink: "/playlist/road_to_underdark",
		atmosphere: "Напряженное, холодное",
		source: { shortName: "PHB", name: "Player's Handbook", group: { shortName: "D&D 5e", name: "Dungeons & Dragons, 5-я редакция" } },
		tracks: [
			{ id: "tunnel", title: "Подземный тоннель", atmosphere: "напряженное", source: "PHB" },
			{ id: "spider", title: "Пещера паука", atmosphere: "напряженное", source: "PHB", hasCombat: true },
			{ id: "temple", title: "Забытый храм", atmosphere: "напряженное", source: "PHB", hasCombat: true },
		],
	},
} satisfies Meta<typeof Playlist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const Editable: Story = { args: { editable: true } };
export const LightEditable: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light", editable: true } };
export const Empty: Story = { args: { tracks: [], editable: true } };
export const LightEmpty: Story = { globals: { backgrounds: { value: "light" } }, args: { tracks: [], theme: "light", editable: true } };
export const Disabled: Story = { args: { editable: true, disabled: true } };
