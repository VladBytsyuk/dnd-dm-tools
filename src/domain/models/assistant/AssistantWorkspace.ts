export const PANEL_KEYS = [
	"bestiary",
	"spellbook",
	"dm-screen",
	"arsenal",
	"armory",
	"equipment",
	"artifactory",
	"backgrounds",
	"feats",
	"races",
	"classes",
	"character-sheets",
	"initiative-tracker",
] as const;

export type PanelKey = typeof PANEL_KEYS[number];
export type AssistantLayout = "single" | "vertical-split";

export interface AssistantTileState {
	tabs: PanelKey[];
	activeTab: PanelKey | null;
}

export interface AssistantWorkspaceState {
	layout: AssistantLayout;
	focusedTile: 0 | 1;
	splitRatio: number;
	tiles: [AssistantTileState, AssistantTileState];
}

export interface AssistantWorkspaceLoadResult {
	workspace: AssistantWorkspaceState;
	shouldResetLegacyViews: boolean;
}

export function createDefaultAssistantWorkspace(): AssistantWorkspaceState {
	return {
		layout: "single",
		focusedTile: 0,
		splitRatio: 0.5,
		tiles: [
			{ tabs: [], activeTab: null },
			{ tabs: [], activeTab: null },
		],
	};
}

export function createAssistantWorkspaceSnapshot(
	workspace: AssistantWorkspaceState,
): AssistantWorkspaceState {
	return {
		layout: workspace.layout,
		focusedTile: workspace.focusedTile,
		splitRatio: workspace.splitRatio,
		tiles: workspace.tiles.map((tile) => ({
			tabs: [...tile.tabs],
			activeTab: tile.activeTab,
		})) as [AssistantTileState, AssistantTileState],
	};
}

function isPanelKey(value: unknown): value is PanelKey {
	return typeof value === "string" && (PANEL_KEYS as readonly string[]).includes(value);
}

export function loadAssistantWorkspace(value: unknown): AssistantWorkspaceLoadResult {
	const defaults = createDefaultAssistantWorkspace();
	if (!value || typeof value !== "object") {
		return { workspace: defaults, shouldResetLegacyViews: false };
	}

	const stored = value as Record<string, any>;
	const isLegacySeparate = stored.schemaVersion === 1 && stored.mode === "separate";
	if (isLegacySeparate) {
		return { workspace: defaults, shouldResetLegacyViews: true };
	}

	const storedWorkspace = stored.schemaVersion === 1
		? stored.omniWorkspace
		: stored.workspace ?? stored;
	const seen = new Set<PanelKey>();
	const storedTiles = storedWorkspace?.tiles;
	const normalizeTile = (index: number): AssistantTileState => {
		const candidate = Array.isArray(storedTiles) ? storedTiles[index] : undefined;
		const tabs = Array.isArray(candidate?.tabs)
			? candidate.tabs.filter((key: unknown): key is PanelKey => {
				if (!isPanelKey(key) || seen.has(key)) return false;
				seen.add(key);
				return true;
			})
			: [];
		const activeTab = isPanelKey(candidate?.activeTab) && tabs.includes(candidate.activeTab)
			? candidate.activeTab
			: tabs[0] ?? null;
		return { tabs, activeTab };
	};

	const firstTile = normalizeTile(0);
	const secondTile = normalizeTile(1);
	const layout = storedWorkspace?.layout === "vertical-split" ? "vertical-split" : "single";
	if (layout === "single" && secondTile.tabs.length) {
		firstTile.tabs.push(...secondTile.tabs);
		secondTile.tabs = [];
		secondTile.activeTab = null;
	}

	return {
		workspace: {
			layout,
			focusedTile: layout === "single" ? 0 : storedWorkspace?.focusedTile === 1 ? 1 : 0,
			splitRatio:
				typeof storedWorkspace?.splitRatio === "number" &&
				Number.isFinite(storedWorkspace.splitRatio) &&
				storedWorkspace.splitRatio >= 0.15 &&
				storedWorkspace.splitRatio <= 0.85
					? storedWorkspace.splitRatio
					: 0.5,
			tiles: [firstTile, secondTile],
		},
		shouldResetLegacyViews: false,
	};
}
