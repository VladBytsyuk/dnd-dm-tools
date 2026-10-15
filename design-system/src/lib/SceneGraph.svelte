<script lang="ts">
	import { tick, untrack } from "svelte";
	import { SvelteFlow, ConnectionMode, ConnectionLineType, type Connection, type Edge } from "@xyflow/svelte";
	import "@xyflow/svelte/dist/style.css";
	import "./colors.css";
	import SceneNode from "./SceneGraphNode.svelte";
	import SceneEdge from "./SceneGraphEdge.svelte";
	import type { SceneFlowNode } from "./sceneGraphFlow";
	import SceneGraphToolbar from "./SceneGraphToolbar.svelte";
	import ReferencePicker from "./ReferencePicker.svelte";
	import { addSceneNote, addSceneLink, reconnectSceneLink, identifySceneLinks, sceneLinkOffsets, canConnectScenes, removeSceneSelection, sceneEdgeKey, SCENE_WIDTH, SCENE_HEIGHT, type SceneGraphNode, type SceneGraphLink, type SceneGraphNote, type SceneGraphData, type SceneGraphSide } from "./sceneGraphModel";

	type Props = {
		nodes?: SceneGraphNode[];
		links?: SceneGraphLink[];
		availableNotes?: SceneGraphNote[];
		theme?: "dark" | "light";
		height?: number;
		onChange?: (graph: SceneGraphData) => void;
		onSceneSelect?: (id: string | null) => void;
	};
	let { nodes = $bindable<SceneGraphNode[]>([]), links = $bindable<SceneGraphLink[]>([]), availableNotes = [], theme = "dark", height = 400, onChange, onSceneSelect }: Props = $props();
	const nodeTypes = { scene: SceneNode };
	const edgeTypes = { scene: SceneEdge };
	let flowNodes = $state.raw<SceneFlowNode[]>([]);
	let flowEdges = $state.raw<Edge[]>([]);
	let selectedNodeIds = $state(new Set<string>());
	let selectedEdgeKeys = $state(new Set<string>());
	let lastNotifiedSelection: string | null = null;
	let root: HTMLDivElement;
	let toolbar = $state<{ toFlowPosition: (point: { x: number; y: number }) => { x: number; y: number }; revealNode: (id: string, bounds: DOMRect) => void }>();
	let pickerOpen = $state(false);
	let pickerSession = $state(0);
	let pickerAnchor: HTMLButtonElement | undefined;
	let pickerPosition = $state({ x: 8, y: 48 });
	let pickerMaxHeight = $state(280);
	let canDelete = $derived(selectedNodeIds.size > 0 || selectedEdgeKeys.size > 0);
	let notesByPath = $derived(new Map(availableNotes.map((note) => [note.path, note])));
	let pickerOptions = $derived([...notesByPath.values()].filter((note) => !nodes.some((node) => node.note.path === note.path)).map((note) => ({ value: note.path, label: `${note.title} — ${note.path}` })));

	// Only external graph data and theme trigger reconciliation. Dragging and selection stay local.
	$effect.pre(() => {
		const nextNodes = nodes.map((node) => ({ ...node, note: { ...node.note }, position: { ...node.position } }));
		const nextTheme = theme;
		untrack(() => {
			flowNodes = nextNodes.map((node) => ({
				id: node.id, type: "scene", position: node.position, width: SCENE_WIDTH, height: SCENE_HEIGHT,
				selected: selectedNodeIds.has(node.id), ariaLabel: node.note.title,
				data: { note: node.note, theme: nextTheme },
			}));
		});
	});
	$effect.pre(() => {
		const identified = identifySceneLinks(links, () => crypto.randomUUID());
		if (identified !== links) links = identified;
		const offsets = sceneLinkOffsets(identified);
		const nextLinks = identified.map((link, index) => ({ ...link, offset: offsets[index] }));
		const titles = new Map(nodes.map((node) => [node.id, node.note.title]));
		const edgeColor = theme === "dark" ? "#a3a3a3" : "#737373";
		untrack(() => {
			flowEdges = nextLinks.filter((link) => titles.has(link.fromSceneId) && titles.has(link.toSceneId)).map((link) => ({
				id: sceneEdgeKey(link), source: link.fromSceneId, target: link.toSceneId, type: "scene", selected: selectedEdgeKeys.has(sceneEdgeKey(link)),
				sourceHandle: link.fromSide ?? "bottom", targetHandle: link.toSide ?? "top", data: { offset: link.offset, label: `${titles.get(link.fromSceneId)} → ${titles.get(link.toSceneId)}`, color: edgeColor },
				style: `stroke: ${edgeColor}; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round`, interactionWidth: 20,
				ariaLabel: `Связь: ${titles.get(link.fromSceneId)} → ${titles.get(link.toSceneId)}`,
			}));
		});
	});

	function notifySelection(id: string | null) {
		if (id !== lastNotifiedSelection) { lastNotifiedSelection = id; onSceneSelect?.(id); }
	}
	function selectionChanged(selection: { nodes: SceneFlowNode[]; edges: Edge[] }) {
		selectedNodeIds = new Set(selection.nodes.map((node) => node.id));
		selectedEdgeKeys = new Set(selection.edges.map((edge) => edge.id));
		notifySelection(selection.nodes[0]?.id ?? null);
	}
	function selectOnly(id: string) {
		selectedNodeIds = new Set([id]);
		selectedEdgeKeys = new Set();
		flowNodes = flowNodes.map((node) => ({ ...node, selected: node.id === id }));
		flowEdges = flowEdges.map((edge) => ({ ...edge, selected: false }));
	}
	function commit(graph: SceneGraphData) {
		nodes = graph.nodes;
		links = graph.links;
		onChange?.(graph);
	}
	function connectScenes(connection: Connection) {
		const before = { nodes, links };
		const after = addSceneLink(before, linkFromConnection(connection));
		if (after !== before) commit(after);
	}
	function linkFromConnection(connection: Connection): SceneGraphLink {
		return {
			fromSceneId: connection.source, toSceneId: connection.target,
			fromSide: (connection.sourceHandle ?? "bottom") as SceneGraphSide,
			toSide: (connection.targetHandle ?? "top") as SceneGraphSide,
		};
	}
	function reconnectScenes(edge: Edge, connection: Connection) {
		const before = { nodes, links };
		const replacement = { ...linkFromConnection(connection), id: edge.id };
		const after = reconnectSceneLink(before, edge.id, replacement);
		if (after === before) return;
		selectedEdgeKeys = new Set([...selectedEdgeKeys].map((key) => key === edge.id ? sceneEdgeKey(replacement) : key));
		commit(after);
	}
	function commitPositions(moved: SceneFlowNode[]) {
		const positions = new Map(moved.map((node) => [node.id, node.position]));
		let changed = false;
		const nextNodes = nodes.map((node) => {
			const position = positions.get(node.id);
			if (!position || (position.x === node.position.x && position.y === node.position.y)) return node;
			changed = true;
			return { ...node, position: { ...position } };
		});
		if (changed) commit({ nodes: nextNodes, links });
	}
	function openPicker(anchor: HTMLButtonElement) {
		const bounds = root.getBoundingClientRect();
		const button = anchor.getBoundingClientRect();
		pickerSession++;
		pickerAnchor = anchor;
		const panelWidth = Math.min(280, bounds.width - 16);
		pickerPosition = {
			x: Math.max(8, Math.min(button.left - bounds.left, bounds.width - panelWidth - 8)),
			y: Math.max(48, Math.min(button.bottom - bounds.top + 4, bounds.height - 280)),
		};
		pickerMaxHeight = bounds.height - pickerPosition.y - 8;
		pickerOpen = true;
	}
	function pickerClosed() { if (pickerAnchor?.isConnected) pickerAnchor.focus(); else root.focus(); }
	async function chooseNote(path: string | null) {
		if (!path || !toolbar) return;
		const note = notesByPath.get(path);
		if (!note) return;
		const bounds = root.getBoundingClientRect();
		const center = toolbar.toFlowPosition({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 });
		const before = { nodes, links };
		const after = addSceneNote(before, note, null, { x: center.x - SCENE_WIDTH / 2, y: center.y - SCENE_HEIGHT / 2 }, crypto.randomUUID());
		if (after === before) return;
		const target = after.nodes.find((node) => node.note.path === path)!;
		selectOnly(target.id);
		commit(after);
		await tick();
		toolbar?.revealNode(target.id, root.getBoundingClientRect());
	}
	function deleteSelection() {
		const before = { nodes, links };
		const after = removeSceneSelection(before, selectedNodeIds, selectedEdgeKeys);
		if (after === before) return;
		selectedNodeIds = new Set();
		selectedEdgeKeys = new Set();
		notifySelection(null);
		commit(after);
		root.focus();
	}
	function isTyping(target: EventTarget | null) {
		return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
	}
	function handleKey(event: KeyboardEvent) {
		if (pickerOpen || isTyping(event.target)) return;
		if ((event.key === "Delete" || event.key === "Backspace") && canDelete) {
			event.preventDefault(); event.stopPropagation(); deleteSelection();
		}
	}
	async function handleKeyUp(event: KeyboardEvent) {
		if (pickerOpen || isTyping(event.target) || !event.key.startsWith("Arrow")) return;
		await tick();
		commitPositions(flowNodes);
	}
	function keyboard(node: HTMLDivElement) {
		node.addEventListener("keydown", handleKey);
		node.addEventListener("keyup", handleKeyUp);
		return { destroy() { node.removeEventListener("keydown", handleKey); node.removeEventListener("keyup", handleKeyUp); } };
	}
</script>

<div class="scene-graph" data-theme={theme} style:height={`${height}px`} role="application" aria-label="Редактор сцен" tabindex="-1" bind:this={root} use:keyboard>
	<SvelteFlow bind:nodes={flowNodes} bind:edges={flowEdges} {nodeTypes} {edgeTypes} colorMode={theme} connectionMode={ConnectionMode.Loose} connectionLineType={ConnectionLineType.Straight} isValidConnection={(connection) => canConnectScenes({ nodes, links }, { fromSceneId: connection.source, toSceneId: connection.target })} onconnect={connectScenes} onreconnect={reconnectScenes} onedgeclick={() => root.focus()} deleteKey={[]} nodeDragThreshold={4} zoomOnDoubleClick={false} minZoom={0.2} maxZoom={2} fitView fitViewOptions={{ padding: 0.2, maxZoom: 1 }} onnodedragstop={({ nodes: moved }) => commitPositions(moved)} onselectionchange={selectionChanged} ariaLabelConfig={{ 'node.a11yDescription.default': "Enter — выделить сцену, стрелки — переместить, Delete — удалить. Tab — следующая кнопка.", 'node.a11yDescription.ariaLiveMessage': ({ x, y }) => `Сцена перемещена. Координаты: ${x}, ${y}.`, 'edge.a11yDescription.default': "Enter — выделить связь, Delete — удалить. Перетащите конец выделенной стрелки, чтобы изменить связь." }}>
		<SceneGraphToolbar bind:this={toolbar} {canDelete} onAdd={openPicker} onDelete={deleteSelection} />
	</SvelteFlow>
	{#if !nodes.length}<p class="empty">Сцены пока не добавлены. Выберите заметку через «Добавить сцену».</p>{/if}
	{#if pickerOpen}
		{#key pickerSession}
		<div class="scene-picker" style:left={`${pickerPosition.x}px`} style:top={`${pickerPosition.y}px`} style:--reference-picker-max-height={`${pickerMaxHeight}px`}>
			<ReferencePicker label="Добавить сцену" options={pickerOptions} bind:open={pickerOpen} panelOnly onChange={chooseNote} onClose={pickerClosed} {theme} />
		</div>
		{/key}
	{/if}
</div>

<style>
	.scene-graph { --scene-ink: #fff; --scene-toolbar-bg: #404040; --xy-background-color: transparent; --xy-edge-stroke-selected: #fff; position: relative; box-sizing: border-box; width: 100%; min-width: 0; min-height: 240px; overflow: hidden; border-radius: 8px; background: rgb(48 48 48 / 20%); color: var(--scene-ink); font-family: "Golos Text", sans-serif; }
	.scene-graph[data-theme="light"] { --scene-ink: #1f2937; --scene-toolbar-bg: #fff; --xy-edge-stroke-selected: #1f2937; background: rgb(48 48 48 / 6%); }
	.scene-graph :global(.svelte-flow) { background: transparent; }
	.scene-graph :global(.svelte-flow__node-scene.selected) { outline: 2px solid var(--scene-ink); outline-offset: 3px; border-radius: 8px; }
	.scene-graph :global(.svelte-flow__edge.selected .svelte-flow__edge-path) { stroke: var(--scene-ink); stroke-width: 2; }
	.scene-graph :global(.svelte-flow__node-scene:focus-visible) { outline: 2px dashed var(--scene-ink); outline-offset: 3px; }
	.scene-picker { position: absolute; z-index: 20; width: min(280px, calc(100% - 16px)); }
	.empty { position: absolute; top: 45%; left: 16px; right: 16px; margin: 0; text-align: center; pointer-events: none; font-size: 12px; line-height: 16px; opacity: 0.7; }
</style>
