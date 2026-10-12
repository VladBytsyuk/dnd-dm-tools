import type { Meta, StoryObj } from "@storybook/svelte-vite";
import Subtrack from "./Subtrack.svelte";
import SubtrackPreview from "./SubtrackPreview.svelte";

const meta = {
	title: "Components/Subtrack",
	component: Subtrack,
	render: (args) => ({ Component: SubtrackPreview, props: args }),
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: { title: "Основной", fileName: "underdark_tunnel.mp3", currentTime: 134, duration: 221 },
} satisfies Meta<typeof Subtrack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playing: Story = { args: { playing: true } };
export const Stopped: Story = { args: { playing: false } };
export const Empty: Story = { args: { fileName: undefined, currentTime: 0 } };
export const Combat: Story = { args: { title: "Боевой", fileName: "underdark_battle.mp3" } };
export const LongFileName: Story = { args: { fileName: "underdark_tunnel_atmosphere_extended_version.mp3" } };
export const Disabled: Story = { args: { disabled: true } };
