<script lang="ts">
	import {
		Play,
		StepForward,
		ClipboardCopy,
		ClipboardPlus,
		Download,
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
	import { Notice, requestUrl } from "obsidian";
	import type { Encounter } from "src/domain/models/encounter/Encounter";
	import { EncounterManager } from "src/domain/models/encounter/EncounterManager";
	import type {
		EncounterParticipant,
		EncounterParticipantCondition,
		EncounterParticipantResource,
		EncounterParticipantSpellSlot,
	} from "src/domain/models/encounter/EncounterParticipant";
	import {
		createEncounterId,
		createOwlbearEncounterSnapshot,
		type OwlbearEncounterSnapshot,
	} from "src/domain/models/owlbear/OwlbearSync";
	import ParticipantItem from "./ParticipantItem.svelte";

	let { app, encounter, isEditable, onPortraitClick, onConditionClick, onImageRequested, onOwlbearSnapshotCreated, onOwlbearTurnChanged } =
		$props<{
			app: any;
			encounter: Encounter;
			isEditable: boolean;
			onPortraitClick: (url: string) => void;
			onConditionClick: (url: string) => void;
			onImageRequested: (url: string) => Promise<string>;
			onOwlbearSnapshotCreated: (snapshot: OwlbearEncounterSnapshot) => Promise<void>;
			onOwlbearTurnChanged: (snapshot: OwlbearEncounterSnapshot) => Promise<void>;
		}>();

	function createEncounterManager() {
		return new EncounterManager(encounter);
	}

	const encounterManager = createEncounterManager();
	const owlbearEncounterId = createEncounterId();

	let trackerState = $state({
		current: encounterManager.current,
		canUndo: encounterManager.canUndo,
		canRedo: encounterManager.canRedo,
	});
	let owlbearSynced = $state(false);
	let owlbearSyncVersion = 0;
	let owlbearSyncInFlight = false;
	let owlbearSyncTimer: number | null = null;

	encounterManager.setOnUpdate(() => {
		trackerState.current = encounterManager.current;
		trackerState.canUndo = encounterManager.canUndo;
		trackerState.canRedo = encounterManager.canRedo;
		if (owlbearSynced) {
			queueOwlbearSync();
		}
	});

	function queueOwlbearSync() {
		owlbearSyncVersion += 1;
		if (owlbearSyncInFlight || owlbearSyncTimer != null) return;
		owlbearSyncTimer = window.setTimeout(() => {
			owlbearSyncTimer = null;
			void flushOwlbearSync();
		}, 250);
	}

	async function flushOwlbearSync() {
		owlbearSyncInFlight = true;
		let sentVersion = -1;
		try {
			do {
				sentVersion = owlbearSyncVersion;
				await onOwlbearTurnChanged(await createOwlbearSnapshotWithImages());
			} while (sentVersion !== owlbearSyncVersion);
		} catch {
			// Background sync failures must not interrupt initiative editing.
		} finally {
			owlbearSyncInFlight = false;
			if (sentVersion !== owlbearSyncVersion) queueOwlbearSync();
		}
	}

	const runEditable = (action: () => void) => {
		if (!isEditable) return;
		action();
	};

	const setEncounterName = (name: string) => {
		runEditable(() => encounterManager.setName(name));
	};

	const setValue = (
		id: number,
		field: keyof EncounterParticipant,
		value: any,
	) => {
		runEditable(() => encounterManager.setParticipantValue(id, field, value));
	};

	const sortByInitiative = () => {
		runEditable(() => encounterManager.sortByInitiative());
	};

	const stopEncounter = () => {
		runEditable(() => encounterManager.stopEncounter());
	};

	const onPlayNext = () => {
		runEditable(() => {
			if (trackerState.current.activeParticipantIndex == null) {
				encounterManager.startEncounter();
			} else {
				encounterManager.nextStepEncounter();
			}
		});
	};

	const addParticipant = () => {
		runEditable(() => encounterManager.addParticipant());
	};

	const removeParticipant = (id: number) => {
		runEditable(() => encounterManager.removeParticipant(id));
	};

	const toggleDead = (id: number) => {
		runEditable(() => encounterManager.toggleDead(id));
	};

	const onOpenStatblock = (p: EncounterParticipant) => {
		if (p.url) onPortraitClick(p.url);
	};

	const onOpenConditionDetails = (url: string) => {
		if (url) onConditionClick(url);
	};

	const copyEncounter = async () => {
		await copyEncounterToClipboard(trackerState.current.encounter);
	};

	const sendOwlbearSnapshot = async () => {
		const snapshot = await createOwlbearSnapshotWithImages();
		try {
			await onOwlbearSnapshotCreated(snapshot);
			owlbearSynced = true;
			new Notice("Столкновение отправлено в Owlbear.");
		} catch (error) {
			new Notice(error instanceof Error ? error.message : "Не удалось отправить столкновение в Owlbear.");
		}
	};

	async function createOwlbearSnapshotWithImages(): Promise<OwlbearEncounterSnapshot> {
		const snapshot = createOwlbearEncounterSnapshot(trackerState.current, owlbearEncounterId);
		const participants = await Promise.all(snapshot.participants.map(async (participant) => {
			const image = await loadParticipantImage(participant.name, participant.imageUrl);
			return {
				...participant,
				imageDataUrl: image.dataUrl,
				imageWidth: image.width,
				imageHeight: image.height,
			};
		}));
		return { ...snapshot, participants };
	}

	const loadParticipantImage = async (name: string, url: string | undefined): Promise<{ dataUrl: string; width: number; height: number }> => {
		if (!url) throw new Error(`У участника «${name}» нет изображения токена.`);
		try {
			let dataUrl: string;
			if (/^data:image\//i.test(url)) dataUrl = url;
			else {
				const localPath = getVaultImagePath(url);
				if (localPath) {
					const bytes = new Uint8Array(await app.vault.adapter.readBinary(localPath));
					dataUrl = createImageDataUrl(bytes, mimeForImagePath(localPath));
				} else {
					const response = await requestUrl({ url });
					if (response.status < 200 || response.status >= 300) throw new Error(`HTTP ${response.status}`);
					const mime = response.headers["content-type"]?.split(";", 1)[0] || mimeForImagePath(url);
					if (!mime.startsWith("image/")) throw new Error("файл не является изображением");
					dataUrl = createImageDataUrl(new Uint8Array(response.arrayBuffer), mime);
				}
			}
			const { width, height } = await getImageDimensions(dataUrl);
			return { dataUrl, width, height };
		} catch (error) {
			const reason = error instanceof Error ? error.message : "неизвестная ошибка";
			throw new Error(`Не удалось загрузить изображение участника «${name}»: ${reason}`);
		}
	};

	const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => {
			if (image.naturalWidth > 0 && image.naturalHeight > 0) {
				resolve({ width: image.naturalWidth, height: image.naturalHeight });
			} else reject(new Error("не удалось определить размеры изображения"));
		};
		image.onerror = () => reject(new Error("не удалось прочитать изображение"));
		image.src = dataUrl;
	});

	const getVaultImagePath = (url: string): string | null => {
		if (url.startsWith("obsidian://")) {
			return decodeURIComponent(new URLSearchParams(url.split("?")[1]).get("file") ?? "") || null;
		}
		return /^(?:https?|app|data):/i.test(url) ? null : url;
	};

	const mimeForImagePath = (path: string): string => {
		const extension = path.split(".").pop()?.toLowerCase();
		if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
		if (extension === "webp") return "image/webp";
		if (extension === "gif") return "image/gif";
		if (extension === "svg") return "image/svg+xml";
		return "image/png";
	};

	const createImageDataUrl = (bytes: Uint8Array, mime: string): string => {
		let binary = "";
		for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
		return `data:${mime};base64,${btoa(binary)}`;
	};

	const pasteEncounter = async () => {
		if (!isEditable) return;

		const clipboard = await getEncounterFromClipboard();
		if (!clipboard) return;

		encounterManager.pasteEncounter(clipboard);
	};

	const pasteParticipant = async () => {
		if (!isEditable) return;

		const participant = await getEncounterParticipantFromClipboard(false);
		if (participant) {
			encounterManager.pasteParticipants([participant]);
			return;
		}

		const clipboardEncounter = await getEncounterFromClipboard();
		if (clipboardEncounter?.participants.length) {
			encounterManager.pasteParticipants(clipboardEncounter.participants);
		}
	};

	const onConditionChange = (participantId: number, condition: EncounterParticipantCondition) => {
		runEditable(() => encounterManager.setCondition(participantId, condition));
	};

	const onConditionDelete = (participantId: number, url: string) => {
		runEditable(() => encounterManager.deleteCondition(participantId, url));
	};

	const onResourcesChange = (
		participantId: number,
		spellSlots: EncounterParticipantSpellSlot[],
		resources: EncounterParticipantResource[],
	) => {
		runEditable(() => encounterManager.setParticipantResources(participantId, spellSlots, resources));
	};

	const onToggleConcentration = (participantId: number) => {
		const participant = trackerState.current.encounter.participants.find((p) => p.id === participantId);
		if (!participant) return;
		setValue(participantId, "isConcentrating", !participant.isConcentrating);
	};

	const undo = () => {
		runEditable(() => encounterManager.undo());
	};

	const redo = () => {
		runEditable(() => encounterManager.redo());
	};

	const clearEncounter = () => {
		runEditable(() => encounterManager.clearEncounter());
	};
</script>

<div class="tracker">
	<header class="topbar">
		<div class="left">
			<div class="roundCompact" aria-label="Раунд">{trackerState.current.round}</div>

			{#if isEditable}
				<input
					class="titleInput inputlike"
					value={trackerState.current.encounter.name ?? "Encounter"}
					oninput={(e) =>
						setEncounterName((e.target as HTMLInputElement).value)}
				/>
			{:else}
				<div class="titleText">
					{trackerState.current.encounter.name ?? "Encounter"}
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
					class="btn ghost"
					onclick={sendOwlbearSnapshot}
					aria-label="Отправить столкновение в Owlbear"
					title="Отправить столкновение в Owlbear"
				>
					<Download size={16} />
				</button>

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
					disabled={!trackerState.canUndo}
					aria-label="Отменить"
				>
					<Undo size={16} />
				</button>

				<button
					class="btn ghost"
					onclick={redo}
					disabled={!trackerState.canRedo}
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
					aria-label={trackerState.current.activeParticipantIndex == null
						? "Начать столкновение"
						: "Следующий ход"}
				>
					{#if trackerState.current.activeParticipantIndex == null}
						<Play size={16} />
					{:else}
						<StepForward size={16} />
					{/if}
				</button>
			{/if}
		</div>
	</header>

	<div class="tracker-content">
		{#if trackerState.current.encounter.participants.length === 0}
			<div class="empty">
				<Skull size={18} />
				<span>No participants yet.</span>
			</div>
		{:else}
			<div class="list">
				{#each trackerState.current.encounter.participants as participant, index (participant.id)}
					<ParticipantItem
						participant={participant}
						isEditable={isEditable}
						isActive={trackerState.current.activeParticipantIndex === index}
						onOpenStatblock={onOpenStatblock}
						onOpenConditionDetails={onOpenConditionDetails}
						onSetValue={setValue}
						onToggleDead={toggleDead}
						onRemove={removeParticipant}
						onConditionChange={onConditionChange}
						onConditionDelete={onConditionDelete}
						onResourcesChange={onResourcesChange}
						onToggleConcentration={onToggleConcentration}
						getRound={() => trackerState.current.round}
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
		box-sizing: border-box;
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
		flex: 0 0 auto;
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
		grid-template-columns: repeat(9, 32px);
		justify-content: flex-end;
	}

	@container (max-width: 520px) {
		.actions.editableActions {
			grid-template-columns: repeat(5, 32px);
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
