<script lang="ts">
	import { onMount } from "svelte";
	import {
		Play,
		StepForward,
		ClipboardCopy,
		ClipboardPaste,
		ArrowUpDown,
		Skull,
		Plus,
		Square,
	} from "lucide-svelte";
	import { d20, roll } from "src/domain/dice";
	import {
		copyEncounterToClipboard,
		getEncounterFromClipboard,
		getEncounterParticipantFromClipboard,
	} from "src/data/clipboard";
	import type { Encounter } from "src/domain/models/encounter/Encounter";
	import type { EncounterParticipant } from "src/domain/models/encounter/EncounterParticipant";
	import ParticipantItem from "./ParticipantItem.svelte";

	let { app, encounter, isEditable, onPortraitClick, onConditionClick } =
		$props<{
			app: any;
			encounter: Encounter;
			isEditable: boolean;
			onPortraitClick: (url: string) => void;
			onConditionClick: (url: string) => void;
		}>();

	let stateEncounter: Encounter = $state(encounter);
	let activeParticipantIndex: number | null = $state(null);

	let round: number = $state(1);
	let idCounter: number = $state(encounter.participants.length);

	const updateParticipants = (newParticipants: EncounterParticipant[]) => {
		stateEncounter = {
			...stateEncounter,
			participants: newParticipants as any,
		};
	};

	onMount(() => {
		updateParticipants(stateEncounter.participants);
	});

	const setEncounterName = (name: string) => {
		if (!isEditable) return;
		stateEncounter = { ...(stateEncounter as any), name } as any;
	};

	const setValue = (
		id: number,
		field: keyof EncounterParticipant,
		value: any,
	) => {
		if (!isEditable) return;
		const ps = stateEncounter.participants.map((p) =>
			p.id === id
				? ({ ...p, [field]: value } as EncounterParticipant)
				: p,
		);
		updateParticipants(ps);
	};

	const sortByInitiative = () => {
		const ps = stateEncounter.participants.slice();
		ps.sort(
			(a, b) => Number(b.initiative ?? 0) - Number(a.initiative ?? 0),
		);
		updateParticipants(ps);
	};

	const rollInitiative = () => {
		const ps = stateEncounter.participants.map((p) => {
			const init = Number(p.initiative ?? 0);
			if (init !== 0) return p;

			const mod = Number(p.initiativeModifier ?? 0);
			const res = roll(d20()(mod));
			return { ...p, initiative: res };
		});
		updateParticipants(ps);
	};

	const startEncounter = () => {
		rollInitiative();
		sortByInitiative();

		const ps = stateEncounter.participants;
		const firstAliveParticipantIndex = ps.findIndex((p) => !p.isDead);
		activeParticipantIndex = firstAliveParticipantIndex !== -1 ? firstAliveParticipantIndex : null;
		round = 1;
	};

	const nextStepEncounter = () => {
		const ps = stateEncounter.participants;
		const total = ps.length;

		if (total === 0 || activeParticipantIndex == null) {
			stopEncounter();
			return;
		}

		const start = activeParticipantIndex;

		for (let step = 1; step <= total; step++) {
			const nextIdx = (start + step) % total;

			if (!ps[nextIdx].isDead) {
				if (nextIdx <= start) {
					round += 1;
				}
				activeParticipantIndex = nextIdx;
				return;
			}
		}
		stopEncounter();
	};

	const stopEncounter = () => {
		activeParticipantIndex = null;
		round = 1;
	};

	const onPlayNext = () => {
		if (activeParticipantIndex == null) startEncounter();
		else nextStepEncounter();
	};

	const addParticipant = () => {
		if (!isEditable) return;

		const p: EncounterParticipant = {
			id: Math.random(),
			name: "-",
			initiative: 0,
			initiativeModifier: 0,
			hpCurrent: 0,
			hpTemporary: 0,
			hpMax: 0,
			armorClass: 10,
			imageUrl: "",
			passivePerception: 10,
			side: "neutral",
			isDead: false,
		};

		const ps = stateEncounter.participants.slice();
		ps.push(p);
		updateParticipants(ps);
	};

	const removeParticipant = (id: number) => {
		if (!isEditable) return;

		const ps = stateEncounter.participants.filter((p) => p.id !== id);
		updateParticipants(ps);

		if (activeParticipantIndex != null) {
			if (ps.length === 0) activeParticipantIndex = null;
			else
				activeParticipantIndex = Math.min(
					activeParticipantIndex,
					ps.length - 1,
				);
		}
	};

	const toggleDead = (id: number) => {
		if (!isEditable) return;

		const ps = stateEncounter.participants.map((p) =>
			p.id === id
				? ({ ...p, isDead: !Boolean(p.isDead) } as EncounterParticipant)
				: p,
		);
		updateParticipants(ps);

		// если текущий стал мёртвым — сразу скип
		const idx = ps.findIndex((p) => p.id === id);
		if (idx !== -1 && activeParticipantIndex === idx && ps.length > 0)
			nextStepEncounter();
	};

	const onOpenStatblock = (p: EncounterParticipant) => {
		if (p.url) onPortraitClick(p.url);
	};

	const onOpenConditionDetails = (url: string) => {
		if (url) onConditionClick(url);
	};

	const copyEncounter = async () => {
		await copyEncounterToClipboard(stateEncounter);
	};

	const pasteEncounter = async () => {
		if (!isEditable) return;

		const clipboard = await getEncounterFromClipboard();
		if (!clipboard) return;

		stateEncounter = clipboard;
		idCounter = clipboard.participants.length;
		stopEncounter();
	};

	const pasteParticipant = async () => {
		if (!isEditable) return;

		const p = (await getEncounterParticipantFromClipboard(
			true,
		)) as EncounterParticipant | null;
		if (!p) {
			const e = (await getEncounterFromClipboard()) as Encounter | null;

			if (e && e.participants.length > 0) {
				const ps = stateEncounter.participants.slice();
				e.participants.forEach((participant) => {
					ps.push({ ...participant, id: Math.random() });
				});
				updateParticipants(ps);
			} else {
				return;
			}
		} else {
			const ps = stateEncounter.participants.slice();
			ps.push(p);
			updateParticipants(ps);
		}
	};

	const resolvePluginAsset = (relativePath: string) => {
		const base = `${app.vault.configDir}/plugins/dnd-dm-tools/`;
		return app.vault.adapter.getResourcePath(base + relativePath);
	};
</script>

<div class="tracker">
	<header class="topbar">
		<div class="left">
			<div class="roundCompact" aria-label="Раунд">{round}</div>

			{#if isEditable}
				<input
					class="titleInput inputlike"
					value={(stateEncounter as any).name ?? "Encounter"}
					oninput={(e) =>
						setEncounterName((e.target as HTMLInputElement).value)}
				/>
			{:else}
				<div class="titleText">
					{(stateEncounter as any).name ?? "Encounter"}
				</div>
			{/if}
		</div>

		<div class="actions">
			<div class="actions-row">
				<button
					class="btn"
					onclick={onPlayNext}
					aria-label={activeParticipantIndex == null
						? "Начать столкновение"
						: "Следующий ход"}
				>
					{#if activeParticipantIndex == null}
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
		</div>
	</header>

	<div class="content">
		{#if stateEncounter.participants.length === 0}
			<div class="empty">
				<Skull size={18} />
				<span>No participants yet.</span>
			</div>
		{:else}
			<div class="list">
				{#each stateEncounter.participants as participant, index (participant.id)}
					<ParticipantItem
						{participant}
						{isEditable}
						isActive={activeParticipantIndex === index}
						{onOpenStatblock}
						{onOpenConditionDetails}
						onSetValue={setValue}
						onToggleDead={toggleDead}
						onRemove={removeParticipant}
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
