import type { Meta, StoryObj } from "@storybook/svelte-vite";
import SceneGraph from "./SceneGraph.svelte";
import SceneGraphPreview from "./SceneGraphPreview.svelte";
import type { SceneGraphNote, SceneGraphNode, SceneGraphLink } from "./sceneGraphModel";

const notes: SceneGraphNote[] = [
	{ path: "Дорога в Шамат/Сырой тоннель.md", title: "Сырой тоннель", adventureName: "Дорога в Шамат", musicName: "Подземный тоннель", info: "Культ Вазрона", source: "PHB" },
	{ path: "Дорога в Шамат/Пещера паука.md", title: "Пещера паука", adventureName: "Дорога в Шамат", musicName: "Паутина", info: "Культ Вазрона", source: "PHB" },
	{ path: "Дорога в Шамат/Забытый храм.md", title: "Забытый храм", adventureName: "Дорога в Шамат", musicName: "Древний храм", info: "Культ Вазрона", source: "PHB" },
	{ path: "Дорога в Шамат/Выход из подземелья.md", title: "Выход из подземелья", adventureName: "Дорога в Шамат", musicName: "На поверхности", source: "PHB" },
	{ path: "Дорога в Шамат/Затопленный зал.md", title: "Затопленный зал", adventureName: "Дорога в Шамат", source: "PHB" },
];
const nodes: SceneGraphNode[] = [
	{ id: "tunnel", note: notes[0], position: { x: 165, y: 0 } },
	{ id: "spider", note: notes[1], position: { x: 0, y: 180 } },
	{ id: "temple", note: notes[2], position: { x: 330, y: 180 } },
	{ id: "exit", note: notes[3], position: { x: 165, y: 360 } },
];
const links: SceneGraphLink[] = [
	{ fromSceneId: "tunnel", toSceneId: "spider" }, { fromSceneId: "tunnel", toSceneId: "temple" },
	{ fromSceneId: "spider", toSceneId: "exit" }, { fromSceneId: "temple", toSceneId: "exit" },
];
const meta = {
	title: "Components/SceneGraph",
	component: SceneGraph,
	render: (args) => ({ Component: SceneGraphPreview, props: args }),
	parameters: { layout: "padded" },
	globals: { backgrounds: { value: "dark" } },
	args: { nodes, links, availableNotes: notes },
} satisfies Meta<typeof SceneGraph>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Dark: Story = {};
export const ReadOnly: Story = { args: { editable: false } };
export const ReadOnlyEmpty: Story = { args: { editable: false, nodes: [], links: [] } };
export const Light: Story = { globals: { backgrounds: { value: "light" } }, args: { theme: "light" } };
export const Empty: Story = { args: { nodes: [], links: [] } };
export const OneScene: Story = { args: { nodes: nodes.slice(0, 1), links: [] } };
export const Cycle: Story = { args: { links: [...links, { fromSceneId: "exit", toSceneId: "tunnel" }] } };
export const ParallelLinks: Story = { args: {
	nodes: [{ ...nodes[0], position: { x: 0, y: 0 } }, { ...nodes[1], position: { x: 0, y: 270 } }],
	links: [
		{ fromSceneId: "tunnel", toSceneId: "spider" },
		{ fromSceneId: "tunnel", toSceneId: "spider" },
		{ fromSceneId: "tunnel", toSceneId: "spider" },
		{ fromSceneId: "spider", toSceneId: "tunnel", fromSide: "top", toSide: "bottom" },
	],
} };
export const AllSides: Story = { args: {
	nodes: [
		{ id: "tunnel", note: notes[0], position: { x: 360, y: 180 } },
		{ id: "spider", note: notes[1], position: { x: 360, y: 0 } },
		{ id: "temple", note: notes[2], position: { x: 720, y: 180 } },
		{ id: "exit", note: notes[3], position: { x: 360, y: 360 } },
		{ id: "hall", note: notes[4], position: { x: 0, y: 180 } },
	],
	links: [
		{ fromSceneId: "tunnel", toSceneId: "spider", fromSide: "top", toSide: "bottom" },
		{ fromSceneId: "tunnel", toSceneId: "temple", fromSide: "right", toSide: "left" },
		{ fromSceneId: "tunnel", toSceneId: "exit", fromSide: "bottom", toSide: "top" },
		{ fromSceneId: "tunnel", toSceneId: "hall", fromSide: "left", toSide: "right" },
	],
} };
export const NoAvailableNotes: Story = { args: { nodes: [], links: [], availableNotes: [] } };
export const LongNames: Story = { args: { nodes: [{ ...nodes[0], note: { ...notes[0], title: "Сырой тоннель под забытыми подземными городами", adventureName: "Долгая дорога через древние подземелья Шамата", musicName: "Напряженная музыка древних подземных городов", info: "Последователи древнего культа Вазрона" } }], links: [] } };
