import { describe, expect, it } from "vitest";
import { layoutSceneGraph } from "src/ui/layout/media/sceneGraphLayout";

describe("layoutSceneGraph", () => {
	it("lays out connected scenes left to right", () => {
		const layout = layoutSceneGraph(
			[{ id: "a", path: "Scenes/Start.md" }, { id: "b", path: "Scenes/End.md" }],
			[{ fromSceneId: "a", toSceneId: "b" }],
		);
		expect(layout.nodes[0].x).toBeLessThan(layout.nodes[1].x);
		expect(layout.nodes.map((node) => node.label)).toEqual(["Start", "End"]);
		expect(layout.edges).toHaveLength(1);
	});

	it("handles cycles, self links, and disconnected scenes", () => {
		const layout = layoutSceneGraph(
			[{ id: "a", path: "A.md" }, { id: "b", path: "B.md" }, { id: "c", path: "C.md" }],
			[
				{ fromSceneId: "a", toSceneId: "b" },
				{ fromSceneId: "b", toSceneId: "a" },
				{ fromSceneId: "b", toSceneId: "b" },
			],
		);
		expect(layout.nodes).toHaveLength(3);
		expect(layout.nodes[0].x).toBe(layout.nodes[1].x);
		expect(layout.nodes[0].y).not.toBe(layout.nodes[1].y);
		expect(layout.nodes[2].x).toBeGreaterThanOrEqual(0);
		expect(layout.edges).toHaveLength(3);
		expect(layout.edges.every((edge) => edge.path.length > 0)).toBe(true);
	});

	it("ignores links to deleted scenes and preserves missing file indicators", () => {
		const layout = layoutSceneGraph(
			[{ id: "a", path: "Lost.md", missing: true }],
			[{ fromSceneId: "a", toSceneId: "gone" }],
		);
		expect(layout.nodes[0].missing).toBe(true);
		expect(layout.edges).toHaveLength(0);
	});
});
