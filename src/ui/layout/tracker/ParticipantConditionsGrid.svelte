<script lang="ts">
	import { onDestroy, tick, untrack } from "svelte";
	import { Check, CirclePlus, Info, X, Infinity, Minus, Plus } from "lucide-svelte";
	import type {
		EncounterParticipantCondition,
		EncounterParticipantResource,
		EncounterParticipantSpellSlot,
	} from "../../../domain/models/encounter/EncounterParticipant";
	import { Blinded, Charmed, Deafened, Exhaustion, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious } from "../../components/icons";
	import ParticipantResourcesControl from "./ParticipantResourcesControl.svelte";

	type ConditionDef = {
		url: string;
		title: string;
		icon: any;
	};

	type OverlayPosition = {
		x: number;
		y: number;
	};

	const conditions: ConditionDef[] = [
		{ url: "/screens/unconscious", title: "Бессознательный / Unconscious", icon: Unconscious },
		{ url: "/screens/frightened", title: "Испуганный / Frightened", icon: Frightened },
		{ url: "/screens/exhaustion", title: "Истощенный / Exhaustion", icon: Exhaustion },

		{ url: "/screens/invisible", title: "Невидимый / Invisible", icon: Invisible },
		{ url: "/screens/incapacitated", title: "Недееспособный / Incapacitated", icon: Incapacitated },
		{ url: "/screens/deafened", title: "Оглохший / Deafened", icon: Deafened },

		{ url: "/screens/petrified", title: "Окаменевший / Petrified", icon: Petrified },
		{ url: "/screens/restrained", title: "Опутанный / Restrained", icon: Restrained },
		{ url: "/screens/blinded", title: "Ослеплённый / Blinded", icon: Blinded },

		{ url: "/screens/poisoned", title: "Отравленный / Poisoned", icon: Poisoned },
		{ url: "/screens/charmed", title: "Очарованный / Charmed", icon: Charmed },
		{ url: "/screens/stunned", title: "Ошеломлённый / Stunned", icon: Stunned },

		{ url: "/screens/paralyzed", title: "Парализованный / Paralyzed", icon: Paralyzed },
		{ url: "/screens/condition_prone", title: "Сбитый с ног / Prone", icon: Prone },
		{ url: "/screens/grappled", title: "Схваченный / Grappled", icon: Grappled }
	];

	let {
		isEditable,
		onOpenConditionDetails,
		onChange,
		onDelete,
		onResourcesChange,
		getRound,
		getConditions,
		getSpellSlots,
		getResources,
	} = $props<{
		isEditable: boolean;
		onOpenConditionDetails: (url: string) => void;
		onChange: (condition: EncounterParticipantCondition) => void;
		onDelete: (url: string) => void;
		onResourcesChange: (
			spellSlots: EncounterParticipantSpellSlot[],
			resources: EncounterParticipantResource[],
		) => void;
		getRound: () => number;
		getConditions: () => EncounterParticipantCondition[];
		getSpellSlots: () => EncounterParticipantSpellSlot[];
		getResources: () => EncounterParticipantResource[];
	}>();

	let openUrl: string | null = $state(null);
	let roundsRemain = $state(0);
	let popoverEl: HTMLDivElement | null = $state(null);
	let pickerEl: HTMLDivElement | null = $state(null);
	let pickerOpen = $state(false);
	let popoverPosition = $state<OverlayPosition>({ x: 0, y: 0 });
	let pickerPosition = $state<OverlayPosition>({ x: 0, y: 0 });

	let portalRoot: HTMLDivElement | null = null;

	onDestroy(() => {
		portalRoot?.remove();
		portalRoot = null;
	});

	const currentRound: number = $derived(getRound());
	const participantConditions: EncounterParticipantCondition[] = $derived(getConditions());
	const conditionByUrl: Map<string, EncounterParticipantCondition> = $derived(new Map(participantConditions.map((condition) => [condition.url, condition])));
	const activeConditions = $derived(conditions
		.map((definition) => ({ definition, condition: conditionFor(definition.url) }))
		.filter((entry): entry is { definition: ConditionDef; condition: EncounterParticipantCondition } => isActive(entry.condition))
	);
	const inactiveConditions = $derived(conditions.filter((condition) => !isActive(conditionFor(condition.url))));

	$effect(() => {
		const expiredUrls = participantConditions
			.filter((c) => c.expiresOnRound != null && c.expiresOnRound <= currentRound)
			.map((c) => c.url);

		if (expiredUrls.length === 0) return;

		queueMicrotask(() => {
			untrack(() => {
				for (const url of expiredUrls) onDelete(url);
			});
		});
	});

	function conditionFor(url: string): EncounterParticipantCondition | undefined {
		return conditionByUrl.get(url);
	}

	function isActive(condition: EncounterParticipantCondition | undefined): boolean {
		if (!condition) {
			return false;
		}

		const expiresOnRound = condition.expiresOnRound ?? 1000;
		return expiresOnRound > currentRound;
	}

	function remainingRoundsFor(condition: EncounterParticipantCondition) {
		if (condition.expiresOnRound == null) return null;
		return Math.max(0, condition.expiresOnRound - currentRound);
	}

	function openPopover(e: KeyboardEvent | MouseEvent, url: string, closePicker = true) {
		if (!isEditable) return;

		e.stopPropagation();
		if (closePicker) pickerOpen = false;
		openUrl = url;

		const current = conditionFor(url);
		roundsRemain = current && current.expiresOnRound
			? Math.max(1, current.expiresOnRound - currentRound)
			: 1;

		positionOverlay(e.currentTarget as HTMLElement, () => popoverEl, popoverPosition);
	}

	function togglePicker(e: KeyboardEvent | MouseEvent) {
		if (!isEditable) return;

		e.stopPropagation();
		openUrl = null;
		pickerOpen = !pickerOpen;

		if (pickerOpen) {
			positionOverlay(e.currentTarget as HTMLElement, () => pickerEl, pickerPosition);
		}
	}

	function closePopovers() {
		pickerOpen = false;
		openUrl = null;
		roundsRemain = 0;
	}

	function setCondition(url: string, expiresOnRound: number | null) {
		onChange({ url, expiresOnRound } as EncounterParticipantCondition);
		closePopovers();
	}

	function onInfinityClick(url: string) {
		setCondition(url, null);
	}

	function onApplyClick(url: string) {
		setCondition(url, roundsRemain + currentRound);
	}

	function onRemoveClick(url: string) {
		onDelete(url);
		closePopovers();
	}

	function handleActivation(event: KeyboardEvent, callback: () => void) {
		if (event.key !== "Enter" && event.key !== " ") {
			return;
		}

		callback();
	}

	async function positionOverlay(anchor: HTMLElement, getOverlay: () => HTMLElement | null, position: OverlayPosition) {
		const r = anchor.getBoundingClientRect();

		position.x = r.left;
		position.y = r.bottom + 6;

		await tick();

		const overlay = getOverlay();
		if (!overlay) {
			return;
		}

		const pr = overlay.getBoundingClientRect();
		const pad = 8;

		if (position.x + pr.width > window.innerWidth - pad) {
			position.x = Math.max(pad, window.innerWidth - pad - pr.width);
		}

		if (position.y + pr.height > window.innerHeight - pad) {
			position.y = r.top - pr.height - 6;
		}

		if (position.y < pad) {
			position.y = pad;
		}
	}

	function ensurePortalRoot() {
		if (portalRoot) return portalRoot;

		portalRoot = document.createElement("div");
		portalRoot.className = "dnd-dm-conditions-popover-root";
		document.body.appendChild(portalRoot);

		return portalRoot;
	}

	function portal(node: HTMLElement) {
		const root = ensurePortalRoot();

		const placeholder = document.createComment("popover-portal");
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
			}
		};
	}

</script>

{#snippet conditionEditPopover(c: ConditionDef)}
	{#if openUrl === c.url}
		<div
			class="popover"
			use:portal
			bind:this={popoverEl}
			style="left:{popoverPosition.x}px; top:{popoverPosition.y}px;"
			aria-label={c.title}
			role="button"
			tabindex="0"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => handleActivation(e, () => e.stopPropagation())}
		>
			<div>
				<strong>{c.title}</strong>
			</div>
			<div class="popover-line">
				<div
					class="popover-item"
					onclick={() => onInfinityClick(c.url)}
					role="button"
					tabindex="0"
					onkeydown={(e) => handleActivation(e, () => onInfinityClick(c.url))}
				>
					<Infinity size={16} />
				</div>

				<div
					class="popover-item popover-group-start"
					onclick={() => roundsRemain = Math.max(1, roundsRemain - 1)}
					role="button"
					tabindex="0"
					onkeydown={(e) => handleActivation(e, () => roundsRemain = Math.max(1, roundsRemain - 1))}
				>
					<Minus size={16} />
				</div>
				<input class="rounds-input popover-item" type="number" min="1" bind:value={roundsRemain} />
				<div
					class="popover-item"
					onclick={() => roundsRemain++}
					role="button"
					tabindex="0"
					onkeydown={(e) => handleActivation(e, () => roundsRemain++)}
				>
					<Plus size={16} />
				</div>

				<div
					class="popover-item popover-action-start"
					onclick={() => onApplyClick(c.url)}
					role="button"
					tabindex="0"
					onkeydown={(e) => handleActivation(e, () => onApplyClick(c.url))}
				>
					<Check size={16}/>
				</div>

				<div
					class="popover-item"
					onclick={() => onRemoveClick(c.url)}
					role="button"
					tabindex="0"
					onkeydown={(e) => handleActivation(e, () => onRemoveClick(c.url))}
				>
					<X size={16}/>
				</div>

				<div
					class="popover-item popover-group-start"
					onclick={() => onOpenConditionDetails(c.url)}
					role="button"
					tabindex="0"
					onkeydown={(e) => handleActivation(e, () => onOpenConditionDetails(c.url))}
				>
					<Info size={16}/>
				</div>
			</div>
		</div>

	{/if}
{/snippet}

<div class="conditions-grid">
	{#if isEditable}
		<div class="condition condition-picker">
			<div
				class="cell add-cell"
				aria-expanded={pickerOpen}
				aria-label="Добавить состояние"
				role="button"
				tabindex="0"
				onclick={togglePicker}
				onkeydown={(e) => handleActivation(e, () => togglePicker(e))}
			>
				<CirclePlus size={20} />
			</div>

			{#if pickerOpen}
				<div
					class="popover picker-popover"
					use:portal
					bind:this={pickerEl}
					style="left:{pickerPosition.x}px; top:{pickerPosition.y}px;"
					aria-label="Добавить состояние"
					role="button"
					tabindex="0"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => handleActivation(e, () => e.stopPropagation())}
				>
					<div class="picker-grid">
						{#each inactiveConditions as c}
							<div class="condition">
								<div
									class="cell"
									data-active="false"
									aria-pressed="false"
									aria-label={c.title}
									role="button"
									tabindex="0"
									onclick={(e) => openPopover(e, c.url, false)}
									onkeydown={(e) => handleActivation(e, () => openPopover(e, c.url, false))}
								>
									<c.icon class="condition-icon" alt={c.title} />
								</div>

								{@render conditionEditPopover(c)}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<ParticipantResourcesControl
			{isEditable}
			{onResourcesChange}
			{getSpellSlots}
			{getResources}
		/>
	{/if}

	{#each activeConditions as { definition: c, condition }}
		{@const remainingRounds = remainingRoundsFor(condition)}
		<div class="condition">
			<div
				class="cell active"
				data-active="true"
				aria-pressed="true"
				aria-label={c.title}
				role="button"
				tabindex="0"
				onclick={(e) => openPopover(e, c.url)}
				onkeydown={(e) => handleActivation(e, () => openPopover(e, c.url))}
			>
				<c.icon class="condition-icon" alt={c.title} />

				{#if remainingRounds !== null}
					<span class="badge">{remainingRounds}</span>
				{/if}
			</div>

			{@render conditionEditPopover(c)}
		</div>
	{/each}
</div>

<style>
	.conditions-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-content: stretch;
	}

	.condition {
		position: relative;
	}

	.cell {
		position: relative;
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		cursor: pointer;
		border-radius: 24px;
		background: var(--background-secondary);
		transition: background 0.2s;
	}

	.add-cell {
		color: var(--text-muted);
	}

	.add-cell:hover,
	.add-cell[aria-expanded="true"] {
		background: var(--background-modifier-hover);
		color: var(--text-normal);
	}

	:global(.condition-icon) {
		position: relative;
		width: 24px;
		height: 24px;
		opacity: 0.7;
		border-radius: 24px;
		pointer-events: none;
	}

	.active {
		border-radius: 24px;
		background: var(--interactive-accent);
	}

	.badge {
		position: absolute;
		top: -4px;
		right: -4px;
		background: var(--interactive-accent);
		color: white;
		font-size: 12px;
		font-weight: bold;
		padding: 0 4px;
		border-radius: 8px;
	}

	.popover {
		display: block;
		position: absolute; /* ВАЖНО: absolute внутри portalRoot */
		z-index: 100000;
		background: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		padding: 8px;
		box-shadow: 0 4px 16px rgba(0,0,0,.25);
	}

	.popover-line {
		display: flex;
		flex-direction: row;
		align-items: center;
		align-content: center;
		justify-content: center;
		gap: 4px;
		margin-top: 4px;
	}

	.picker-popover {
		padding: 8px;
	}

	.picker-grid {
		display: grid;
		grid-template-columns: repeat(5, 32px);
		gap: 6px;
	}

	.rounds-input {
		width: 50px;
		text-align: center;
	}

	.popover-item {
		display: flex;
		align-items: center;
		align-content: center;
		justify-content: center;
	}

	.popover-group-start {
		margin-left: 8px;
	}

	.popover-action-start {
		margin-left: 4px;
	}

	:global(.dnd-dm-conditions-popover-root) {
		position: fixed;
		inset: 0;
		z-index: 100000;
		pointer-events: none;
	}

	:global(.dnd-dm-conditions-popover-root) .popover {
		pointer-events: auto;
	}
</style>
