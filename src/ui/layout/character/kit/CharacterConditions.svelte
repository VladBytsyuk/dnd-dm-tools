<script lang="ts">
	import { Info } from "lucide-svelte";
	import {
		Blinded,
		Charmed,
		Deafened,
		Exhaustion,
		Frightened,
		Grappled,
		Incapacitated,
		Invisible,
		Paralyzed,
		Petrified,
		Poisoned,
		Prone,
		Restrained,
		Stunned,
		Unconscious,
	} from "../../../components/icons";

	/**
	 * Simplified conditions grid for character sheet
	 * Toggle-only (no expiration rounds like in initiative tracker)
	 */
	interface Props {
		conditions: string[];
		onChange: (conditions: string[]) => void;
		onOpenConditionDetails?: (url: string) => void;
	}

	let { conditions, onChange, onOpenConditionDetails }: Props = $props();

	type ConditionDef = {
		url: string;
		title: string;
		icon: any;
	};

	const CONDITION_DEFS: ConditionDef[] = [
		{ url: "/screens/unconscious", title: "Бессознательный", icon: Unconscious },
		{ url: "/screens/frightened", title: "Испуганный", icon: Frightened },
		{ url: "/screens/exhaustion", title: "Истощенный", icon: Exhaustion },
		{ url: "/screens/invisible", title: "Невидимый", icon: Invisible },
		{ url: "/screens/incapacitated", title: "Недееспособный", icon: Incapacitated },
		{ url: "/screens/deafened", title: "Оглохший", icon: Deafened },
		{ url: "/screens/petrified", title: "Окаменевший", icon: Petrified },
		{ url: "/screens/restrained", title: "Опутанный", icon: Restrained },
		{ url: "/screens/blinded", title: "Ослеплённый", icon: Blinded },
		{ url: "/screens/poisoned", title: "Отравленный", icon: Poisoned },
		{ url: "/screens/charmed", title: "Очарованный", icon: Charmed },
		{ url: "/screens/stunned", title: "Ошеломлённый", icon: Stunned },
		{ url: "/screens/paralyzed", title: "Парализованный", icon: Paralyzed },
		{ url: "/screens/condition_prone", title: "Сбитый с ног", icon: Prone },
		{ url: "/screens/grappled", title: "Схваченный", icon: Grappled },
	];

	// Fixed 5x3 grid layout for conditions

	function isActive(url: string): boolean {
		return conditions.includes(url);
	}

	function toggleCondition(url: string) {
		if (isActive(url)) {
			onChange(conditions.filter((c) => c !== url));
		} else {
			onChange([...conditions, url]);
		}
	}

	function handleInfo(e: MouseEvent, url: string) {
		e.stopPropagation();
		onOpenConditionDetails?.(url);
	}
</script>

<div class="conditions-container">
	<div class="conditions-header">Состояния</div>
	<div class="conditions-grid">
		{#each CONDITION_DEFS as c}
			<div class="condition" title={c.title}>
				<div
					class="cell {isActive(c.url) ? 'active' : ''}"
					role="button"
					tabindex="0"
					aria-pressed={isActive(c.url)}
					aria-label={c.title}
					onclick={() => toggleCondition(c.url)}
					onkeydown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							toggleCondition(c.url);
						}
					}}
				>
					<c.icon class="icon" alt={c.title} />
					{#if onOpenConditionDetails}
						<button
							class="info-button"
							onclick={(e) => handleInfo(e, c.url)}
							aria-label="Информация о {c.title}"
						>
							<Info size={10} />
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.conditions-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
	}

	.conditions-header {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-muted);
		text-align: center;
	}

	.conditions-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 6px;
	}

	.condition {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.cell {
		position: relative;
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		cursor: pointer;
		border-radius: 50%;
		background: var(--background-primary);
		border: 2px solid var(--background-modifier-border);
		transition:
			background 0.2s,
			border-color 0.2s;
	}

	.cell:hover {
		border-color: var(--interactive-accent);
	}

	.cell.active {
		background: var(--interactive-accent);
		border-color: var(--interactive-accent);
	}

	.info-button {
		position: absolute;
		top: -2px;
		right: -2px;
		padding: 2px;
		background: var(--background-primary);
		border: 1px solid var(--background-modifier-border);
		border-radius: 50%;
		cursor: pointer;
		color: var(--text-muted);
		opacity: 0;
		transition: opacity 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
	}

	.condition:hover .info-button {
		opacity: 1;
	}

	.info-button:hover {
		color: var(--interactive-accent);
		background: var(--background-secondary);
	}
</style>
