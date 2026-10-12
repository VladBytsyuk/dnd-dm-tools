export interface SceneGraphScene {
	id: string;
	path: string;
	missing?: boolean;
}

export interface SceneGraphLink {
	fromSceneId: string;
	toSceneId: string;
}

export interface PositionedScene extends SceneGraphScene {
	x: number;
	y: number;
	label: string;
}

export interface PositionedLink {
	path: string;
	arrowPoints: string;
}

export interface SceneGraphLayout {
	nodes: PositionedScene[];
	edges: PositionedLink[];
	width: number;
	height: number;
}

const NODE_WIDTH = 148;
const NODE_HEIGHT = 58;
const COLUMN_STEP = 242;
const ROW_STEP = 100;
const PADDING = 24;

/** Place strongly connected scenes in the same column, then lay out the resulting DAG. */
export function layoutSceneGraph(scenes: SceneGraphScene[], links: SceneGraphLink[]): SceneGraphLayout {
	const uniqueScenes = scenes.filter((scene, index) => scenes.findIndex((item) => item.id === scene.id) === index);
	const indexById = new Map(uniqueScenes.map((scene, index) => [scene.id, index]));
	const validLinks = links.filter((link) => indexById.has(link.fromSceneId) && indexById.has(link.toSceneId));
	const adjacency = uniqueScenes.map(() => [] as number[]);
	for (const link of validLinks) {
		adjacency[indexById.get(link.fromSceneId)!].push(indexById.get(link.toSceneId)!);
	}

	const discovery = uniqueScenes.map(() => -1);
	const low = uniqueScenes.map(() => -1);
	const onStack = uniqueScenes.map(() => false);
	const stack: number[] = [];
	const componentByNode = uniqueScenes.map(() => -1);
	let nextDiscovery = 0;
	let componentCount = 0;

	function visit(node: number): void {
		discovery[node] = low[node] = nextDiscovery++;
		stack.push(node);
		onStack[node] = true;
		for (const neighbor of adjacency[node]) {
			if (discovery[neighbor] === -1) {
				visit(neighbor);
				low[node] = Math.min(low[node], low[neighbor]);
			} else if (onStack[neighbor]) {
				low[node] = Math.min(low[node], discovery[neighbor]);
			}
		}
		if (low[node] !== discovery[node]) return;
		while (stack.length) {
			const member = stack.pop()!;
			onStack[member] = false;
			componentByNode[member] = componentCount;
			if (member === node) break;
		}
		componentCount++;
	}

	for (let node = 0; node < uniqueScenes.length; node++) {
		if (discovery[node] === -1) visit(node);
	}

	const componentEdges = Array.from({ length: componentCount }, () => new Set<number>());
	const inDegree = Array.from({ length: componentCount }, () => 0);
	for (let from = 0; from < adjacency.length; from++) {
		for (const to of adjacency[from]) {
			const source = componentByNode[from];
			const target = componentByNode[to];
			if (source === target || componentEdges[source].has(target)) continue;
			componentEdges[source].add(target);
			inDegree[target]++;
		}
	}
	const columnByComponent = Array.from({ length: componentCount }, () => 0);
	const queue: number[] = [];
	for (let component = 0; component < componentCount; component++) {
		if (inDegree[component] === 0) queue.push(component);
	}
	for (let head = 0; head < queue.length; head++) {
		const source = queue[head];
		for (const target of componentEdges[source]) {
			columnByComponent[target] = Math.max(columnByComponent[target], columnByComponent[source] + 1);
			if (--inDegree[target] === 0) queue.push(target);
		}
	}

	const columnByNode = uniqueScenes.map((_, index) => columnByComponent[componentByNode[index]]);
	const backwardLinks = validLinks.filter((link) => columnByNode[indexById.get(link.toSceneId)!] <= columnByNode[indexById.get(link.fromSceneId)!]);
	const topPadding = PADDING + backwardLinks.length * 18;
	const rowsByColumn = new Map<number, number>();
	const nodes = uniqueScenes.map((scene, index) => {
		const column = columnByNode[index];
		const row = rowsByColumn.get(column) ?? 0;
		rowsByColumn.set(column, row + 1);
		const filename = scene.path.split("/").pop() || scene.path;
		return {
			...scene,
			x: PADDING + column * COLUMN_STEP,
			y: topPadding + row * ROW_STEP,
			label: filename.replace(/\.md$/i, ""),
		};
	});
	const nodeById = new Map(nodes.map((node) => [node.id, node]));
	let backwardIndex = 0;
	const edges = validLinks.map((link) => {
		const from = nodeById.get(link.fromSceneId)!;
		const to = nodeById.get(link.toSceneId)!;
		const startX = from.x + NODE_WIDTH;
		const startY = from.y + NODE_HEIGHT / 2;
		if (to.x > from.x) {
			const tipX = to.x - 5;
			const tipY = to.y + NODE_HEIGHT / 2;
			const bend = Math.max(25, (tipX - startX) / 2);
			return {
				path: `M ${startX} ${startY} C ${startX + bend} ${startY}, ${tipX - bend} ${tipY}, ${tipX} ${tipY}`,
				arrowPoints: `${tipX},${tipY} ${tipX - 8},${tipY - 4} ${tipX - 8},${tipY + 4}`,
			};
		}
		const laneY = PADDING + backwardIndex++ * 18;
		const laneX = Math.max(from.x, to.x) + NODE_WIDTH + 22;
		const tipX = to.x + NODE_WIDTH / 2;
		const tipY = to.y - 5;
		return {
			path: `M ${startX} ${startY} L ${laneX} ${startY} L ${laneX} ${laneY} L ${tipX} ${laneY} L ${tipX} ${tipY}`,
			arrowPoints: `${tipX},${tipY} ${tipX - 4},${tipY - 8} ${tipX + 4},${tipY - 8}`,
		};
	});
	const columns = Math.max(0, ...columnByNode) + 1;
	const maxRows = Math.max(0, ...rowsByColumn.values());
	return {
		nodes,
		edges,
		width: Math.max(220, PADDING * 2 + (columns - 1) * COLUMN_STEP + NODE_WIDTH + 22),
		height: Math.max(120, topPadding + maxRows * ROW_STEP - (ROW_STEP - NODE_HEIGHT) + PADDING),
	};
}
