<script lang="ts">
	import type {
		AssistantTileState,
		AssistantWorkspaceState,
		PanelKey,
	} from "src/domain/models/assistant/AssistantWorkspace";
	import type { PanelSearchResult } from "src/ui/components/sidepanel/PanelHost";
	import OmniPanelContent from "./OmniPanelContent.svelte";

	type PanelSummary = { key: PanelKey; title: string; icon: string };

	let {
		panels,
		initialWorkspace,
		search,
		openResult,
		mountPanel,
		saveWorkspace,
	}: {
		panels: PanelSummary[];
		initialWorkspace: AssistantWorkspaceState;
		search: (query: string) => Promise<PanelSearchResult[]>;
		openResult: (result: PanelSearchResult) => Promise<void>;
		mountPanel: (key: PanelKey, element: Element) => Promise<() => void>;
		saveWorkspace: (workspace: AssistantWorkspaceState) => Promise<void>;
	} = $props();

	function getInitialWorkspace() {
		return initialWorkspace;
	}

	let workspace = $state(getInitialWorkspace());
	let selectedPanel = $state<PanelKey | "">("");
	let query = $state("");
	let results = $state<PanelSearchResult[]>([]);
	let searchSequence = 0;

	const panelByKey = $derived(new Map(panels.map((panel) => [panel.key, panel])));
	const availablePanels = $derived(panels.filter((panel) =>
		!workspace.tiles.some((tile) => tile.tabs.includes(panel.key))
	));

	function persist() {
		saveWorkspace(structuredClone(workspace));
	}

	function setFocusedTile(index: 0 | 1) {
		workspace.focusedTile = index;
		persist();
	}

	function addSelectedPanel() {
		if (!selectedPanel) return;
		const tileIndex = workspace.layout === "single" ? 0 : workspace.focusedTile;
		workspace.tiles[tileIndex].tabs.push(selectedPanel);
		workspace.tiles[tileIndex].activeTab = selectedPanel;
		selectedPanel = "";
		persist();
	}

	function activate(tile: AssistantTileState, key: PanelKey, index: 0 | 1) {
		tile.activeTab = key;
		workspace.focusedTile = index;
		persist();
	}

	function closeTab(tile: AssistantTileState, key: PanelKey) {
		const index = tile.tabs.indexOf(key);
		tile.tabs = tile.tabs.filter((tab) => tab !== key);
		if (tile.activeTab === key) {
			tile.activeTab = tile.tabs[Math.min(index, tile.tabs.length - 1)] ?? null;
		}
		persist();
	}

	function moveTab(key: PanelKey, fromIndex: 0 | 1, toIndex: 0 | 1, targetPosition?: number) {
		const source = workspace.tiles[fromIndex];
		const target = workspace.tiles[toIndex];
		source.tabs = source.tabs.filter((tab) => tab !== key);
		if (source.activeTab === key) source.activeTab = source.tabs[0] ?? null;
		const position = targetPosition ?? target.tabs.length;
		target.tabs.splice(position, 0, key);
		target.activeTab = key;
		workspace.focusedTile = toIndex;
		persist();
	}

	function reorderTab(tile: AssistantTileState, key: PanelKey, offset: -1 | 1) {
		const currentIndex = tile.tabs.indexOf(key);
		const nextIndex = currentIndex + offset;
		if (currentIndex < 0 || nextIndex < 0 || nextIndex >= tile.tabs.length) return;
		tile.tabs.splice(currentIndex, 1);
		tile.tabs.splice(nextIndex, 0, key);
		persist();
	}

	function changeLayout() {
		if (workspace.layout === "single") {
			workspace.layout = "vertical-split";
		} else {
			const secondTabs = workspace.tiles[1].tabs;
			workspace.tiles[0].tabs.push(...secondTabs.filter((key) => !workspace.tiles[0].tabs.includes(key)));
			workspace.tiles[1] = { tabs: [], activeTab: null };
			workspace.layout = "single";
			workspace.focusedTile = 0;
			if (!workspace.tiles[0].activeTab) workspace.tiles[0].activeTab = workspace.tiles[0].tabs[0] ?? null;
		}
		persist();
	}

	async function updateSearch(value: string) {
		query = value;
		const sequence = ++searchSequence;
		if (!query.trim()) {
			results = [];
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, 180));
		const next = await search(query);
		if (sequence === searchSequence) results = next;
	}

	async function selectResult(result: PanelSearchResult) {
		query = "";
		results = [];
		await openResult(result);
	}

	function onDrop(event: DragEvent, tileIndex: 0 | 1, position?: number) {
		event.preventDefault();
		const key = event.dataTransfer?.getData("text/panel-key") as PanelKey;
		const source = Number(event.dataTransfer?.getData("text/tile-index")) as 0 | 1;
		if (panelByKey.has(key) && (source === 0 || source === 1)) moveTab(key, source, tileIndex, position);
	}
</script>

<div class="omni">
	<header class="toolbar">
		<div class="search">
			<input
				type="search"
				placeholder="Поиск по всем разделам"
				value={query}
				oninput={(event) => updateSearch(event.currentTarget.value)}
			/>
			{#if results.length}
				<div class="results">
					{#each results as result (`${result.panelKey}:${result.url}`)}
						<button type="button" onclick={() => selectResult(result)}>
							<strong>{result.title}</strong>
							<span>{panelByKey.get(result.panelKey)?.title}{result.subtitle ? ` · ${result.subtitle}` : ""}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
		<select bind:value={selectedPanel} aria-label="Выбрать панель">
			<option value="">Открыть панель</option>
			{#each availablePanels as panel}
				<option value={panel.key}>{panel.title}</option>
			{/each}
		</select>
		<button type="button" onclick={addSelectedPanel} disabled={!selectedPanel}>Открыть</button>
		<button type="button" onclick={changeLayout}>
			{workspace.layout === "single" ? "Две области" : "Одна область"}
		</button>
	</header>

	<div class:split={workspace.layout === "vertical-split"} class="tiles">
		{#each workspace.tiles as tile, rawIndex}
			{@const tileIndex = rawIndex as 0 | 1}
			{#if tileIndex === 0 || workspace.layout === "vertical-split"}
				<section
					class:focused={workspace.focusedTile === tileIndex}
					class="tile"
					role="group"
					aria-label={`Область ${tileIndex + 1}`}
					ondragover={(event) => event.preventDefault()}
					ondrop={(event) => onDrop(event, tileIndex)}
				>
					<div class="tabs" role="tablist" aria-label={`Область ${tileIndex + 1}`}>
						<button
							type="button"
							class="focus-tile"
							aria-pressed={workspace.focusedTile === tileIndex}
							onclick={() => setFocusedTile(tileIndex)}
						>
							{tileIndex + 1}
						</button>
						{#each tile.tabs as key, tabIndex (key)}
							<div
								class:active={tile.activeTab === key}
								class="tab"
								role="group"
								aria-label={panelByKey.get(key)?.title ?? key}
								draggable="true"
								ondragstart={(event) => {
									event.dataTransfer?.setData("text/panel-key", key);
									event.dataTransfer?.setData("text/tile-index", String(tileIndex));
								}}
								ondragover={(event) => event.preventDefault()}
								ondrop={(event) => {
									event.stopPropagation();
									onDrop(event, tileIndex, tabIndex);
								}}
							>
								<button type="button" role="tab" aria-selected={tile.activeTab === key} onclick={() => activate(tile, key, tileIndex)}>
									{panelByKey.get(key)?.title ?? key}
								</button>
								<button type="button" title="Переместить влево" disabled={tabIndex === 0} onclick={() => reorderTab(tile, key, -1)}>‹</button>
								<button type="button" title="Переместить вправо" disabled={tabIndex === tile.tabs.length - 1} onclick={() => reorderTab(tile, key, 1)}>›</button>
								{#if workspace.layout === "vertical-split"}
									<button type="button" title="Переместить в другую область" onclick={() => moveTab(key, tileIndex, tileIndex === 0 ? 1 : 0)}>↕</button>
								{/if}
								<button type="button" title="Закрыть" onclick={() => closeTab(tile, key)}>×</button>
							</div>
						{/each}
					</div>
					<div class="body">
						{#if tile.activeTab}
							{#key tile.activeTab}
								<OmniPanelContent panelKey={tile.activeTab} {mountPanel} />
							{/key}
						{:else}
							<div class="empty">
								<strong>Откройте панель</strong>
								<span>Выберите раздел в верхней части Помощника ДМа.</span>
							</div>
						{/if}
					</div>
				</section>
			{/if}
		{/each}
	</div>
</div>

<style>
	.omni, .tiles, .tile, .body { min-height: 0; }
	.omni { display: flex; flex-direction: column; height: 100%; gap: var(--dnd-ui-space-4); }
	.toolbar { display: flex; gap: var(--dnd-ui-space-4); flex-wrap: wrap; position: relative; }
	.search { flex: 1 1 16rem; position: relative; }
	.search input { width: 100%; }
	.results {
		position: absolute; z-index: 20; inset: 100% 0 auto 0; max-height: 22rem; overflow: auto;
		background: var(--background-primary); border: 1px solid var(--background-modifier-border);
	}
	.results button { display: flex; flex-direction: column; width: 100%; text-align: left; padding: .5rem; }
	.results span { color: var(--text-muted); font-size: var(--font-ui-smaller); }
	.tiles { flex: 1; display: grid; grid-template-rows: minmax(0, 1fr); gap: var(--dnd-ui-space-4); }
	.tiles.split { grid-template-rows: repeat(2, minmax(0, 1fr)); }
	.tile { display: flex; flex-direction: column; overflow: hidden; border: 1px solid transparent; }
	.tile.focused { border-color: var(--interactive-accent); }
	.tabs { display: flex; overflow-x: auto; flex: 0 0 auto; }
	.focus-tile { flex: 0 0 auto; font-weight: 700; }
	.tab { display: flex; flex: 0 0 auto; border-bottom: 2px solid transparent; }
	.tab.active { border-bottom-color: var(--interactive-accent); }
	.tab button { border: 0; box-shadow: none; }
	.body { flex: 1; overflow: hidden; }
	.empty { height: 100%; display: grid; place-content: center; text-align: center; color: var(--text-muted); }
	.empty strong, .empty span { display: block; }
</style>
