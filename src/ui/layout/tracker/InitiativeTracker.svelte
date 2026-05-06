<script lang="ts">
	import {
		Play,
		StepForward,
		ClipboardCopy,
		ClipboardPlus,
		Replace,
		ArrowUpDown,
		Skull,
		Plus,
		Square,
		Undo,
		Redo,
		Trash2,
	} from "lucide-svelte";
	import {
		copyEncounterToClipboard,
		getEncounterFromClipboard,
		getEncounterParticipantFromClipboard,
	} from "src/data/clipboard";
	import type { Encounter } from "src/domain/models/encounter/Encounter";
	import { EncounterManager } from "src/domain/models/encounter/EncounterManager";
	import type { EncounterParticipant, EncounterParticipantCondition } from "src/domain/models/encounter/EncounterParticipant";
	import ParticipantItem from "./ParticipantItem.svelte";

	let { app, encounter, isEditable, onPortraitClick, onConditionClick, onImageRequested } =
		$props<{
			app: any;
			encounter: Encounter;
			isEditable: boolean;
			onPortraitClick: (url: string) => void;
			onConditionClick: (url: string) => void;
			onImageRequested: (url: string) => Promise<string>;
		}>();

	function createEncounterManager() {
		return new EncounterManager(encounter);
	}

	const encounterManager = createEncounterManager();

	let state = $state({
		current: encounterManager.current,
		canUndo: encounterManager.canUndo,
		canRedo: encounterManager.canRedo,
	});

	encounterManager.setOnUpdate(() => {
		state.current = encounterManager.current;
		state.canUndo = encounterManager.canUndo;
		state.canRedo = encounterManager.canRedo;
	});

	const setEncounterName = (name: string) => {
		if (!isEditable) return;
		encounterManager.setName(name);
	};

	const setValue = (
		id: number,
		field: keyof EncounterParticipant,
		value: any,
	) => {
		if (!isEditable) return;
		encounterManager.setParticipantValue(id, field, value);
	};

	const sortByInitiative = () => {
		encounterManager.sortByInitiative();
	};

	const startEncounter = () => {
		encounterManager.startEncounter();
	};

	const nextStepEncounter = () => {
		encounterManager.nextStepEncounter();
	};

	const stopEncounter = () => {
		encounterManager.stopEncounter();
	};

	const onPlayNext = () => {
		if (state.current.activeParticipantIndex == null) startEncounter();
		else nextStepEncounter();
	};

	const addParticipant = () => {
		if (!isEditable) return;
		encounterManager.addParticipant();
	};

	const removeParticipant = (id: number) => {
		if (!isEditable) return;
		encounterManager.removeParticipant(id);
	};

	const toggleDead = (id: number) => {
		if (!isEditable) return;
		encounterManager.toggleDead(id);
	};

	const onOpenStatblock = (p: EncounterParticipant) => {
		if (p.url) onPortraitClick(p.url);
	};

	const onOpenConditionDetails = (url: string) => {
		if (url) onConditionClick(url);
	};

	const copyEncounter = async () => {
		await copyEncounterToClipboard(state.current.encounter);
	};


	const pasteEncounter = async () => {
		if (!isEditable) return;

		const clipboard = await getEncounterFromClipboard();
		if (!clipboard) return;

		encounterManager.pasteEncounter(clipboard);
	};

	const pasteParticipant = async () => {
		if (!isEditable) return;

		const p = (await getEncounterParticipantFromClipboard(
			false,
		)) as EncounterParticipant | null;
		if (!p) {
			const e = (await getEncounterFromClipboard()) as Encounter | null;

			if (e && e.participants.length > 0) {
				encounterManager.pasteParticipants(e.participants)
			} else {
				return;
			}
		} else {
			encounterManager.pasteParticipants([p])
		}
	};

	const resolvePluginAsset = (relativePath: string) => {
		const base = `${app.vault.configDir}/plugins/dnd-dm-tools/`;
		return app.vault.adapter.getResourcePath(base + relativePath);
	};

	const onConditionChange = (participantId: number, condition: EncounterParticipantCondition) => {
		if (!isEditable) return;
		encounterManager.setCondition(participantId, condition);
	};

	const onConditionDelete = (participantId: number, url: string) => {
		if (!isEditable) return;
		encounterManager.deleteCondition(participantId, url);
	};

	const undo = () => {
		if (!isEditable) return;
		encounterManager.undo();
	}

	const redo = () => {
		if (!isEditable) return;
		encounterManager.redo();
	}

	const clearEncounter = () => {
		if (!isEditable) return;
		encounterManager.clearEncounter();
	}
</script>

<div class="tracker">
	<header class="topbar">
		<div class="left">
			<div class="roundCompact" aria-label="Раунд">{state.current.round}</div>

			{#if isEditable}
				<input
					class="titleInput inputlike"
					value={state.current.encounter.name ?? "Encounter"}
					oninput={(e) =>
						setEncounterName((e.target as HTMLInputElement).value)}
				/>
			{:else}
				<div class="titleText">
					{state.current.encounter.name ?? "Encounter"}
				</div>
			{/if}
		</div>

		<div class="actions" class:editableActions={isEditable}>
			{#if isEditable}
				<button
					class="btn ghost"
					onclick={sortByInitiative}
					aria-label="Сортировать участников по инициативе"
				>
					<ArrowUpDown size={16} />
				</button>
			{/if}

			<button
				class="btn ghost"
				onclick={copyEncounter}
				aria-label="Копировать столкновение"
			>
				<ClipboardCopy size={16} />
			</button>

			{#if isEditable}
				<button
					class="btn ghost replaceAction"
					onclick={pasteEncounter}
					aria-label="Заменить столкновение данными из буфера обмена"
					title="Заменить столкновение данными из буфера обмена"
				>
					<Replace size={16} />
				</button>

				<button
					class="btn ghost"
					onclick={undo}
					disabled={!state.canUndo}
					aria-label="Отменить"
				>
					<Undo size={16} />
				</button>

				<button
					class="btn ghost"
					onclick={redo}
					disabled={!state.canRedo}
					aria-label="Повторить"
				>
					<Redo size={16} />
				</button>
				<button
					class="btn ghost"
					onclick={clearEncounter}
					aria-label="Очистить"
				>
					<Trash2 size={16} />
				</button>
				<button
					class="btn"
					onclick={stopEncounter}
					aria-label="Остановить столкновение"
				>
					<Square size={16} />
				</button>
				<button
					class="btn playNext"
					onclick={onPlayNext}
					aria-label={state.current.activeParticipantIndex == null
						? "Начать столкновение"
						: "Следующий ход"}
				>
					{#if state.current.activeParticipantIndex == null}
						<Play size={16} />
					{:else}
						<StepForward size={16} />
					{/if}
				</button>
			{/if}
		</div>
	</header>

	<div class="tracker-content">
		{#if state.current.encounter.participants.length === 0}
			<div class="empty">
				<Skull size={18} />
				<span>No participants yet.</span>
			</div>
		{:else}
			<div class="list">
				{#each state.current.encounter.participants as participant, index (participant.id)}
					<ParticipantItem
						participant={participant}
						isEditable={isEditable}
						isActive={state.current.activeParticipantIndex === index}
						onOpenStatblock={onOpenStatblock}
						onOpenConditionDetails={onOpenConditionDetails}
						onSetValue={setValue}
						onToggleDead={toggleDead}
						onRemove={removeParticipant}
						onConditionChange={onConditionChange}
						onConditionDelete={onConditionDelete}
						getRound={() => state.current.round}
						onImageRequested={onImageRequested}
					/>
				{/each}
			</div>
		{/if}

		{#if isEditable}
			<footer class="footer">
				<button
					class="btn footerPrimary"
					onclick={addParticipant}
					aria-label="Добавить участника"
				>
					<Plus size={16} />
				</button>

				<button
					class="btn footerSecondary"
					onclick={pasteParticipant}
					aria-label="Добавить участника или столкновение из буфера обмена"
					title="Добавить участника или столкновение из буфера обмена"
				>
					<ClipboardPlus size={16} />
				</button>
			</footer>
		{/if}

	</div>

</div>

<style>
	.tracker {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px;
		min-width: 380px;
		container-type: inline-size;
	}

	.topbar {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		box-sizing: border-box;
		border-radius: 12px;
		background: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
	}

	.left {
		display: flex;
		align-items: center;
		gap: 4px;
		flex: 1 1 180px;
		min-width: 0;
	}

	.roundCompact {
		display: inline-grid;
		place-items: center;
		width: 48px;
		padding: 0px 0px 0px 8px;
		font-size: 20px;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}

	.titleText {
		font-weight: 800;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.titleInput {
		flex: 1 1 120px;
		font-weight: 800;
		width: auto;
		min-width: 120px;
		max-width: 100%;
	}

	.actions {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		flex: 0 1 auto;
		width: auto;
		min-width: 0;
		max-width: 100%;
		box-sizing: border-box;
		gap: 4px;
		padding: 4px 2px 4px 2px;
	}

	.actions.editableActions {
		display: grid;
		grid-template-columns: repeat(8, 32px);
		justify-content: flex-end;
	}

	@container (max-width: 520px) {
		.actions.editableActions {
			grid-template-columns: repeat(4, 32px);
		}
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		gap: 8px;
		width: auto;
		min-width: 0;
		max-width: max-content;
		padding: 4px 8px;
		box-sizing: border-box;
		border-radius: 10px;
		border: 1px solid var(--background-modifier-border);
		background: var(--interactive-normal);
		color: var(--text-normal);
		cursor: pointer;
		user-select: none;
	}

	.actions > .btn {
		flex: 0 0 32px;
		width: 32px;
		min-width: 32px;
		max-width: 32px;
		height: 28px;
		padding: 4px 0;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn.ghost {
		background: transparent;
		color: var(--text-normal);
	}

	.btn.replaceAction {
		border-color: var(--text-warning);
		background: color-mix(in srgb, var(--text-warning) 12%, transparent);
		color: var(--text-warning);
	}

	.btn.playNext {
		border-color: var(--interactive-accent);
		background: var(--interactive-accent);
		color: var(--text-on-accent);
	}

	/* inputlike — как в ParticipantItem */
	.inputlike {
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-normal);
		border-radius: 8px;
		padding: 2px 6px;
		line-height: 18px;
	}

	.inputlike:focus {
		outline: none;
		border-color: var(--interactive-accent);
		background: var(--background-secondary);
	}

	.tracker-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.empty {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 14px;
		border-radius: 12px;
		background: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
	}

	.list {
		display: flex;
		flex-direction: column;
		border-radius: 14px;
		background: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
		overflow: hidden;
	}

	.footer {
		display: flex;
		gap: 8px;
		align-items: stretch;
		margin-top: 4px;
	}

	.footerPrimary {
		flex: 1 1 auto;
		width: auto;
		max-width: none;
		justify-content: center;
	}

	.footerSecondary {
		flex: 0 1 auto;
		justify-content: center;
		padding-left: 12px;
		padding-right: 12px;
		background: color-mix(in srgb, var(--interactive-accent) 12%, var(--background-secondary));
		color: var(--text-accent);
		border-color: var(--interactive-accent);
	}

</style>
