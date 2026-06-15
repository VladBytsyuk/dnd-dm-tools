<script lang="ts">
	import type {
		AssistantTileState,
		AssistantWorkspaceState,
		PanelKey,
	} from "src/domain/models/assistant/AssistantWorkspace";
	import { setIcon, type IconName } from "obsidian";
	import type { PanelSearchResult } from "src/ui/components/sidepanel/PanelHost";
	import OmniPanelContent from "./OmniPanelContent.svelte";
	import OmniSearchResult from "./OmniSearchResult.svelte";

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
	let query = $state("");
	let results = $state<PanelSearchResult[]>([]);
	let searchSequence = 0;

	const panelByKey = $derived(
		new Map(panels.map((panel) => [panel.key, panel])),
	);

	function persist() {
		saveWorkspace(structuredClone(workspace));
	}

	function setFocusedTile(index: 0 | 1) {
		workspace.focusedTile = index;
		persist();
	}

	function openPanel(key: PanelKey) {
		const existingTileIndex = workspace.tiles.findIndex((tile) =>
			tile.tabs.includes(key),
		);
		if (existingTileIndex >= 0) {
			const tileIndex = existingTileIndex as 0 | 1;
			workspace.tiles[tileIndex].activeTab = key;
			workspace.focusedTile = tileIndex;
			persist();
			return;
		}

		const tileIndex =
			workspace.layout === "single" ? 0 : workspace.focusedTile;
		workspace.tiles[tileIndex].tabs.push(key);
		workspace.tiles[tileIndex].activeTab = key;
		persist();
	}

	function isPanelOpen(key: PanelKey) {
		return workspace.tiles.some((tile) => tile.tabs.includes(key));
	}

	function onIconKeydown(event: KeyboardEvent, action: () => void) {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		action();
	}

	function obsidianIcon(node: HTMLElement, icon: string) {
		setIcon(node, icon as IconName);
		return {
			update(nextIcon: string) {
				node.replaceChildren();
				setIcon(node, nextIcon as IconName);
			},
		};
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
			tile.activeTab =
				tile.tabs[Math.min(index, tile.tabs.length - 1)] ?? null;
		}
		persist();
	}

	function moveTab(
		key: PanelKey,
		fromIndex: 0 | 1,
		toIndex: 0 | 1,
		targetPosition?: number,
	) {
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

	function reorderTab(
		tile: AssistantTileState,
		key: PanelKey,
		offset: -1 | 1,
	) {
		const currentIndex = tile.tabs.indexOf(key);
		const nextIndex = currentIndex + offset;
		if (currentIndex < 0 || nextIndex < 0 || nextIndex >= tile.tabs.length)
			return;
		tile.tabs.splice(currentIndex, 1);
		tile.tabs.splice(nextIndex, 0, key);
		persist();
	}

	function changeLayout() {
		if (workspace.layout === "single") {
			workspace.layout = "vertical-split";
		} else {
			const secondTabs = workspace.tiles[1].tabs;
			workspace.tiles[0].tabs.push(
				...secondTabs.filter(
					(key) => !workspace.tiles[0].tabs.includes(key),
				),
			);
			workspace.tiles[1] = { tabs: [], activeTab: null };
			workspace.layout = "single";
			workspace.focusedTile = 0;
			if (!workspace.tiles[0].activeTab)
				workspace.tiles[0].activeTab =
					workspace.tiles[0].tabs[0] ?? null;
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
		const source = Number(
			event.dataTransfer?.getData("text/tile-index"),
		) as 0 | 1;
		if (panelByKey.has(key) && (source === 0 || source === 1))
			moveTab(key, source, tileIndex, position);
	}
</script>

<div class="omni">
	<div class="omni-toolbar" role="toolbar" aria-label="Панель Помощника ДМа">
		<div class="omni-toolbar__search">
			<input
				type="search"
				placeholder="Поиск по всем разделам"
				value={query}
				oninput={(event) => updateSearch(event.currentTarget.value)}
			/>
			{#if results.length}
				<div class="omni-search-results" aria-label="Результаты поиска">
					{#each results as result (`${result.panelKey}:${result.url}`)}
						<div class="omni-search-results__item">
							<OmniSearchResult
								{result}
								onSelect={() => selectResult(result)}
							/>
						</div>
					{/each}
				</div>
			{/if}
		</div>
		<div class="omni-toolbar__icons" aria-label="Открыть панель">
			{#each panels as panel (panel.key)}
				<div
					class="omni-toolbar__icon"
					class:active={isPanelOpen(panel.key)}
					style:color={isPanelOpen(panel.key)
						? "var(--interactive-accent)"
						: "var(--dnd-ui-text-secondary)"}
					role="button"
					tabindex="0"
					title={panel.title}
					aria-label={`Открыть панель: ${panel.title}`}
					aria-pressed={isPanelOpen(panel.key)}
					onclick={() => openPanel(panel.key)}
					onkeydown={(event) =>
						onIconKeydown(event, () => openPanel(panel.key))}
				>
					<span use:obsidianIcon={panel.icon}></span>
				</div>
			{/each}
			<div
				class="omni-toolbar__icon"
				role="button"
				tabindex="0"
				title={workspace.layout === "single"
					? "Две области"
					: "Одна область"}
				aria-label={workspace.layout === "single"
					? "Переключить на две области"
					: "Переключить на одну область"}
				onclick={changeLayout}
				onkeydown={(event) => onIconKeydown(event, changeLayout)}
			>
				<span
					use:obsidianIcon={workspace.layout === "single"
						? "rows-2"
						: "square"}
				></span>
			</div>
		</div>
	</div>

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
					<div
						class="tabs"
						role="tablist"
						aria-label={`Область ${tileIndex + 1}`}
					>
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
									event.dataTransfer?.setData(
										"text/panel-key",
										key,
									);
									event.dataTransfer?.setData(
										"text/tile-index",
										String(tileIndex),
									);
								}}
								ondragover={(event) => event.preventDefault()}
								ondrop={(event) => {
									event.stopPropagation();
									onDrop(event, tileIndex, tabIndex);
								}}
							>
								<button
									type="button"
									role="tab"
									aria-selected={tile.activeTab === key}
									onclick={() =>
										activate(tile, key, tileIndex)}
								>
									{panelByKey.get(key)?.title ?? key}
								</button>
								<button
									type="button"
									title="Переместить влево"
									disabled={tabIndex === 0}
									onclick={() => reorderTab(tile, key, -1)}
									>‹</button
								>
								<button
									type="button"
									title="Переместить вправо"
									disabled={tabIndex === tile.tabs.length - 1}
									onclick={() => reorderTab(tile, key, 1)}
									>›</button
								>
								{#if workspace.layout === "vertical-split"}
									<button
										type="button"
										title="Переместить в другую область"
										onclick={() =>
											moveTab(
												key,
												tileIndex,
												tileIndex === 0 ? 1 : 0,
											)}>↕</button
									>
								{/if}
								<button
									type="button"
									title="Закрыть"
									onclick={() => closeTab(tile, key)}
									>×</button
								>
							</div>
						{/each}
					</div>
					<div class="body">
						{#if tile.activeTab}
							{#key tile.activeTab}
								<OmniPanelContent
									panelKey={tile.activeTab}
									{mountPanel}
								/>
							{/key}
						{:else}
							<div class="empty">
								<strong>Откройте панель</strong>
								<span
									>Выберите раздел в верхней части Помощника
									ДМа.</span
								>
							</div>
						{/if}
					</div>
				</section>
			{/if}
		{/each}
	</div>
</div>

<style>
	.omni,
	.tiles,
	.tile,
	.body {
		min-height: 0;
	}
	.omni {
		display: flex;
		flex-direction: column;
		align-self: stretch;
		width: 100%;
		max-width: 100%;
		height: 100%;
		gap: var(--dnd-ui-space-4);
	}
	.omni-toolbar {
		display: flex !important;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-start;
		align-content: flex-start;
		justify-content: flex-start;
		gap: var(--dnd-ui-space-4);
		position: relative;
		align-self: stretch;
		width: 100%;
		max-width: 100%;
		min-width: 0;
		container-name: omni-toolbar;
		container-type: inline-size;
	}
	.omni-toolbar__search {
		flex-grow: 1;
		flex-shrink: 1;
		min-width: 720px;
	}
	.omni-toolbar__search input {
		height: 3em;
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--dnd-ui-border-subtle);
		border-radius: var(--dnd-ui-radius-lg);
		background-color: var(--dnd-ui-surface-muted-strong);
		color: var(--dnd-ui-text-primary);
	}
	.omni-search-results {
		position: absolute;
		z-index: 20;
		top: 100%;
		left: 0;
		right: 0;
		display: grid !important;
		grid-template-columns: repeat(
			auto-fit,
			minmax(min(20rem, 100%), 1fr)
		) !important;
		gap: var(--dnd-ui-space-4);
		max-height: 22rem;
		overflow: auto;
		padding: var(--dnd-ui-space-4);
		background: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
	}
	.omni-search-results__item {
		min-width: 0;
	}
	.omni-search-results__item :global(> *) {
		height: 100%;
	}
	.omni-toolbar__icons {
		display: flex !important;
		flex-direction: row !important;
		align-self: center;
		gap: var(--dnd-ui-space-4);
	}
	.omni-toolbar__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border-radius: var(--dnd-ui-radius-md);
		color: var(--dnd-ui-text-secondary);
		cursor: pointer;
	}
	.omni-toolbar__icon:hover {
		background: var(--dnd-ui-surface-hover);
	}
	.omni-toolbar__icon:focus-visible {
		outline: 2px solid var(--dnd-ui-accent-primary);
		outline-offset: var(--dnd-ui-space-2);
	}
	.omni-toolbar__icon.active {
		color: var(--interactive-accent) !important;
	}
	.omni-toolbar__icon span {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.omni-toolbar__icon :global(svg) {
		color: inherit !important;
		stroke: currentColor !important;
	}
	.omni-toolbar__icon.active :global(svg),
	.omni-toolbar__icon.active :global(svg *) {
		color: var(--interactive-accent) !important;
		stroke: var(--interactive-accent) !important;
	}
	@container omni-toolbar (max-width: 720px) {
		.omni-toolbar__search,
		.omni-toolbar__icons {
			grid-column: 1 / -1;
		}
		.omni-toolbar__icons {
			justify-content: flex-start;
		}
	}
	.tiles {
		flex: 1;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		gap: var(--dnd-ui-space-4);
	}
	.tiles.split {
		grid-template-rows: repeat(2, minmax(0, 1fr));
	}
	.tile {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid transparent;
	}
	.tile.focused {
		border-color: var(--interactive-accent);
	}
	.tabs {
		display: flex;
		overflow-x: auto;
		flex: 0 0 auto;
	}
	.focus-tile {
		flex: 0 0 auto;
		font-weight: 700;
	}
	.tab {
		display: flex;
		flex: 0 0 auto;
		border-bottom: 2px solid transparent;
	}
	.tab.active {
		border-bottom-color: var(--interactive-accent);
	}
	.tab button {
		border: 0;
		box-shadow: none;
	}
	.body {
		flex: 1;
		overflow: hidden;
	}
	.empty {
		height: 100%;
		display: grid;
		place-content: center;
		text-align: center;
		color: var(--text-muted);
	}
	.empty strong,
	.empty span {
		display: block;
	}
</style>
