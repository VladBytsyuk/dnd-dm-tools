<script lang="ts">
	import {
		Play,
		StepForward,
		ClipboardCopy,
		ClipboardPaste,
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

	let { app, encounter, isEditable, onPortraitClick, onConditionClick } =
		$props<{
			app: any;
			encounter: Encounter;
			isEditable: boolean;
			onPortraitClick: (url: string) => void;
			onConditionClick: (url: string) => void;
		}>();

	const encounterManager = new EncounterManager(encounter);

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
			true,
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

		<div class="actions">
			<div class="actions-row">
				<button
					class="btn"
					onclick={onPlayNext}
					aria-label={state.current.activeParticipantIndex == null
						? "Начать столкновение"
						: "Следующий ход"}
				>
					{#if state.current.activeParticipantIndex == null}
						<Play size={16} />
						<span>Старт</span>
					{:else}
						<StepForward size={16} />
						<span>Дальше</span>
					{/if}
				</button>

				<button
					class="btn"
					onclick={stopEncounter}
					aria-label="Остановить столкновение"
				>
					<Square size={16} />
				</button>
			</div>

			<div class="actions-row">
				<button
					class="btn ghost"
					onclick={sortByInitiative}
					aria-label="Сортировать участников по инициативе"
				>
					<ArrowUpDown size={16} />
				</button>

				<button
					class="btn ghost"
					onclick={copyEncounter}
					aria-label="Копировать столкновение"
				>
					<ClipboardCopy size={16} />
				</button>

				{#if isEditable}
					<button
						class="btn ghost"
						onclick={pasteEncounter}
						aria-label="Вставить столкновение"
					>
						<ClipboardPaste size={16} />
					</button>
				{/if}
			</div>

			{#if isEditable}
			<div class="actions-row">
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
			</div>
			{/if}
		</div>
	</header>

	<div class="content">
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
						resolveIconSrc={resolvePluginAsset}
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
					aria-label="Вставить участника или столкновение из буфера обмена"
				>
					<ClipboardPaste size={16} />
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
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		border-radius: 12px;
		background: var(--background-secondary);
		border: 1px solid var(--background-modifier-border);
	}

	.left {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 220px;
	}

	.roundCompact {
		display: inline-grid;
		place-items: center;
		width: 48px;
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
		font-weight: 800;
		width: min(360px, 48vw);
		min-width: 120px;
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 4px 2px 4px 2px;
		flex-wrap: wrap;
	}

	.actions-row {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 8px;
		border-radius: 10px;
		border: 1px solid var(--background-modifier-border);
		background: var(--interactive-normal);
		color: var(--text-on-accent);
		cursor: pointer;
		user-select: none;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn.ghost {
		background: transparent;
		color: var(--text-normal);
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

	.content {
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
	}

	.footerPrimary {
		flex: 1;
		justify-content: center;
	}

	.footerSecondary {
		flex: 0 0 auto;
		justify-content: center;
		padding-left: 12px;
		padding-right: 12px;
	}
</style>