<script lang="ts">
	import { onMount, onDestroy, tick } from "svelte";
	import { Check, Info, X, Infinity, Minus, Plus } from "lucide-svelte";
	import type { EncounterParticipantCondition } from "../../../domain/models/encounter/EncounterParticipant";
  
	type ConditionDef = {
		url: string;
		title: string;
		iconSrc: string;
	};

	const conditions: ConditionDef[] = [
		{ url: "/screens/unconscious", title: "Бессознательный / Unconscious", iconSrc: "src/assets/icons/conditions/unconscious.svg" },
		{ url: "/screens/frightened", title: "Испуганный / Frightened", iconSrc: "src/assets/icons/conditions/frightened.svg" },
		{ url: "/screens/exhaustion", title: "Истощенный / Exhaustion", iconSrc: "src/assets/icons/conditions/exhaustion.svg" },

		{ url: "/screens/invisible", title: "Невидимый / Invisible", iconSrc: "src/assets/icons/conditions/invisible.svg" },
		{ url: "/screens/incapacitated", title: "Недееспособный / Incapacitated", iconSrc: "src/assets/icons/conditions/incapacitated.svg" },
		{ url: "/screens/deafened", title: "Оглохший / Deafened", iconSrc: "src/assets/icons/conditions/deafened.svg" },

		{ url: "/screens/petrified", title: "Окаменевший / Petrified", iconSrc: "src/assets/icons/conditions/petrified.svg" },
		{ url: "/screens/restrained", title: "Опутанный / Restrained", iconSrc: "src/assets/icons/conditions/restrained.svg" },
		{ url: "/screens/blinded", title: "Ослеплённый / Blinded", iconSrc: "src/assets/icons/conditions/blinded.svg" },

		{ url: "/screens/poisoned", title: "Отравленный / Poisoned", iconSrc: "src/assets/icons/conditions/poisoned.svg" },
		{ url: "/screens/charmed", title: "Очарованный / Charmed", iconSrc: "src/assets/icons/conditions/charmed.svg" },
		{ url: "/screens/stunned", title: "Ошеломлённый / Stunned", iconSrc: "src/assets/icons/conditions/stunned.svg" },

		{ url: "/screens/paralyzed", title: "Парализованный / Paralyzed", iconSrc: "src/assets/icons/conditions/paralyzed.svg" },
		{ url: "/screens/condition_prone", title: "Сбитый с ног / Prone", iconSrc: "src/assets/icons/conditions/prone.svg" },
		{ url: "/screens/grappled", title: "Схваченный / Grappled", iconSrc: "src/assets/icons/conditions/grappled.svg" }
	];

	let {
		isEditable,
		onOpenConditionDetails,
		onChange,
		onDelete,
		getRound,
		getConditions,
		resolveIconSrc	
	} = $props<{
		isEditable: boolean;
		onOpenConditionDetails: (url: string) => void;
		onChange: (condition: EncounterParticipantCondition) => void;
		onDelete: (url: string) => void;
		getRound: () => number;
		getConditions: () => EncounterParticipantCondition[];
		resolveIconSrc: (path: string) => string;
	}>();

	let openUrl: string | null = $state(null);
	let roundsRemain = $state(0);
	let layout: "l15" | "l8" | "l5" = $state("l15");
	let popoverEl: HTMLDivElement | null = $state(null);
	let popX = $state(0);
	let popY = $state(0);

	let gridEl: HTMLDivElement | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let portalRoot: HTMLDivElement | null = null;

	onMount(() => {
		if (gridEl) {
			resizeObserver = new ResizeObserver((entries) => {
				const w = entries[0]?.contentRect?.width ?? 0;
				recomputeLayout(w);
			});
			resizeObserver.observe(gridEl);
			recomputeLayout(gridEl.getBoundingClientRect().width);
		}

		ensurePortalRoot();
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
		resizeObserver = null;
		portalRoot?.remove();
		portalRoot = null;
	});

	function getCondition(url: string): EncounterParticipantCondition | undefined {
		return getConditions().find((pc: EncounterParticipantCondition) => pc.url === url);
	}

	function isActive(url: string): boolean {
		const c = getCondition(url);
		if (!c) {
			return false;
		}

		const currentRound = getRound();
		const expiresOnRound = c?.expiresOnRound ?? 1000;
		return expiresOnRound > currentRound;
	}

	function remainingRounds(url: string) {
		const c = getCondition(url);
		if (!c || c.expiresOnRound == null) return null;
		return Math.max(0, c.expiresOnRound - getRound());
	}

	function openPopover(e: KeyboardEvent | MouseEvent, url: string) {
		if (!isEditable) return;

		e.stopPropagation();
		openUrl = url;

		const current = getCondition(url);
		roundsRemain = current && current.expiresOnRound
			? Math.max(1, current.expiresOnRound - getRound()) 
			: 1;

		positionPopover(e.currentTarget as HTMLElement);
	}

	function onInfinityClick(url: string) {
		const newCondition = { url: url, expiresOnRound: null } as EncounterParticipantCondition;
		onChange(newCondition);
		openUrl = null;
		roundsRemain = 0;
	}

	function onApplyClick(url: string) {
		const newExpiresOnRound = roundsRemain + getRound();
		const newCondition = { url: url, expiresOnRound: newExpiresOnRound } as EncounterParticipantCondition;
		onChange(newCondition);
		openUrl = null;
		roundsRemain = 0;
	}

	function onRemoveClick(url: string) {
		onDelete(url);
		openUrl = null;
		roundsRemain = 0;
	}

	function recomputeLayout(width: number) {
		if (width <= 480) layout = "l8";
		else layout = "l15";
	}

	async function positionPopover(anchor: HTMLElement) {
		const r = anchor.getBoundingClientRect();

		popX = r.left;
		popY = r.bottom + 6;

		await tick();

		if (!popoverEl) {
			return;
		}

		const pr = popoverEl.getBoundingClientRect();
		const pad = 8;

		if (popX + pr.width > window.innerWidth - pad) {
			popX = Math.max(pad, window.innerWidth - pad - pr.width);
		}

		if (popY + pr.height > window.innerHeight - pad) {
			popY = r.top - pr.height - 6;
		}

		if (popY < pad) {
			popY = pad;
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

<div class="conditions-grid {layout}" bind:this={gridEl}>
	{#each conditions as c}
		<div class="condition">
			<div
				class="cell {isActive(c.url) ? 'active' : ''}"
				data-active={isActive(c.url)}
				aria-pressed={isActive(c.url)}
				aria-label={c.title}
				role="button"
				tabindex="0"
				onclick={(e) => openPopover(e, c.url)}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { openPopover(e, c.url) } }}
			>
				<img class="icon" src={resolveIconSrc(c.iconSrc)} alt={c.title} />

				{#if isActive(c.url) && remainingRounds(c.url) !== null}
					<span class="badge">{remainingRounds(c.url)}</span>
				{/if}
			</div>

			{#if openUrl === c.url}
				<div 
					class="popover"   
					use:portal
					bind:this={popoverEl}
					style="left:{popX}px; top:{popY}px;"
					aria-label={c.title}
					role="button"
					tabindex="0"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation() } }}
				>
					<div>
						<strong>{c.title}</strong>
					</div>
					<div class="popover-line">
						<div 
							class="popover-item"
							onclick={() => { onInfinityClick(c.url) }}
							role="button"
							tabindex="0"
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onInfinityClick(c.url) } }}
						>
							<Infinity size={16} />
						</div>

						<div style="width: 8px;"></div>

						<div 
							class="popover-item"
							onclick={() => roundsRemain = Math.max(1, roundsRemain - 1)}
							role="button"
							tabindex="0"
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { roundsRemain = Math.max(1, roundsRemain - 1) } }}
						>
							<Minus size={16} />
						</div>
						<input class="rounds-input popover-item" type="number" min="1" bind:value={roundsRemain} />
						<div 
							class="popover-item"
							onclick={() => roundsRemain++}
							role="button"
							tabindex="0"
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { roundsRemain++ } }}
						>
							<Plus size={16} />
						</div>
						
						<div style="width: 4px;"></div>

						<div 
							class="popover-item"
							onclick={() => onApplyClick(c.url)}
							role="button"
							tabindex="0"
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onApplyClick(c.url) } }}
						>
							<Check size={16}/>
						</div>

						<div
							class="popover-item"
							onclick={() => onRemoveClick(c.url)}
							role="button"
							tabindex="0"
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onRemoveClick(c.url) } }}
						>
							<X size={16}/>
						</div>


						<div style="width: 8px;"></div>

						<div 
							class="popover-item"
							onclick={() => onOpenConditionDetails(c.url)}
							role="button"
							tabindex="0"
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onOpenConditionDetails(c.url) } }}
						>
							<Info size={16}/>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.conditions-grid {
		display: grid;
		align-content: stretch;
	}

	/* 15x1 */
	.conditions-grid.l15 {
		grid-template-columns: repeat(15, 1fr);
		grid-template-rows: repeat(1, 1fr);
	}

	/* 8x2 */
	.conditions-grid.l8 {
		grid-template-columns: repeat(8, 1fr);
		grid-template-rows: repeat(2, 1fr);
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

	.icon {
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

	.dnd-dm-conditions-popover-root {
		position: fixed;
		inset: 0;
		z-index: 100000;
		pointer-events: none;
	}

	.dnd-dm-conditions-popover-root .popover {
		pointer-events: auto;
	}
</style>