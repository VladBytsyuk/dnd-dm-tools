import { describe, expect, it } from "vitest";
import { addSceneNote, addSceneLink, reconnectSceneLink, identifySceneLinks, sceneLinkOffsets, sceneBoundaryPoint, canConnectScenes, findScenePosition, removeSceneSelection, sceneEdgeKey, type SceneGraphData, type SceneGraphNote, type SceneGraphSide } from "../../../design-system/src/lib/sceneGraphModel";

const note = (title: string): SceneGraphNote => ({ path: `${title}.md`, title });
const first = { id: "a", note: note("Тоннель"), position: { x: 100, y: 50 } };

describe("scene graph changes", () => {
	it("allows parallel arrows and changes only the selected arrow while keeping its ID", () => {
		const graph: SceneGraphData = { nodes: [first, { id: "b", note: note("Храм"), position: { x: 320, y: 50 } }], links: [] };
		const one = addSceneLink(graph, { fromSceneId: "a", toSceneId: "b" });
		const two = addSceneLink(one, { fromSceneId: "a", toSceneId: "b" });
		expect(two.links).toHaveLength(2);
		expect(two.links[0].id).not.toBe(two.links[1].id);
		const updated = reconnectSceneLink(two, sceneEdgeKey(two.links[1]), { fromSceneId: "a", toSceneId: "b", fromSide: "right", toSide: "left" });
		expect(updated.links[0]).toBe(two.links[0]);
		expect(updated.links[1].id).toBe(two.links[1].id);
		expect(removeSceneSelection(updated, new Set(), new Set([sceneEdgeKey(updated.links[1])])).links).toEqual([two.links[0]]);
		const reversed = reconnectSceneLink(two, sceneEdgeKey(two.links[1]), { fromSceneId: "b", toSceneId: "a" });
		expect(reversed.links[1].id).toBe(two.links[1].id);
	});

	it("assigns stable IDs to legacy parallel links and repairs duplicate IDs once", () => {
		let next = 0;
		const original = [{ fromSceneId: "a", toSceneId: "b" }, { fromSceneId: "a", toSceneId: "b" }, { id: "existing", fromSceneId: "b", toSceneId: "a" }, { id: "existing", fromSceneId: "b", toSceneId: "a" }];
		const identified = identifySceneLinks(original, () => `link-${next++}`);
		expect(new Set(identified.map((link) => link.id)).size).toBe(4);
		expect(identified[2]).toBe(original[2]);
		expect(identifySceneLinks(identified, () => `link-${next++}`)).toBe(identified);
	});

	it("separates parallel and reverse arrows without offsetting their endpoints", () => {
		expect(sceneLinkOffsets([{ fromSceneId: "a", toSceneId: "b" }])).toEqual([0]);
		expect(sceneLinkOffsets([{ fromSceneId: "a", toSceneId: "b" }, { fromSceneId: "a", toSceneId: "b" }])).toEqual([-36, 36]);
		expect(sceneLinkOffsets([{ fromSceneId: "a", toSceneId: "b" }, { fromSceneId: "b", toSceneId: "a", fromSide: "top", toSide: "bottom" }])).toEqual([-36, -36]);
		expect(sceneBoundaryPoint(147, -4.5, "top")).toEqual({ x: 147, y: 0 });
		expect(sceneBoundaryPoint(298.5, 48, "right")).toEqual({ x: 294, y: 48 });
		expect(sceneBoundaryPoint(147, 100.5, "bottom")).toEqual({ x: 147, y: 96 });
		expect(sceneBoundaryPoint(-4.5, 48, "left")).toEqual({ x: 0, y: 48 });
	});

	it("moves either endpoint or only the side without moving cards or other links", () => {
		const graph: SceneGraphData = { nodes: [first, { id: "b", note: note("Храм"), position: { x: 320, y: 50 } }, { id: "c", note: note("Пещера"), position: { x: 320, y: 170 } }], links: [{ fromSceneId: "a", toSceneId: "b" }, { fromSceneId: "b", toSceneId: "c" }] };
		const key = sceneEdgeKey(graph.links[0]);
		for (const replacement of [
			{ fromSceneId: "a", toSceneId: "b", fromSide: "right", toSide: "left" },
			{ fromSceneId: "a", toSceneId: "c", fromSide: "bottom", toSide: "top" },
			{ fromSceneId: "c", toSceneId: "b", fromSide: "left", toSide: "bottom" },
		] as const) {
			const changed = reconnectSceneLink(graph, key, replacement);
			expect(changed.nodes).toBe(graph.nodes);
			expect(changed.links).toEqual([replacement, graph.links[1]]);
			expect(removeSceneSelection(changed, new Set(), new Set([sceneEdgeKey(replacement)])).links).toEqual([graph.links[1]]);
		}
		expect(graph.links[0]).toEqual({ fromSceneId: "a", toSceneId: "b" });
	});

	it("keeps the old arrow when reconnection is invalid, missing or unchanged", () => {
		const graph: SceneGraphData = { nodes: [first, { id: "b", note: note("Храм"), position: { x: 320, y: 50 } }, { id: "c", note: note("Пещера"), position: { x: 320, y: 170 } }], links: [{ fromSceneId: "a", toSceneId: "b" }, { fromSceneId: "a", toSceneId: "c" }] };
		const key = sceneEdgeKey(graph.links[0]);
		for (const replacement of [
			{ fromSceneId: "a", toSceneId: "a" },
			{ fromSceneId: "missing", toSceneId: "b" },
			{ fromSceneId: "a", toSceneId: "b", fromSide: "bottom", toSide: "top" },
		] as const) expect(reconnectSceneLink(graph, key, replacement)).toBe(graph);
		expect(reconnectSceneLink(graph, "missing", { fromSceneId: "b", toSceneId: "a" })).toBe(graph);
	});

	it("connects every pair of sides without moving scenes and preserves the sides in graph data", () => {
		const graph: SceneGraphData = { nodes: [first, { id: "b", note: note("Храм"), position: { x: 320, y: 50 } }], links: [] };
		const sides: SceneGraphSide[] = ["top", "right", "bottom", "left"];
		for (const fromSide of sides) for (const toSide of sides) {
			const link = { id: "link", fromSceneId: "a", toSceneId: "b", fromSide, toSide };
			expect(canConnectScenes(graph, link)).toBe(true);
			const connected = addSceneLink(graph, link);
			expect(connected.nodes).toBe(graph.nodes);
			expect(JSON.parse(JSON.stringify(connected.links))).toEqual([link]);
			expect(removeSceneSelection(connected, new Set(), new Set([sceneEdgeKey(link)])).links).toEqual([]);
		}
		expect(graph.links).toEqual([]);
	});

	it("rejects invalid drawn connections regardless of side and allows the reverse direction", () => {
		const graph: SceneGraphData = { nodes: [first, { id: "b", note: note("Храм"), position: { x: 320, y: 50 } }], links: [{ fromSceneId: "a", toSceneId: "b" }] };
		for (const link of [
			{ fromSceneId: "a", toSceneId: "a", fromSide: "left", toSide: "right" },
			{ fromSceneId: "missing", toSceneId: "b" },
			{ fromSceneId: "a", toSceneId: "missing" },
		] as const) {
			expect(canConnectScenes(graph, link)).toBe(false);
			expect(addSceneLink(graph, link)).toBe(graph);
		}
		const reverse = { id: "reverse", fromSceneId: "b", toSceneId: "a", fromSide: "right", toSide: "left" } as const;
		expect(addSceneLink(graph, reverse).links).toEqual([...graph.links, reverse]);
	});

	it("adds independent scenes and branches without overlapping or moving existing cards", () => {
		const initial: SceneGraphData = { nodes: [first], links: [] };
		const branch = addSceneNote(initial, note("Пещера"), "a", { x: 0, y: 0 }, "b");
		expect(branch.nodes[1].position).toEqual({ x: 100, y: 230 });
		const secondBranch = addSceneNote(branch, note("Храм"), "a", { x: 0, y: 0 }, "c");
		expect(secondBranch.nodes[2].position).toEqual({ x: 430, y: 230 });
		expect(secondBranch.nodes[0]).toBe(first);
		expect(secondBranch.links).toEqual([expect.objectContaining({ fromSceneId: "a", toSceneId: "b" }), expect.objectContaining({ fromSceneId: "a", toSceneId: "c" })]);
		const independent = addSceneNote(secondBranch, note("Зал"), null, { x: 100, y: 50 }, "d");
		expect(independent.links).toBe(secondBranch.links);
		expect(independent.nodes[3].position).not.toEqual(first.position);
	});

	it("merges branches into the same note and permits cycles while preserving IDs and coordinates", () => {
		const initial: SceneGraphData = { nodes: [first, { id: "b", note: note("Храм"), position: { x: 0, y: 170 } }, { id: "c", note: note("Пещера"), position: { x: 220, y: 170 } }], links: [{ fromSceneId: "a", toSceneId: "b" }] };
		const merged = addSceneNote(initial, note("Храм"), "c", { x: 999, y: 999 }, "unused");
		expect(merged.nodes).toBe(initial.nodes);
		expect(merged.links.at(-1)).toMatchObject({ fromSceneId: "c", toSceneId: "b" });
		const cycle = addSceneNote(merged, first.note, "b", { x: 999, y: 999 }, "unused");
		expect(cycle.nodes).toBe(initial.nodes);
		expect(cycle.links.at(-1)).toMatchObject({ fromSceneId: "b", toSceneId: "a" });
	});

	it("rejects self-links, repeated independent notes and missing source scenes", () => {
		const graph: SceneGraphData = { nodes: [first], links: [] };
		expect(addSceneNote(graph, first.note, "a", { x: 0, y: 0 }, "x")).toBe(graph);
		expect(addSceneNote(graph, first.note, null, { x: 0, y: 0 }, "x")).toBe(graph);
		expect(addSceneNote(graph, note("Храм"), "missing", { x: 0, y: 0 }, "x")).toBe(graph);
		const connected = addSceneNote(graph, note("Храм"), "a", { x: 0, y: 0 }, "b");
		expect(addSceneNote(connected, note("Храм"), "a", { x: 0, y: 0 }, "x").links).toHaveLength(2);
	});

	it("deletes an edge independently and removes all incoming and outgoing edges with a scene", () => {
		const graph: SceneGraphData = { nodes: [first, { id: "b", note: note("Храм"), position: { x: 0, y: 170 } }], links: [{ fromSceneId: "a", toSceneId: "b" }, { fromSceneId: "b", toSceneId: "a" }] };
		const removedEdge = removeSceneSelection(graph, new Set(), new Set([sceneEdgeKey(graph.links[0])]));
		expect(removedEdge.nodes).toEqual(graph.nodes);
		expect(removedEdge.links).toEqual([graph.links[1]]);
		const removedScene = removeSceneSelection(graph, new Set(["b"]), new Set());
		expect(removedScene.nodes).toEqual([first]);
		expect(removedScene.links).toEqual([]);
		expect(graph.nodes).toHaveLength(2);
	});

	it("finds free space on either side of a crowded origin", () => {
		const nodes = [-2, -1, 0, 1, 2].map((column) => ({ ...first, id: String(column), position: { x: column * 330, y: 0 } }));
		expect(findScenePosition(nodes, { x: 0, y: 0 })).toEqual({ x: 990, y: 0 });
	});
});
