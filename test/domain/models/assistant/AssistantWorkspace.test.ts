import { describe, expect, it } from "vitest";
import {
	activateOrOpenAssistantPanel,
	createAssistantWorkspaceSnapshot,
	createDefaultAssistantWorkspace,
	loadAssistantWorkspace,
} from "src/domain/models/assistant/AssistantWorkspace";

describe("AssistantWorkspace", () => {
	it("defaults to an empty workspace", () => {
		expect(createDefaultAssistantWorkspace()).toEqual({
			layout: "single",
			focusedTile: 0,
			splitRatio: 0.5,
			tiles: [
				{ tabs: [], activeTab: null },
				{ tabs: [], activeTab: null },
			],
		});
	});

	it("creates a detached workspace snapshot", () => {
		const workspace = createDefaultAssistantWorkspace();
		workspace.tiles[0].tabs.push("bestiary");
		workspace.tiles[0].activeTab = "bestiary";

		const snapshot = createAssistantWorkspaceSnapshot(workspace);
		workspace.tiles[0].tabs.push("spellbook");

		expect(snapshot).toEqual({
			layout: "single",
			focusedTile: 0,
			splitRatio: 0.5,
			tiles: [
				{ tabs: ["bestiary"], activeTab: "bestiary" },
				{ tabs: [], activeTab: null },
			],
		});
	});

	it("focuses an existing panel without moving or reordering it", () => {
		const workspace = loadAssistantWorkspace({
			layout: "vertical-split",
			focusedTile: 0,
			tiles: [
				{
					tabs: ["bestiary", "spellbook"],
					activeTab: "bestiary",
				},
				{
					tabs: ["equipment", "artifactory"],
					activeTab: "artifactory",
				},
			],
		}).workspace;

		activateOrOpenAssistantPanel(workspace, "equipment");

		expect(workspace.focusedTile).toBe(1);
		expect(workspace.tiles).toEqual([
			{
				tabs: ["bestiary", "spellbook"],
				activeTab: "bestiary",
			},
			{
				tabs: ["equipment", "artifactory"],
				activeTab: "equipment",
			},
		]);
	});

	it("activates an existing panel in the focused tile without reordering it", () => {
		const workspace = loadAssistantWorkspace({
			layout: "vertical-split",
			focusedTile: 0,
			tiles: [
				{
					tabs: ["bestiary", "spellbook"],
					activeTab: "bestiary",
				},
				{ tabs: ["equipment"], activeTab: "equipment" },
			],
		}).workspace;

		activateOrOpenAssistantPanel(workspace, "spellbook");

		expect(workspace.focusedTile).toBe(0);
		expect(workspace.tiles[0]).toEqual({
			tabs: ["bestiary", "spellbook"],
			activeTab: "spellbook",
		});
	});

	it("opens a missing panel in the focused split tile", () => {
		const workspace = loadAssistantWorkspace({
			layout: "vertical-split",
			focusedTile: 1,
			tiles: [
				{ tabs: ["bestiary"], activeTab: "bestiary" },
				{ tabs: ["equipment"], activeTab: "equipment" },
			],
		}).workspace;

		activateOrOpenAssistantPanel(workspace, "spellbook");

		expect(workspace.tiles[1]).toEqual({
			tabs: ["equipment", "spellbook"],
			activeTab: "spellbook",
		});
	});

	it("opens a missing panel in the first tile for a single layout", () => {
		const workspace = createDefaultAssistantWorkspace();
		workspace.focusedTile = 1;

		activateOrOpenAssistantPanel(workspace, "bestiary");

		expect(workspace.focusedTile).toBe(0);
		expect(workspace.tiles).toEqual([
			{ tabs: ["bestiary"], activeTab: "bestiary" },
			{ tabs: [], activeTab: null },
		]);
	});

	it("preserves a legacy Assistant workspace", () => {
		const result = loadAssistantWorkspace({
			schemaVersion: 1,
			mode: "omni",
			omniWorkspace: {
				layout: "vertical-split",
				focusedTile: 1,
				tiles: [
					{ tabs: ["bestiary"], activeTab: "bestiary" },
					{ tabs: ["spellbook"], activeTab: "spellbook" },
				],
			},
		});

		expect(result.shouldResetLegacyViews).toBe(false);
		expect(result.workspace).toEqual({
			layout: "vertical-split",
			focusedTile: 1,
			splitRatio: 0.5,
			tiles: [
				{ tabs: ["bestiary"], activeTab: "bestiary" },
				{ tabs: ["spellbook"], activeTab: "spellbook" },
			],
		});
	});

	it("resets legacy Separate data and requests legacy view cleanup", () => {
		const result = loadAssistantWorkspace({
			schemaVersion: 1,
			mode: "separate",
			separatePanels: { bestiary: false },
		});

		expect(result.shouldResetLegacyViews).toBe(true);
		expect(result.workspace).toEqual(createDefaultAssistantWorkspace());
	});

	it("loads the previous wrapped workspace payload", () => {
		const result = loadAssistantWorkspace({
			schemaVersion: 2,
			workspace: {
				layout: "vertical-split",
				focusedTile: 1,
				tiles: [
					{ tabs: ["bestiary"], activeTab: "bestiary" },
					{ tabs: ["spellbook"], activeTab: "spellbook" },
				],
			},
		});

		expect(result.workspace.focusedTile).toBe(1);
		expect(result.workspace.tiles[1].tabs).toEqual(["spellbook"]);
	});

	it("normalizes unknown and duplicate tabs in a direct workspace payload", () => {
		const result = loadAssistantWorkspace({
			layout: "vertical-split",
			focusedTile: 1,
			tiles: [
				{
					tabs: ["bestiary", "unknown", "bestiary", "spellbook"],
					activeTab: "unknown",
				},
				{
					tabs: ["spellbook", "initiative-tracker"],
					activeTab: "initiative-tracker",
				},
			],
		});

		expect(result.workspace).toEqual({
			layout: "vertical-split",
			focusedTile: 1,
			splitRatio: 0.5,
			tiles: [
				{ tabs: ["bestiary", "spellbook"], activeTab: "bestiary" },
				{ tabs: ["initiative-tracker"], activeTab: "initiative-tracker" },
			],
		});
	});

	it("merges a hidden second tile in a single layout", () => {
		const result = loadAssistantWorkspace({
			layout: "single",
			focusedTile: 1,
			tiles: [
				{ tabs: ["bestiary"], activeTab: "bestiary" },
				{ tabs: ["spellbook"], activeTab: "spellbook" },
			],
		});

		expect(result.workspace.focusedTile).toBe(0);
		expect(result.workspace.tiles).toEqual([
			{ tabs: ["bestiary", "spellbook"], activeTab: "bestiary" },
			{ tabs: [], activeTab: null },
		]);
	});

	it("preserves a valid split ratio", () => {
		const result = loadAssistantWorkspace({
			layout: "vertical-split",
			focusedTile: 0,
			splitRatio: 0.7,
			tiles: [],
		});

		expect(result.workspace.splitRatio).toBe(0.7);
	});

	it.each([undefined, null, "0.7", Number.NaN, 0.1, 0.9])(
		"normalizes an invalid split ratio: %s",
		(splitRatio) => {
			const result = loadAssistantWorkspace({
				layout: "vertical-split",
				splitRatio,
				tiles: [],
			});

			expect(result.workspace.splitRatio).toBe(0.5);
		},
	);
});
