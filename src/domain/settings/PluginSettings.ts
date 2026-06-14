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
export type PluginMode = "separate" | "omni";
export type OmniLayout = "single" | "vertical-split";

export interface OmniTileSettings {
	tabs: PanelKey[];
	activeTab: PanelKey | null;
}

export interface PluginSettings {
	schemaVersion: 1;
	mode: PluginMode;
	separatePanels: Record<PanelKey, boolean>;
	omniWorkspace: {
		layout: OmniLayout;
		focusedTile: 0 | 1;
		tiles: [OmniTileSettings, OmniTileSettings];
	};
}

export function createDefaultSettings(existingInstallation: boolean): PluginSettings {
	return {
		schemaVersion: 1,
		mode: existingInstallation ? "separate" : "omni",
		separatePanels: Object.fromEntries(PANEL_KEYS.map((key) => [key, true])) as Record<PanelKey, boolean>,
		omniWorkspace: {
			layout: "single",
			focusedTile: 0,
			tiles: [
				{ tabs: [], activeTab: null },
				{ tabs: [], activeTab: null },
			],
		},
	};
}

function isPanelKey(value: unknown): value is PanelKey {
	return typeof value === "string" && (PANEL_KEYS as readonly string[]).includes(value);
}

export function normalizeSettings(
	value: unknown,
	existingInstallation: boolean,
): PluginSettings {
	const defaults = createDefaultSettings(existingInstallation);
	if (!value || typeof value !== "object") return defaults;

	const raw = value as Partial<PluginSettings>;
	const seen = new Set<PanelKey>();
	const rawTiles = raw.omniWorkspace?.tiles;
	const normalizeTile = (index: number): OmniTileSettings => {
		const candidate = Array.isArray(rawTiles) ? rawTiles[index] : undefined;
		const tabs = Array.isArray(candidate?.tabs)
			? candidate.tabs.filter((key): key is PanelKey => {
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
	const layout = raw.omniWorkspace?.layout === "vertical-split" ? "vertical-split" : "single";
	if (layout === "single" && secondTile.tabs.length) {
		firstTile.tabs.push(...secondTile.tabs);
		secondTile.tabs = [];
		secondTile.activeTab = null;
	}

	return {
		schemaVersion: 1,
		mode: raw.mode === "separate" || raw.mode === "omni" ? raw.mode : defaults.mode,
		separatePanels: Object.fromEntries(PANEL_KEYS.map((key) => [
			key,
			typeof raw.separatePanels?.[key] === "boolean"
				? raw.separatePanels[key]
				: defaults.separatePanels[key],
		])) as Record<PanelKey, boolean>,
		omniWorkspace: {
			layout,
			focusedTile: layout === "single" ? 0 : raw.omniWorkspace?.focusedTile === 1 ? 1 : 0,
			tiles: [firstTile, secondTile],
		},
	};
}
