import type { Node, Edge } from "@xyflow/svelte";
import type { SceneGraphNote } from "./sceneGraphModel";

export type SceneFlowNode = Node<{ note: SceneGraphNote; theme: "dark" | "light" }, "scene">;
export type SceneFlowEdge = Edge<{ offset: number; label: string; color: string }, "scene">;
