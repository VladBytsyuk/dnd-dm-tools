<script lang="ts">
	import {
		activateOrOpenAssistantPanel,
		createAssistantWorkspaceSnapshot,
		type AssistantTileState,
		type AssistantWorkspaceState,
		type PanelKey,
	} from "src/domain/models/assistant/AssistantWorkspace";
	import { setIcon, type IconName } from "obsidian";
	import type { PanelSearchResult } from "src/ui/components/sidepanel/PanelHost";
	import { getPanelTypeColor } from "../uikit/PanelTypeColor";
	import OmniPanelContent from "./OmniPanelContent.svelte";
	import OmniSearchResult from "./OmniSearchResult.svelte";
	import {
		getTabInsertionPosition,
		normalizeTabInsertionPosition,
	} from "./OmniTabDrag";
	import {
		clampTileRatio,
		getTileRatioFromPointer,
		MAX_TILE_RATIO,
		MIN_TILE_RATIO,
	} from "./OmniTileResize";

	type PanelSummary = { key: PanelKey; title: string; icon: string };
	type DraggedTab = { key: PanelKey; tileIndex: 0 | 1 };
	type DropIndicator = {
		tileIndex: 0 | 1;
		position: number;
		boundary: number;
	};

	let {
		panels,
		initialWorkspace,
		search,
		openResult,
		mountPanel,
		discardPanel,
		saveWorkspace,
	}: {
		panels: PanelSummary[];
		initialWorkspace: AssistantWorkspaceState;
		search: (query: string) => Promise<PanelSearchResult[]>;
		openResult: (result: PanelSearchResult) => Promise<void>;
		mountPanel: (key: PanelKey, element: Element) => Promise<() => void>;
		discardPanel: (key: PanelKey) => void;
		saveWorkspace: (workspace: AssistantWorkspaceState) => Promise<void>;
	} = $props();

	function getInitialWorkspace() {
		return initialWorkspace;
	}

	let workspace = $state(getInitialWorkspace());
	let query = $state("");
	let results = $state<PanelSearchResult[]>([]);
	let draggedTab = $state<DraggedTab | null>(null);
	let dropIndicator = $state<DropIndicator | null>(null);
	let tilesElement: HTMLElement;
	let searchSequence = 0;

	const panelByKey = $derived(
		new Map(panels.map((panel) => [panel.key, panel])),
	);

	function persist() {
		saveWorkspace(createAssistantWorkspaceSnapshot(workspace));
	}

	function setFocusedTile(index: 0 | 1) {
		if (workspace.focusedTile === index) return;
		workspace.focusedTile = index;
		persist();
	}

	function setSplitRatio(ratio: number, shouldPersist = false) {
		workspace.splitRatio = clampTileRatio(ratio);
		if (shouldPersist) persist();
	}

	function updateSplitRatioFromPointer(clientY: number) {
		const rect = tilesElement.getBoundingClientRect();
		setSplitRatio(
			getTileRatioFromPointer(clientY, rect.top, rect.height),
		);
	}

	function startSplitResize(event: PointerEvent) {
		event.preventDefault();
		const separator = event.currentTarget as HTMLElement;
		separator.setPointerCapture(event.pointerId);
		updateSplitRatioFromPointer(event.clientY);
	}

	function resizeSplit(event: PointerEvent) {
		const separator = event.currentTarget as HTMLElement;
		if (!separator.hasPointerCapture(event.pointerId)) return;
		updateSplitRatioFromPointer(event.clientY);
	}

	function finishSplitResize(event: PointerEvent) {
		const separator = event.currentTarget as HTMLElement;
		if (!separator.hasPointerCapture(event.pointerId)) return;
		updateSplitRatioFromPointer(event.clientY);
		separator.releasePointerCapture(event.pointerId);
		persist();
	}

	function cancelSplitResize(event: PointerEvent) {
		const separator = event.currentTarget as HTMLElement;
		if (separator.hasPointerCapture(event.pointerId))
			separator.releasePointerCapture(event.pointerId);
		persist();
	}

	function resizeSplitWithKeyboard(event: KeyboardEvent) {
		let nextRatio = workspace.splitRatio;
		if (event.key === "ArrowUp") nextRatio -= 0.05;
		else if (event.key === "ArrowDown") nextRatio += 0.05;
		else if (event.key === "Home") nextRatio = MIN_TILE_RATIO;
		else if (event.key === "End") nextRatio = MAX_TILE_RATIO;
		else return;

		event.preventDefault();
		setSplitRatio(nextRatio, true);
	}

	function openPanel(key: PanelKey) {
		activateOrOpenAssistantPanel(workspace, key);
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
		discardPanel(key);
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

	function updateDropIndicator(
		event: DragEvent,
		tileIndex: 0 | 1,
		tabList: HTMLElement,
		append = false,
	) {
		if (!draggedTab) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = "move";

		const tabs = Array.from(
			tabList.querySelectorAll<HTMLElement>(".tab"),
		);
		const rawPosition = append
			? tabs.length
			: getTabInsertionPosition(
					event.clientX,
					tabs.map((tab) => {
						const rect = tab.getBoundingClientRect();
						return rect.left + rect.width / 2;
					}),
				);
		const sourcePosition = workspace.tiles[
			draggedTab.tileIndex
		].tabs.indexOf(draggedTab.key);
		if (sourcePosition < 0) return;

		dropIndicator = {
			tileIndex,
			position: normalizeTabInsertionPosition(
				rawPosition,
				sourcePosition,
				draggedTab.tileIndex === tileIndex,
				tabs.length,
			),
			boundary: rawPosition,
		};
	}

	function onTileDragOver(event: DragEvent, tileIndex: 0 | 1) {
		const tile = event.currentTarget as HTMLElement;
		const tabList = tile.querySelector<HTMLElement>(".tabs");
		if (tabList) updateDropIndicator(event, tileIndex, tabList, true);
	}

	function clearDropIndicator(event: DragEvent, tileIndex: 0 | 1) {
		const nextTarget = event.relatedTarget;
		const tile = event.currentTarget as HTMLElement;
		if (nextTarget instanceof Node && tile.contains(nextTarget))
			return;
		if (dropIndicator?.tileIndex === tileIndex) dropIndicator = null;
	}

	function clearDragState() {
		draggedTab = null;
		dropIndicator = null;
	}

	function onDrop(event: DragEvent, tileIndex: 0 | 1, position?: number) {
		event.preventDefault();
		const key =
			draggedTab?.key ??
			(event.dataTransfer?.getData("text/panel-key") as PanelKey);
		const source =
			draggedTab?.tileIndex ??
			(Number(
				event.dataTransfer?.getData("text/tile-index"),
			) as 0 | 1);
		const targetPosition =
			position ??
			(dropIndicator?.tileIndex === tileIndex
				? dropIndicator.position
				: undefined);
		clearDragState();
		if (panelByKey.has(key) && (source === 0 || source === 1))
			moveTab(key, source, tileIndex, targetPosition);
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
		</div>
		<div class="omni-toolbar__icons" aria-label="Открыть панель">
			{#each panels as panel (panel.key)}
				<div
					class="omni-toolbar__icon"
					class:active={isPanelOpen(panel.key)}
					style={`--panel-type-color: ${getPanelTypeColor(panel.key)}`}
					style:color={isPanelOpen(panel.key)
						? "var(--panel-type-color)"
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

	<div
		bind:this={tilesElement}
		class="tiles"
		style:grid-template-rows={workspace.layout === "vertical-split"
			? `${workspace.splitRatio}fr 1px ${1 - workspace.splitRatio}fr`
			: undefined}
	>
		{#each workspace.tiles as tile, rawIndex}
			{@const tileIndex = rawIndex as 0 | 1}
			{#if tileIndex === 0 || workspace.layout === "vertical-split"}
				{#if tileIndex === 1}
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<div
						class="split-separator"
						role="separator"
						tabindex="0"
						aria-label="Изменить высоту областей"
						aria-orientation="horizontal"
						aria-valuemin={Math.round(MIN_TILE_RATIO * 100)}
						aria-valuemax={Math.round(MAX_TILE_RATIO * 100)}
						aria-valuenow={Math.round(workspace.splitRatio * 100)}
						onpointerdown={startSplitResize}
						onpointermove={resizeSplit}
						onpointerup={finishSplitResize}
						onpointercancel={cancelSplitResize}
						onkeydown={resizeSplitWithKeyboard}
					></div>
				{/if}
				<section
					class="tile"
					role="group"
					onpointerdown={() => setFocusedTile(tileIndex)}
					onfocusin={() => setFocusedTile(tileIndex)}
					ondragover={(event) => onTileDragOver(event, tileIndex)}
					ondragleave={(event) =>
						clearDropIndicator(event, tileIndex)}
					ondrop={(event) => onDrop(event, tileIndex)}
				>
					<div
						class="tabs"
						class:drop-target={dropIndicator?.tileIndex === tileIndex}
						class:drop-empty={
							dropIndicator?.tileIndex === tileIndex &&
							tile.tabs.length === 0
						}
						role="tablist"
						tabindex="-1"
						ondragover={(event) => {
							event.stopPropagation();
							updateDropIndicator(
								event,
								tileIndex,
								event.currentTarget,
							);
						}}
						ondrop={(event) => {
							event.stopPropagation();
							onDrop(
								event,
								tileIndex,
								dropIndicator?.tileIndex === tileIndex
									? dropIndicator.position
									: undefined,
							);
						}}
					>
						{#each tile.tabs as key, tabIndex (key)}
							<div
								class:active={tile.activeTab === key}
								class:drop-before={
									dropIndicator?.tileIndex === tileIndex &&
									dropIndicator.boundary === tabIndex
								}
								class:drop-after={
									dropIndicator?.tileIndex === tileIndex &&
									dropIndicator.boundary === tile.tabs.length &&
									tabIndex === tile.tabs.length - 1
								}
								class="tab"
								style={`--panel-type-color: ${getPanelTypeColor(key)}`}
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
									if (event.dataTransfer)
										event.dataTransfer.effectAllowed = "move";
									draggedTab = { key, tileIndex };
								}}
								ondragend={clearDragState}
							>
								<button
									type="button"
									class="tab-title"
									role="tab"
									aria-selected={tile.activeTab === key}
									onclick={() =>
										activate(tile, key, tileIndex)}
								>
									<span
										class="tab-icon"
										use:obsidianIcon={panelByKey.get(key)
											?.icon ?? "panel-top"}
									></span>
									<span>{panelByKey.get(key)?.title ?? key}</span>
								</button>
								<button
									type="button"
									class="tab-close"
									title="Закрыть"
									aria-label={`Закрыть ${panelByKey.get(key)?.title ?? key}`}
									onclick={() => closeTab(tile, key)}
								>
									<span use:obsidianIcon={"x"}></span>
								</button>
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
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
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
		min-width: min(500px, 100%);
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
		z-index: 20;
		grid-row: 2;
		grid-column: 1;
		min-height: 0;
		display: grid !important;
		grid-template-columns: repeat(
			auto-fit,
			minmax(min(20rem, 100%), 1fr)
		) !important;
		gap: var(--dnd-ui-space-4);
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
		flex-wrap: wrap;
		align-self: flex-start;
		align-content: flex-start;
		gap: var(--dnd-ui-space-4);
		max-width: 100%;
		min-width: 0;
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
		color: var(--panel-type-color) !important;
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
		color: var(--panel-type-color) !important;
		stroke: var(--panel-type-color) !important;
	}
	@container omni-toolbar (max-width: 720px) {
		.omni-toolbar__search,
		.omni-toolbar__icons {
			flex-basis: 100%;
		}
		.omni-toolbar__icons {
			justify-content: flex-start;
		}
	}
	.tiles {
		grid-row: 2;
		grid-column: 1;
		display: grid;
		grid-template-rows: minmax(0, 1fr);
	}
	.tile {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.split-separator {
		position: relative;
		z-index: 4;
		width: 100%;
		height: 1px;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: rgb(128 128 128 / 0.55);
		box-shadow: none;
		cursor: row-resize;
		touch-action: none;
	}
	.split-separator::before {
		content: "";
		position: absolute;
		inset: -4px 0;
	}
	.split-separator:focus-visible {
		outline: 2px solid var(--interactive-accent);
		outline-offset: 2px;
	}
	.tabs {
		display: flex;
		gap: var(--dnd-ui-space-4);
		overflow-x: auto;
		flex: 0 0 auto;
		border-radius: var(--dnd-ui-radius-md);
	}
	.tabs.drop-target {
		background: color-mix(
			in srgb,
			var(--interactive-accent) 10%,
			transparent
		);
	}
	.tabs.drop-empty {
		outline: 2px dashed var(--interactive-accent);
		outline-offset: -2px;
	}
	.tab.drop-before::before,
	.tab.drop-after::after {
		content: "";
		position: absolute;
		z-index: 3;
		top: 0;
		bottom: 0;
		width: 4px;
		border-radius: 2px;
		background: var(--interactive-accent);
		box-shadow: 0 0 0 1px var(--background-primary);
		pointer-events: none;
	}
	.tab.drop-before::before {
		left: -2px;
	}
	.tab.drop-after::after {
		right: -2px;
	}
	.tab {
		position: relative;
		display: flex;
		flex: 0 0 auto;
		border-bottom: 2px solid transparent;
	}
	.tab.active {
		border-bottom-color: var(--panel-type-color);
	}
	.tab.active .tab-icon,
	.tab.active .tab-icon :global(svg),
	.tab.active .tab-icon :global(svg *) {
		color: var(--panel-type-color);
		stroke: var(--panel-type-color);
	}
	.tab button {
		border: 0;
		box-shadow: none;
	}
	.tab-title {
		display: flex;
		align-items: center;
		gap: var(--dnd-ui-space-4);
		padding-right: 2rem;
		background: transparent;
	}
	.tab-title:hover,
	.tab-title:focus-visible {
		background: transparent;
	}
	.tab-icon,
	.tab-icon :global(svg) {
		width: 1rem;
		height: 1rem;
	}
	.tab-close span,
	.tab-close :global(svg) {
		width: 0.75rem;
		height: 0.75rem;
	}
	.tab-icon {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
	}
	.tab-close {
		position: absolute;
		top: 50%;
		right: var(--dnd-ui-space-2);
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		padding: 0;
		border-radius: 50%;
		background: var(--color-red);
		color: white;
		opacity: 0;
		pointer-events: none;
	}
	.tab:hover .tab-close,
	.tab:focus-within .tab-close {
		opacity: 1;
		pointer-events: auto;
	}
	.tab-close:hover,
	.tab-close:focus-visible {
		background: color-mix(in srgb, var(--color-red) 85%, black);
		color: white;
	}
	.tab-close :global(svg),
	.tab-close :global(svg *) {
		stroke: currentColor;
	}
	.body {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		overflow-x: hidden;
		overflow-y: auto;
		padding-top: 2px;
		box-sizing: border-box;
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
