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
		editable?: boolean;
		showAddScene?: boolean;
		onChange?: (graph: SceneGraphData) => void;
		onSceneSelect?: (id: string | null) => void;
		onSceneOpen?: (id: string) => void;
	};
	let { nodes = $bindable<SceneGraphNode[]>([]), links = $bindable<SceneGraphLink[]>([]), availableNotes = [], theme = "dark", height = 600, editable = true, showAddScene = true, onChange, onSceneSelect, onSceneOpen }: Props = $props();
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
	let pickerPosition = $state({ x: 12, y: 72 });
	let pickerMaxHeight = $state(420);
	let pointerStart: { x: number; y: number } | null = null;
	let pointerMoved = false;
	let canDelete = $derived(editable && (selectedNodeIds.size > 0 || selectedEdgeKeys.size > 0));
	let notesByPath = $derived(new Map(availableNotes.filter((note): note is SceneGraphNote & { path: string } => typeof note.path === "string" && note.path.trim().length > 0).map((note) => [note.path, note])));
	let pickerOptions = $derived([...notesByPath.values()].filter((note) => !nodes.some((node) => node.note.path === note.path)).map((note) => ({ value: note.path, label: `${note.title} — ${note.path}` })));

	// Only external graph data, theme and mode trigger reconciliation. Dragging and selection stay local.
	$effect.pre(() => {
		const nextNodes = nodes.map((node) => ({ ...node, note: { ...node.note }, position: { ...node.position } }));
		const nextTheme = theme;
		const nextEditable = editable;
		untrack(() => {
			flowNodes = nextNodes.map((node) => ({
				id: node.id, type: "scene", position: node.position, width: SCENE_WIDTH, height: SCENE_HEIGHT,
				selected: selectedNodeIds.has(node.id), ariaLabel: node.note.title,
				data: { note: node.note, theme: nextTheme, editable: nextEditable },
			}));
		});
	});
	$effect.pre(() => {
		const identified = identifySceneLinks(links, () => crypto.randomUUID());
		if (editable && identified !== links) links = identified;
		const offsets = sceneLinkOffsets(identified);
		const nextLinks = identified.map((link, index) => ({ ...link, offset: offsets[index] }));
		const titles = new Map(nodes.map((node) => [node.id, node.note.title]));
		const edgeColor = theme === "dark" ? "#a3a3a3" : "#737373";
		const nextEditable = editable;
		untrack(() => {
			flowEdges = nextLinks.filter((link) => titles.has(link.fromSceneId) && titles.has(link.toSceneId)).map((link) => ({
				id: sceneEdgeKey(link), source: link.fromSceneId, target: link.toSceneId, type: "scene", selected: selectedEdgeKeys.has(sceneEdgeKey(link)),
				sourceHandle: link.fromSide ?? "bottom", targetHandle: link.toSide ?? "top", data: { offset: link.offset, label: `${titles.get(link.fromSceneId)} → ${titles.get(link.toSceneId)}`, color: edgeColor, editable: nextEditable },
				style: `stroke: ${edgeColor}; stroke-width: 2.25; stroke-linecap: round; stroke-linejoin: round`, interactionWidth: 30,
				ariaLabel: `Связь: ${titles.get(link.fromSceneId)} → ${titles.get(link.toSceneId)}`,
			}));
		});
	});

	$effect(() => { if (!editable) pickerOpen = false; });

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
		if (!editable) return;
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
		if (!editable) return;
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
		if (!editable) return;
		const bounds = root.getBoundingClientRect();
		const button = anchor.getBoundingClientRect();
		pickerSession++;
		pickerAnchor = anchor;
		const panelWidth = Math.min(420, bounds.width - 24);
		pickerPosition = {
			x: Math.max(12, Math.min(button.left - bounds.left, bounds.width - panelWidth - 12)),
			y: Math.max(72, Math.min(button.bottom - bounds.top + 6, bounds.height - 420)),
		};
		pickerMaxHeight = bounds.height - pickerPosition.y - 12;
		pickerOpen = true;
	}
	function pickerClosed() { if (pickerAnchor?.isConnected) pickerAnchor.focus(); else root.focus(); }
	async function chooseNote(path: string | null) {
		if (!editable || !path || !toolbar) return;
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
		if (!editable) return;
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
		if (isTyping(event.target)) return;
		if (!editable) {
			if (event.key === "Enter" && onSceneOpen && event.target instanceof Element) {
				const id = event.target.closest<HTMLElement>(".svelte-flow__node[data-id]")?.dataset.id;
				if (id) { event.preventDefault(); onSceneOpen(id); }
			}
			return;
		}
		if (pickerOpen) return;
		if ((event.key === "Delete" || event.key === "Backspace") && canDelete) {
			event.preventDefault(); event.stopPropagation(); deleteSelection();
		}
	}
	async function handleKeyUp(event: KeyboardEvent) {
		if (!editable || pickerOpen || isTyping(event.target) || !event.key.startsWith("Arrow")) return;
		await tick();
		commitPositions(flowNodes);
	}
	function keyboard(node: HTMLDivElement) {
		node.addEventListener("keydown", handleKey);
		node.addEventListener("keyup", handleKeyUp);
		return { destroy() { node.removeEventListener("keydown", handleKey); node.removeEventListener("keyup", handleKeyUp); } };
	}
	function pointerDown(event: PointerEvent) { pointerStart = { x: event.clientX, y: event.clientY }; pointerMoved = false; }
	function pointerMove(event: PointerEvent) {
		if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 4) pointerMoved = true;
	}
	function openNode(id: string) { if (!editable && !pointerMoved) onSceneOpen?.(id); }
</script>

<div class="scene-graph" data-theme={theme} data-editable={editable} style:height={`${height}px`} role="application" aria-label="Редактор сцен" tabindex="-1" bind:this={root} use:keyboard onpointerdown={pointerDown} onpointermove={pointerMove} onpointercancel={() => { pointerStart = null; }}>
	<SvelteFlow bind:nodes={flowNodes} bind:edges={flowEdges} {nodeTypes} {edgeTypes} nodesDraggable={editable} nodesConnectable={editable} panOnScroll={!editable} zoomOnScroll={editable} colorMode={theme} connectionMode={ConnectionMode.Loose} connectionLineType={ConnectionLineType.Straight} isValidConnection={(connection) => editable && canConnectScenes({ nodes, links }, { fromSceneId: connection.source, toSceneId: connection.target })} onconnect={connectScenes} onreconnect={reconnectScenes} onedgeclick={() => root.focus()} onnodeclick={({ node }) => openNode(node.id)} deleteKey={[]} nodeDragThreshold={4} zoomOnDoubleClick={false} minZoom={0.2} maxZoom={2} fitView fitViewOptions={{ padding: 0.2, maxZoom: 1 }} onnodedragstop={({ nodes: moved }) => commitPositions(moved)} onselectionchange={selectionChanged} ariaLabelConfig={{ 'node.a11yDescription.default': editable ? "Enter — выделить сцену, стрелки — переместить, Delete — удалить. Tab — следующая кнопка." : onSceneOpen ? "Enter — открыть сцену. Граф доступен только для просмотра." : "Enter — выделить сцену. Граф доступен только для просмотра.", 'node.a11yDescription.ariaLiveMessage': ({ x, y }) => `Сцена перемещена. Координаты: ${x}, ${y}.`, 'edge.a11yDescription.default': editable ? "Enter — выделить связь, Delete — удалить. Перетащите конец выделенной стрелки, чтобы изменить связь." : "Enter — выделить связь. Граф доступен только для просмотра." }}>
		<SceneGraphToolbar bind:this={toolbar} {editable} {showAddScene} {canDelete} onAdd={openPicker} onDelete={deleteSelection} />
	</SvelteFlow>
	{#if !nodes.length}<p class="empty">Сцены пока не добавлены.{#if editable && showAddScene} Выберите заметку через «Добавить сцену».{/if}</p>{/if}
	{#if pickerOpen}
		{#key pickerSession}
		<div class="scene-picker" style:left={`${pickerPosition.x}px`} style:top={`${pickerPosition.y}px`} style:--reference-picker-max-height={`${pickerMaxHeight}px`}>
			<ReferencePicker label="Добавить сцену" options={pickerOptions} bind:open={pickerOpen} panelOnly onChange={chooseNote} onClose={pickerClosed} {theme} />
		</div>
		{/key}
	{/if}
</div>

<style>
	.scene-graph { --ds-media-unit: 1.5px; --scene-ink: #fff; --scene-toolbar-bg: #404040; --xy-background-color: transparent; --xy-edge-stroke-selected: #fff; position: relative; box-sizing: border-box; width: 100%; min-width: 0; min-height: calc(240 * var(--ds-media-unit, 1px)); overflow: hidden; border-radius: calc(8 * var(--ds-media-unit, 1px)); background: rgb(48 48 48 / 20%); color: var(--scene-ink); font-family: "Golos Text", sans-serif; }
	.scene-graph[data-theme="light"] { --scene-ink: #1f2937; --scene-toolbar-bg: #fff; --xy-edge-stroke-selected: #1f2937; background: rgb(48 48 48 / 6%); }
	.scene-graph :global(.svelte-flow) { background: transparent; }
	.scene-graph :global(.svelte-flow__node-scene.selected) { outline: calc(2 * var(--ds-media-unit, 1px)) solid var(--scene-ink); outline-offset: calc(3 * var(--ds-media-unit, 1px)); border-radius: calc(8 * var(--ds-media-unit, 1px)); }
	.scene-graph :global(.svelte-flow__edge.selected .svelte-flow__edge-path) { stroke: var(--scene-ink); stroke-width: 3; }
	.scene-graph :global(.svelte-flow__node-scene:focus-visible) { outline: calc(2 * var(--ds-media-unit, 1px)) dashed var(--scene-ink); outline-offset: calc(3 * var(--ds-media-unit, 1px)); }
	.scene-picker { position: absolute; z-index: 20; width: min(calc(280 * var(--ds-media-unit, 1px)), calc(100% - calc(16 * var(--ds-media-unit, 1px)))); }
	.empty { position: absolute; top: 45%; left: calc(16 * var(--ds-media-unit, 1px)); right: calc(16 * var(--ds-media-unit, 1px)); margin: 0; text-align: center; pointer-events: none; font-size: calc(12 * var(--ds-media-unit, 1px)); line-height: calc(16 * var(--ds-media-unit, 1px)); opacity: 0.7; }
</style>
