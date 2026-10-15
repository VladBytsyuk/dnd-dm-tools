import type { ComponentProps } from "svelte";
import type SmallScene from "./SmallScene.svelte";

export type SceneGraphNote = { path: string } & Omit<ComponentProps<typeof SmallScene>, "theme" | "state" | "onclick">;
export type SceneGraphNode = { id: string; note: SceneGraphNote; position: { x: number; y: number } };
export type SceneGraphSide = "top" | "right" | "bottom" | "left";
/** Missing sides keep existing graphs connected from bottom to top. */
export type SceneGraphLink = { id?: string; fromSceneId: string; toSceneId: string; fromSide?: SceneGraphSide; toSide?: SceneGraphSide };
export type SceneGraphData = { nodes: SceneGraphNode[]; links: SceneGraphLink[] };

export const SCENE_WIDTH = 196;
export const SCENE_HEIGHT = 64;
export const SCENE_HANDLE_SIZE = 6;

export function canConnectScenes(graph: SceneGraphData, link: SceneGraphLink): boolean {
	return link.fromSceneId !== link.toSceneId
		&& graph.nodes.some((node) => node.id === link.fromSceneId)
		&& graph.nodes.some((node) => node.id === link.toSceneId);
}

export function addSceneLink(graph: SceneGraphData, link: SceneGraphLink): SceneGraphData {
	return canConnectScenes(graph, link) ? { nodes: graph.nodes, links: [...graph.links, { ...link, id: link.id ?? crypto.randomUUID() }] } : graph;
}

export function reconnectSceneLink(graph: SceneGraphData, key: string, replacement: SceneGraphLink): SceneGraphData {
	const index = graph.links.findIndex((link) => sceneEdgeKey(link) === key);
	if (index < 0 || !canConnectScenes(graph, replacement)) return graph;
	const current = graph.links[index];
	if (current.fromSceneId === replacement.fromSceneId && current.toSceneId === replacement.toSceneId && (current.fromSide ?? "bottom") === (replacement.fromSide ?? "bottom") && (current.toSide ?? "top") === (replacement.toSide ?? "top")) return graph;
	return { nodes: graph.nodes, links: graph.links.map((link, i) => i === index ? { ...replacement, ...(current.id ? { id: current.id } : {}) } : link) };
}

/** Assign IDs once so parallel and legacy links can be changed independently. */
export function identifySceneLinks(links: SceneGraphLink[], createId: () => string): SceneGraphLink[] {
	const used = new Set<string>();
	let changed = false;
	const identified = links.map((link) => {
		let id = link.id;
		while (!id || used.has(id)) id = createId();
		used.add(id);
		if (id === link.id) return link;
		changed = true;
		return { ...link, id };
	});
	return changed ? identified : links;
}

/** Separate coincident arrows, including arrows in opposite directions. */
export function sceneLinkOffsets(links: SceneGraphLink[]): number[] {
	const groups = new Map<string, number[]>();
	links.forEach((link, index) => {
		const ends = [JSON.stringify([link.fromSceneId, link.fromSide ?? "bottom"]), JSON.stringify([link.toSceneId, link.toSide ?? "top"])].sort();
		const key = JSON.stringify(ends);
		const group = groups.get(key) ?? [];
		group.push(index);
		groups.set(key, group);
	});
	const offsets = links.map(() => 0);
	for (const group of groups.values()) group.forEach((index, order) => {
		const link = links[index];
		offsets[index] = (order - (group.length - 1) / 2) * 48 * (link.fromSceneId < link.toSceneId ? 1 : -1);
	});
	return offsets;
}

/** Flow supplies the outer handle rim; the scene boundary is at its center. */
export function sceneBoundaryPoint(x: number, y: number, side: SceneGraphSide): SceneGraphNode["position"] {
	const radius = SCENE_HANDLE_SIZE / 2;
	return { x: x + (side === "left" ? radius : side === "right" ? -radius : 0), y: y + (side === "top" ? radius : side === "bottom" ? -radius : 0) };
}

/** Search horizontally around the requested origin without moving existing scenes. */
export function findScenePosition(nodes: SceneGraphNode[], origin: SceneGraphNode["position"]): SceneGraphNode["position"] {
	let offset = 0;
	let position = { ...origin };
	while (nodes.some((node) => Math.abs(node.position.x - position.x) < SCENE_WIDTH + 24 && Math.abs(node.position.y - position.y) < SCENE_HEIGHT + 36)) {
		offset++;
		const column = Math.ceil(offset / 2) * (offset % 2 ? 1 : -1);
		position = { x: origin.x + column * (SCENE_WIDTH + 24), y: origin.y };
	}
	return position;
}

export function addSceneNote(graph: SceneGraphData, note: SceneGraphNote, fromId: string | null, origin: SceneGraphNode["position"], newId: string): SceneGraphData {
	const from = graph.nodes.find((node) => node.id === fromId);
	if (fromId !== null && !from) return graph;
	const existing = graph.nodes.find((node) => node.note.path === note.path);
	if (existing && (fromId === null || existing.id === fromId)) return graph;
	const target = existing ?? { id: newId, note, position: findScenePosition(graph.nodes, from ? { x: from.position.x, y: from.position.y + 120 } : origin) };
	return {
		nodes: existing ? graph.nodes : [...graph.nodes, target],
		links: fromId === null ? graph.links : [...graph.links, { id: crypto.randomUUID(), fromSceneId: fromId, toSceneId: target.id }],
	};
}

export function removeSceneSelection(graph: SceneGraphData, nodeIds: Set<string>, edgeKeys: Set<string>): SceneGraphData {
	const nodes = graph.nodes.filter((node) => !nodeIds.has(node.id));
	const links = graph.links.filter((link) => !nodeIds.has(link.fromSceneId) && !nodeIds.has(link.toSceneId) && !edgeKeys.has(sceneEdgeKey(link)));
	return nodes.length === graph.nodes.length && links.length === graph.links.length ? graph : { nodes, links };
}

export function sceneEdgeKey(link: SceneGraphLink): string {
	return link.id ?? JSON.stringify([link.fromSceneId, link.toSceneId]);
}
