import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Track from "./Track.svelte";
import TrackPreview from "./TrackPreview.svelte";

const meta = {
	title: "Items/Track",
	component: Track,
	render: (args) => ({ Component: TrackPreview, props: args }),
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: {
		russianName: "Подземный тоннель",
		entityLink: "/track/underdark_tunnel",
		atmosphere: "Напряженное, холодное",
		source: { shortName: "PHB", name: "Player's Handbook", group: { shortName: "D&D 5e", name: "Dungeons & Dragons, 5-я редакция" } },
		normal: { fileName: "underdark_tunnel.mp3", currentTime: 134, duration: 221 },
		playingVariant: "normal",
	},
} satisfies Meta<typeof Track>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {};
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const BothVariants: Story = { args: { combat: { fileName: "underdark_tunnel_fight.mp3", currentTime: 134, duration: 221 }, playingVariant: "combat" } };
export const LightBothVariants: Story = { ...BothVariants, globals: { backgrounds: { value: "light" } }, args: { ...BothVariants.args, theme: "light" } };
export const Empty: Story = { args: { normal: undefined, playingVariant: null } };
export const LightEmpty: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light", normal: undefined, playingVariant: null } };
export const Disabled: Story = { args: { disabled: true } };
export const Editable: Story = { args: { editable: true } };
export const LightEditable: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light", editable: true } };
