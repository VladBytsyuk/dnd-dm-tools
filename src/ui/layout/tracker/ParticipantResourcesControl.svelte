<script lang="ts">
	import { onDestroy, tick } from "svelte";
	import { Plus, Save, Sparkles, Trash2, X } from "lucide-svelte";
	import type {
		EncounterParticipantResource,
		EncounterParticipantSpellSlot,
		SpellSlotLevel,
	} from "../../../domain/models/encounter/EncounterParticipant";

	type OverlayPosition = { x: number; y: number };

	let {
		isEditable,
		onResourcesChange,
		getSpellSlots,
		getResources,
	} = $props<{
		isEditable: boolean;
		onResourcesChange: (
			spellSlots: EncounterParticipantSpellSlot[],
			resources: EncounterParticipantResource[],
		) => void;
		getSpellSlots: () => EncounterParticipantSpellSlot[];
		getResources: () => EncounterParticipantResource[];
	}>();

	let isOpen = $state(false);
	let spellSlotCounts = $state<number[]>(Array(9).fill(0));
	let resourceDrafts = $state<EncounterParticipantResource[]>([]);
	let popoverEl: HTMLDivElement | null = $state(null);
	let position = $state<OverlayPosition>({ x: 0, y: 0 });
	let portalRoot: HTMLDivElement | null = null;

	const hasInvalidResource = $derived(resourceDrafts.some((resource) =>
		resource.name.trim().length === 0 || normalizeCount(resource.total) < 1,
	));

	onDestroy(() => {
		portalRoot?.remove();
		portalRoot = null;
	});

	function normalizeCount(value: number) {
		const numericValue = Number(value);
		return Number.isFinite(numericValue)
			? Math.max(0, Math.min(9, Math.trunc(numericValue)))
			: 0;
	}

	function open(e: MouseEvent | KeyboardEvent) {
		if (!isEditable) return;

		e.stopPropagation();
		const slotsByLevel = new Map<SpellSlotLevel, EncounterParticipantSpellSlot>(
			getSpellSlots().map((slot: EncounterParticipantSpellSlot) => [slot.level, slot]),
		);
		spellSlotCounts = Array.from({ length: 9 }, (_, index) =>
			normalizeCount(slotsByLevel.get((index + 1) as SpellSlotLevel)?.total ?? 0),
		);
		resourceDrafts = getResources().map((resource: EncounterParticipantResource) => ({ ...resource }));
		isOpen = true;
		positionPopover(e.currentTarget as HTMLElement);
	}

	function close() {
		isOpen = false;
	}

	function addResource() {
		resourceDrafts = [
			...resourceDrafts,
			{
				id: `resource-${Date.now()}-${Math.random()}`,
				name: "",
				total: 1,
				used: 0,
			},
		];
	}

	function removeResource(id: string) {
		resourceDrafts = resourceDrafts.filter((resource) => resource.id !== id);
	}

	function save() {
		if (hasInvalidResource) return;

		const existingSlots = new Map<SpellSlotLevel, EncounterParticipantSpellSlot>(
			getSpellSlots().map((slot: EncounterParticipantSpellSlot) => [slot.level, slot]),
		);
		const spellSlots = spellSlotCounts.flatMap((rawTotal, index) => {
			const total = normalizeCount(rawTotal);
			if (total === 0) return [];

			const level = (index + 1) as SpellSlotLevel;
			return [{
				level,
				total,
				used: Math.min(total, normalizeCount(existingSlots.get(level)?.used ?? 0)),
			}];
		});
		const existingResources = new Map<string, EncounterParticipantResource>(
			getResources().map((resource: EncounterParticipantResource) => [resource.id, resource]),
		);
		const resources = resourceDrafts.map((resource: EncounterParticipantResource) => {
			const total = Math.max(1, normalizeCount(resource.total));
			return {
				...resource,
				name: resource.name.trim(),
				total,
				used: Math.min(total, normalizeCount(existingResources.get(resource.id)?.used ?? resource.used)),
			};
		});

		onResourcesChange(spellSlots, resources);
		close();
	}

	function handleActivation(event: KeyboardEvent, callback: () => void) {
		if (event.key === "Enter" || event.key === " ") callback();
	}

	async function positionPopover(anchor: HTMLElement) {
		const rect = anchor.getBoundingClientRect();
		position.x = rect.left;
		position.y = rect.bottom + 6;
		await tick();

		const popover = popoverEl;
		if (!popover) return;

		const popoverRect = popover.getBoundingClientRect();
		const padding = 8;
		if (position.x + popoverRect.width > window.innerWidth - padding) {
			position.x = Math.max(padding, window.innerWidth - padding - popoverRect.width);
		}
		if (position.y + popoverRect.height > window.innerHeight - padding) {
			position.y = Math.max(padding, rect.top - popoverRect.height - 6);
		}
	}

	function ensurePortalRoot() {
		if (portalRoot) return portalRoot;
		portalRoot = document.createElement("div");
		portalRoot.className = "dnd-dm-resources-popover-root";
		document.body.appendChild(portalRoot);
		return portalRoot;
	}

	function portal(node: HTMLElement) {
		const root = ensurePortalRoot();
		const placeholder = document.createComment("resources-popover-portal");
		const parent = node.parentNode;
		parent?.insertBefore(placeholder, node);
		root.appendChild(node);

		return {
			destroy() {
				if (placeholder.parentNode) {
					placeholder.parentNode.insertBefore(node, placeholder);
					placeholder.remove();
				} else {
					node.remove();
				}
			},
		};
	}
</script>

<div class="resources-control">
	<div
		class="resources-trigger"
		aria-label="Ячейки заклинаний и ресурсы"
		aria-expanded={isOpen}
		role="button"
		tabindex="0"
		onclick={open}
		onkeydown={(e) => handleActivation(e, () => open(e))}
	>
		<Sparkles size={20} />
	</div>

	{#if isOpen}
		<div
			class="resources-popover"
			use:portal
			bind:this={popoverEl}
			style="left:{position.x}px; top:{position.y}px;"
			role="dialog"
			tabindex="-1"
			aria-label="Настройка ячеек заклинаний и ресурсов"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="popover-header">
				<strong>Ячейки заклинаний</strong>
				<button class="icon-button" aria-label="Закрыть" onclick={close}><X size={16} /></button>
			</div>

			<div class="slots-grid">
				{#each spellSlotCounts as count, index}
					<label>
						<span>{index + 1}</span>
						<input
							type="number"
							min="0"
							max="9"
							step="1"
							aria-label={`Ячейки ${index + 1} круга`}
							bind:value={spellSlotCounts[index]}
						/>
					</label>
				{/each}
			</div>

			<div class="resources-header">
				<strong>Ресурсы</strong>
				<button class="icon-button" aria-label="Добавить ресурс" onclick={addResource}><Plus size={16} /></button>
			</div>

			<div class="resource-list">
				{#each resourceDrafts as resource (resource.id)}
					<div class="resource-row">
						<input
							class="resource-name"
							aria-label="Название ресурса"
							placeholder="Название"
							bind:value={resource.name}
						/>
						<input
							class="resource-count"
							type="number"
							min="1"
							max="9"
							step="1"
							aria-label={`Количество ресурса ${resource.name || "без названия"}`}
							bind:value={resource.total}
						/>
						<button
							class="icon-button danger"
							aria-label={`Удалить ресурс ${resource.name || "без названия"}`}
							onclick={() => removeResource(resource.id)}
						><Trash2 size={16} /></button>
					</div>
				{/each}
			</div>

			<div class="popover-actions">
				<button class="save-button" disabled={hasInvalidResource} onclick={save}><Save size={16} />Сохранить</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.resources-control {
		position: relative;
	}

	.resources-trigger {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 24px;
		color: var(--text-muted);
		cursor: pointer;
		background: var(--background-secondary);
	}

	.resources-trigger:hover,
	.resources-trigger[aria-expanded="true"] {
		color: var(--text-normal);
		background: var(--background-modifier-hover);
	}

	.resources-popover {
		position: absolute;
		z-index: 100000;
		width: min(360px, calc(100vw - 16px));
		padding: 10px;
		border: 1px solid var(--background-modifier-border);
		border-radius: 8px;
		background: var(--background-primary);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
	}

	.popover-header,
	.resources-header,
	.popover-actions,
	.resource-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.popover-header,
	.resources-header {
		justify-content: space-between;
	}

	.slots-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
		margin: 8px 0 12px;
	}

	.slots-grid label {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.slots-grid input,
	.resource-count {
		width: 54px;
	}

	.resource-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 8px;
	}

	.resource-name {
		min-width: 0;
		flex: 1;
	}

	.icon-button {
		display: inline-grid;
		place-items: center;
		padding: 4px;
		color: var(--text-normal);
		background: transparent;
	}

	.icon-button.danger {
		color: var(--text-error);
	}

	.popover-actions {
		justify-content: flex-end;
		margin-top: 12px;
	}

	.popover-actions button {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.save-button {
		color: var(--text-on-accent);
		background: var(--interactive-accent);
	}

	:global(.dnd-dm-resources-popover-root) {
		position: fixed;
		inset: 0;
		z-index: 100000;
		pointer-events: none;
	}

	:global(.dnd-dm-resources-popover-root) .resources-popover {
		pointer-events: auto;
	}
</style>
