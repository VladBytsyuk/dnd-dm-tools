<script lang="ts">
	import type {
		EncounterParticipantResource,
		EncounterParticipantSpellSlot,
	} from "../../../domain/models/encounter/EncounterParticipant";

	let {
		isEditable,
		spellSlots,
		resources,
		onSpellSlotsChange,
		onResourcesChange,
	} = $props<{
		isEditable: boolean;
		spellSlots: EncounterParticipantSpellSlot[];
		resources: EncounterParticipantResource[];
		onSpellSlotsChange: (spellSlots: EncounterParticipantSpellSlot[]) => void;
		onResourcesChange: (resources: EncounterParticipantResource[]) => void;
	}>();

	function nextUsed(used: number, markerIndex: number) {
		return markerIndex < used ? markerIndex : markerIndex + 1;
	}

	function setSpellSlotUsed(level: number, markerIndex: number) {
		if (!isEditable) return;
		onSpellSlotsChange(spellSlots.map((slot: EncounterParticipantSpellSlot) =>
			slot.level === level
				? { ...slot, used: nextUsed(slot.used, markerIndex) }
				: slot,
		));
	}

	function setResourceUsed(id: string, markerIndex: number) {
		if (!isEditable) return;
		onResourcesChange(resources.map((resource: EncounterParticipantResource) =>
			resource.id === id
				? { ...resource, used: nextUsed(resource.used, markerIndex) }
				: resource,
		));
	}
</script>

<div class="participant-resources-line" aria-label="Ячейки заклинаний и ресурсы">
	{#each spellSlots as slot (slot.level)}
		<div class="resource-group">
			<span class="resource-label">{slot.level} круг</span>
			<div class="markers" role="group" aria-label={`Ячейки ${slot.level} круга`}>
				{#each Array(slot.total) as _, markerIndex}
					<button
						class="marker"
						class:used={markerIndex < slot.used}
						disabled={!isEditable}
						aria-label={`Ячейка ${slot.level} круга ${markerIndex + 1}`}
						aria-pressed={markerIndex < slot.used}
						onclick={() => setSpellSlotUsed(slot.level, markerIndex)}
					></button>
				{/each}
			</div>
		</div>
	{/each}

	{#each resources as resource (resource.id)}
		<div class="resource-group">
			<span class="resource-label" title={resource.name}>{resource.name}</span>
			<div class="markers" role="group" aria-label={resource.name}>
				{#each Array(resource.total) as _, markerIndex}
					<button
						class="marker"
						class:used={markerIndex < resource.used}
						disabled={!isEditable}
						aria-label={`${resource.name}: использование ${markerIndex + 1}`}
						aria-pressed={markerIndex < resource.used}
						onclick={() => setResourceUsed(resource.id, markerIndex)}
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
		background: var(--background-primary);
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
		border: 1px solid var(--interactive-accent);
		border-radius: 999px;
		background: transparent;
		cursor: pointer;
	}

	.marker.used {
		background: var(--interactive-accent);
	}

	.marker:disabled {
		cursor: default;
		opacity: 1;
	}
</style>
