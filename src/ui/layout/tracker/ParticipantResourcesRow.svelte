<script lang="ts">
	import type {
		EncounterParticipantResource,
		EncounterParticipantSpellSlot,
	} from "../../../domain/models/encounter/EncounterParticipant";

	let {
		isEditable,
		colorHex,
		spellSlots,
		resources,
		onSpellSlotsChange,
		onResourcesChange,
	} = $props<{
		isEditable: boolean;
		colorHex: string;
		spellSlots: EncounterParticipantSpellSlot[];
		resources: EncounterParticipantResource[];
		onSpellSlotsChange: (spellSlots: EncounterParticipantSpellSlot[]) => void;
		onResourcesChange: (resources: EncounterParticipantResource[]) => void;
	}>();

	function adjustUsed(used: number, total: number, delta: number) {
		return Math.max(0, Math.min(total, used + delta));
	}

	function adjustSpellSlotUsed(level: number, delta: number) {
		if (!isEditable) return;
		onSpellSlotsChange(spellSlots.map((slot: EncounterParticipantSpellSlot) =>
			slot.level === level
				? { ...slot, used: adjustUsed(slot.used, slot.total, delta) }
				: slot,
		));
	}

	function adjustResourceUsed(id: string, delta: number) {
		if (!isEditable) return;
		onResourcesChange(resources.map((resource: EncounterParticipantResource) =>
			resource.id === id
				? { ...resource, used: adjustUsed(resource.used, resource.total, delta) }
				: resource,
		));
	}

	function handleActivation(event: KeyboardEvent, action: () => void) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			action();
		}
	}
</script>

<div
	class="participant-resources-line"
	style:--participant-resource-accent={colorHex}
	aria-label="Ячейки заклинаний и ресурсы"
>
	{#each spellSlots as slot (slot.level)}
		<div
			class="resource-group"
			role="button"
			tabindex={isEditable ? 0 : -1}
			aria-disabled={!isEditable}
			aria-label={`Использовать ячейку ${slot.level} круга`}
			onclick={() => adjustSpellSlotUsed(slot.level, 1)}
			onkeydown={(event) => handleActivation(event, () => adjustSpellSlotUsed(slot.level, 1))}
		>
			<span class="resource-label">{slot.level} круг</span>
			<div class="markers" role="group" aria-label={`Ячейки ${slot.level} круга`}>
				{#each Array(slot.total) as _, markerIndex}
					<button
						class="marker"
						class:used={markerIndex < slot.used}
						disabled={!isEditable}
						aria-label={`Ячейка ${slot.level} круга ${markerIndex + 1}`}
						aria-pressed={markerIndex < slot.used}
						onkeydown={(event) => event.stopPropagation()}
						onclick={(event) => {
							event.stopPropagation();
							adjustSpellSlotUsed(slot.level, markerIndex < slot.used ? -1 : 1);
						}}
					></button>
				{/each}
			</div>
		</div>
	{/each}

	{#each resources as resource (resource.id)}
		<div
			class="resource-group"
			role="button"
			tabindex={isEditable ? 0 : -1}
			aria-disabled={!isEditable}
			aria-label={`Использовать ресурс ${resource.name}`}
			onclick={() => adjustResourceUsed(resource.id, 1)}
			onkeydown={(event) => handleActivation(event, () => adjustResourceUsed(resource.id, 1))}
		>
			<span class="resource-label" title={resource.name}>{resource.name}</span>
			<div class="markers" role="group" aria-label={resource.name}>
				{#each Array(resource.total) as _, markerIndex}
					<button
						class="marker"
						class:used={markerIndex < resource.used}
						disabled={!isEditable}
						aria-label={`${resource.name}: использование ${markerIndex + 1}`}
						aria-pressed={markerIndex < resource.used}
						onkeydown={(event) => event.stopPropagation()}
						onclick={(event) => {
							event.stopPropagation();
							adjustResourceUsed(resource.id, markerIndex < resource.used ? -1 : 1);
						}}
					></button>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.participant-resources-line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 10px;
		min-width: 0;
	}

	.resource-group,
	.markers {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.resource-group {
		min-width: 0;
		padding: 2px 6px;
		border: 1px solid var(--background-modifier-border);
		border-radius: 8px;
		background: rgba(136, 136, 136, 0.2);
		cursor: pointer;
	}

	.resource-group[aria-disabled="true"] {
		cursor: default;
	}

	.resource-label {
		max-width: 140px;
		overflow: hidden;
		font-size: 12px;
		font-weight: 700;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.marker {
		width: 12px;
		height: 12px;
		min-width: 12px;
		padding: 0;
		border: 1px solid var(--participant-resource-accent);
		border-radius: 999px;
		background: transparent;
		cursor: pointer;
	}

	.marker.used {
		border-color: var(--participant-resource-accent);
		background: var(--participant-resource-accent);
	}

	.marker:disabled {
		cursor: default;
		opacity: 1;
	}
</style>
