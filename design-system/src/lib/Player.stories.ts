import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Player from "./Player.svelte";
import PlayerPreview from "./PlayerPreview.svelte";

const meta = {
	title: "Components/Player",
	component: Player,
	render: (args) => ({ Component: PlayerPreview, props: args }),
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: {
		trackName: "Подземный тоннель",
		playlistName: "Дорога в Подземье",
		nextTrackName: "Пещера паука",
		hasPrevious: false,
		playing: true,
		currentTime: 134,
		duration: 221,
		volume: 0.5,
	},
} satisfies Meta<typeof Player>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const Paused: Story = { args: { playing: false } };
export const CombatAndMuted: Story = { args: { playing: false, combatMode: true, muted: true } };
export const CombatOnly: Story = { args: { combatMode: true, combatModeLocked: true } };
export const LightCombatAndMuted: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light", playing: false, combatMode: true, muted: true } };
export const LastTrack: Story = { args: { trackName: "Забытый храм", nextTrackName: undefined, hasPrevious: true } };
export const WithoutPlaylist: Story = { args: { playlistName: undefined } };
export const LongNames: Story = { args: { trackName: "Тоннель под древними подземными городами", playlistName: "Долгая дорога через забытые пещеры Подземья", nextTrackName: "Пещера огромного паука за забытым храмом" } };
export const Disabled: Story = { args: { disabled: true } };
